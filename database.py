"""
LifeSaver Blood Bank – Donor and Inventory Management System
Database Layer: MySQL Connector with Connection Pooling and Transaction Management
"""

import os
import mysql.connector
from mysql.connector import pooling, Error
from dotenv import load_dotenv

load_dotenv()

# Database configuration from environment variables or defaults
DB_CONFIG = {
    'host': os.environ.get('MYSQL_HOST', 'localhost'),
    'port': int(os.environ.get('MYSQL_PORT', 3306)),
    'user': os.environ.get('MYSQL_USER', 'root'),
    'password': os.environ.get('MYSQL_PASSWORD', 'root123'),
    'database': os.environ.get('MYSQL_DATABASE', 'lifesaver_db'),
    'charset': 'utf8mb4',
    'collation': 'utf8mb4_unicode_ci',
    'autocommit': False,  # Strict manual commit for transaction safety
    'pool_name': 'lifesaver_pool',
    'pool_size': 5,
    'pool_reset_session': True
}

_connection_pool = None

def init_connection_pool():
    """Initializes the MySQL connection pool."""
    global _connection_pool
    try:
        _connection_pool = pooling.MySQLConnectionPool(**DB_CONFIG)
        print("[DATABASE] Connection pool established successfully.")
        return _connection_pool
    except Error as e:
        print(f"[DATABASE ERROR] Could not initialize connection pool: {e}")
        return None

def get_db_connection():
    """
    Retrieves a connection from the pool.
    Initializes the pool if not already initialized.
    """
    global _connection_pool
    if _connection_pool is None:
        init_connection_pool()
    
    if _connection_pool is None:
        # Direct fallback attempt if pool failed
        try:
            cfg = DB_CONFIG.copy()
            cfg.pop('pool_name', None)
            cfg.pop('pool_size', None)
            cfg.pop('pool_reset_session', None)
            return mysql.connector.connect(**cfg)
        except Error as e:
            raise ConnectionError(f"Database connection failed: {e}")
            
    return _connection_pool.get_connection()

def query_db(query, args=(), one=False):
    """
    Executes a read-only SELECT query with parameterization.
    Returns results as dictionaries.
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, args)
        rv = cursor.fetchall()
        return (rv[0] if rv else None) if one else rv
    except Error as e:
        print(f"[SQL ERROR in query_db]: {e}")
        raise e
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def execute_db(query, args=(), commit=True):
    """
    Executes an INSERT, UPDATE, or DELETE query with parameterization.
    Returns the lastrowid or affected rows.
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(query, args)
        if commit:
            conn.commit()
        last_id = cursor.lastrowid
        row_count = cursor.rowcount
        return last_id if last_id else row_count
    except Error as e:
        if conn:
            conn.rollback()
        print(f"[SQL ERROR in execute_db]: {e}")
        raise e
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def approve_blood_request_transaction(request_id, units_required, blood_group, admin_notes=""):
    """
    Atomic transaction:
    1. Checks if available_units >= units_required
    2. Deducts units from blood_inventory
    3. Updates blood_requests status to 'Approved'
    Rolls back automatically if stock is insufficient or if any error occurs.
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        conn.autocommit = False
        cursor = conn.cursor(dictionary=True)

        # 1. Lock and check available inventory
        cursor.execute(
            "SELECT available_units FROM blood_inventory WHERE blood_group = %s FOR UPDATE",
            (blood_group,)
        )
        row = cursor.fetchone()
        if not row:
            conn.rollback()
            return False, f"Blood group '{blood_group}' not found in inventory."
        
        available = row['available_units']
        if available < units_required:
            conn.rollback()
            return False, f"Insufficient stock: requested {units_required} units, but only {available} units available."

        # 2. Deduct inventory safely
        new_units = available - units_required
        cursor.execute(
            "UPDATE blood_inventory SET available_units = %s, last_updated = CURRENT_TIMESTAMP WHERE blood_group = %s",
            (new_units, blood_group)
        )

        # 3. Update request status to Approved
        cursor.execute(
            """UPDATE blood_requests 
               SET status = 'Approved', admin_notes = %s, processed_at = CURRENT_TIMESTAMP 
               WHERE request_id = %s""",
            (admin_notes, request_id)
        )

        conn.commit()
        return True, f"Request #{request_id} successfully approved. Deducted {units_required} units of {blood_group}. Remaining: {new_units}."
    except Error as e:
        if conn:
            conn.rollback()
        print(f"[TRANSACTION ERROR]: {e}")
        return False, f"Transaction error: {e}"
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
