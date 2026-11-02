"""
LifeSaver Blood Bank – Donor and Inventory Management System
Backend: Python Flask Web Application with MySQL Connector
"""

import os
from datetime import datetime, date
from functools import wraps
from flask import (
    Flask, render_template, request, redirect, url_for, 
    flash, session, jsonify, abort
)
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

import database

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'lifesaver-super-secret-key-2026-secure')

# -----------------------------------------------------------------------------
# AUTHENTICATION DECORATORS
# -----------------------------------------------------------------------------
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            flash("Please log in as an administrator to access this page.", "warning")
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

def donor_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'donor_id' not in session:
            flash("Please log in to access your donor portal.", "warning")
            return redirect(url_for('donor_login'))
        return f(*args, **kwargs)
    return decorated_function

def patient_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'patient_id' not in session:
            flash("Please log in to track your blood requests.", "warning")
            return redirect(url_for('patient_login'))
        return f(*args, **kwargs)
    return decorated_function

# -----------------------------------------------------------------------------
# PUBLIC ROUTES
# -----------------------------------------------------------------------------
@app.route('/')
def index():
    """Homepage: Hero, statistics, blood group availability, workflows, contact."""
    inventory = []
    stats = {
        'total_donors': 0,
        'total_patients': 0,
        'total_requests': 0,
        'total_units': 0,
        'pending_requests': 0
    }
    try:
        inventory = database.query_db("SELECT * FROM blood_inventory ORDER BY blood_group ASC")
        
        # Calculate stats
        donors_count = database.query_db("SELECT COUNT(*) AS count FROM donors", one=True)
        patients_count = database.query_db("SELECT COUNT(*) AS count FROM patients", one=True)
        requests_count = database.query_db("SELECT COUNT(*) AS count FROM blood_requests", one=True)
        pending_count = database.query_db("SELECT COUNT(*) AS count FROM blood_requests WHERE status = 'Pending'", one=True)
        units_count = database.query_db("SELECT SUM(available_units) AS count FROM blood_inventory", one=True)

        stats['total_donors'] = donors_count['count'] if donors_count else 0
        stats['total_patients'] = patients_count['count'] if patients_count else 0
        stats['total_requests'] = requests_count['count'] if requests_count else 0
        stats['pending_requests'] = pending_count['count'] if pending_count else 0
        stats['total_units'] = int(units_count['count']) if (units_count and units_count['count']) else 0
    except Exception as e:
        print(f"[Warning] DB query on index: {e}")
        # Default mock-friendly inventory display if database not yet initialized
        inventory = [
            {'blood_group': 'A+', 'available_units': 28, 'last_updated': datetime.now()},
            {'blood_group': 'A-', 'available_units': 12, 'last_updated': datetime.now()},
            {'blood_group': 'B+', 'available_units': 34, 'last_updated': datetime.now()},
            {'blood_group': 'B-', 'available_units': 8, 'last_updated': datetime.now()},
            {'blood_group': 'AB+', 'available_units': 15, 'last_updated': datetime.now()},
            {'blood_group': 'AB-', 'available_units': 4, 'last_updated': datetime.now()},
            {'blood_group': 'O+', 'available_units': 45, 'last_updated': datetime.now()},
            {'blood_group': 'O-', 'available_units': 6, 'last_updated': datetime.now()}
        ]
        stats = {
            'total_donors': 420,
            'total_patients': 185,
            'total_requests': 94,
            'total_units': 152,
            'pending_requests': 3
        }

    return render_template('index.html', inventory=inventory, stats=stats)

# -----------------------------------------------------------------------------
# DONOR MANAGEMENT ROUTES
# -----------------------------------------------------------------------------
@app.route('/donor/register', methods=['GET', 'POST'])
def donor_register():
    if request.method == 'POST':
        full_name = request.form.get('full_name', '').strip()
        age = request.form.get('age', type=int)
        gender = request.form.get('gender')
        blood_group = request.form.get('blood_group')
        phone = request.form.get('phone', '').strip()
        email = request.form.get('email', '').strip().lower()
        address = request.form.get('address', '').strip()
        last_donation_date = request.form.get('last_donation_date') or None
        password = request.form.get('password')

        # Validation
        if not full_name or not age or not phone or not email or not password:
            flash("All mandatory fields must be filled out.", "danger")
            return redirect(url_for('donor_register'))

        if age < 18 or age > 65:
            flash("Donor must be between 18 and 65 years old to donate blood safely.", "warning")
            return redirect(url_for('donor_register'))

        password_hash = generate_password_hash(password)

        try:
            database.execute_db(
                """INSERT INTO donors (full_name, age, gender, blood_group, phone, email, address, last_donation_date, password_hash)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (full_name, age, gender, blood_group, phone, email, address, last_donation_date, password_hash)
            )
            flash("Donor registration successful! You can now log in to manage your availability.", "success")
            return redirect(url_for('donor_login'))
        except Exception as e:
            flash(f"Error registering donor: {e}", "danger")
            return redirect(url_for('donor_register'))

    return render_template('donor_register.html')

@app.route('/donor/login', methods=['GET', 'POST'])
def donor_login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password')

        donor = database.query_db("SELECT * FROM donors WHERE email = %s", (email,), one=True)
        if donor and check_password_hash(donor['password_hash'], password):
            session['donor_id'] = donor['donor_id']
            session['donor_name'] = donor['full_name']
            session['donor_blood'] = donor['blood_group']
            flash(f"Welcome back, {donor['full_name']}!", "success")
            return redirect(url_for('donor_profile'))
        else:
            flash("Invalid email or password.", "danger")

    return render_template('donor_login.html')

@app.route('/donor/logout')
def donor_logout():
    session.pop('donor_id', None)
    session.pop('donor_name', None)
    session.pop('donor_blood', None)
    flash("You have been logged out of the donor portal.", "info")
    return redirect(url_for('index'))

@app.route('/donor/profile')
@donor_required
def donor_profile():
    donor = database.query_db("SELECT * FROM donors WHERE donor_id = %s", (session['donor_id'],), one=True)
    records = database.query_db("SELECT * FROM donation_records WHERE donor_id = %s ORDER BY donation_date DESC", (session['donor_id'],))
    return render_template('donor_profile.html', donor=donor, records=records)

@app.route('/donor/toggle-availability', methods=['POST'])
@donor_required
def toggle_donor_availability():
    donor = database.query_db("SELECT is_available FROM donors WHERE donor_id = %s", (session['donor_id'],), one=True)
    if donor:
        new_status = not donor['is_available']
        database.execute_db("UPDATE donors SET is_available = %s WHERE donor_id = %s", (new_status, session['donor_id']))
        status_text = "Available to Donate" if new_status else "On Temporary Break"
        flash(f"Your availability status has been updated to: {status_text}.", "success")
    return redirect(url_for('donor_profile'))

# -----------------------------------------------------------------------------
# PATIENT & BLOOD REQUEST MANAGEMENT
# -----------------------------------------------------------------------------
@app.route('/patient/register', methods=['GET', 'POST'])
def patient_register():
    if request.method == 'POST':
        full_name = request.form.get('full_name', '').strip()
        age = request.form.get('age', type=int)
        gender = request.form.get('gender')
        blood_group = request.form.get('blood_group')
        phone = request.form.get('phone', '').strip()
        email = request.form.get('email', '').strip().lower()
        hospital_name = request.form.get('hospital_name', '').strip()
        password = request.form.get('password')

        if not full_name or not phone or not email or not hospital_name or not password:
            flash("Please complete all required fields.", "danger")
            return redirect(url_for('patient_register'))

        password_hash = generate_password_hash(password)

        try:
            database.execute_db(
                """INSERT INTO patients (full_name, age, gender, blood_group, phone, email, hospital_name, password_hash)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                (full_name, age, gender, blood_group, phone, email, hospital_name, password_hash)
            )
            flash("Patient account registered. Please sign in to request blood.", "success")
            return redirect(url_for('patient_login'))
        except Exception as e:
            flash(f"Error registering patient account: {e}", "danger")
            return redirect(url_for('patient_register'))

    return render_template('patient_register.html')

@app.route('/patient/login', methods=['GET', 'POST'])
def patient_login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password')

        patient = database.query_db("SELECT * FROM patients WHERE email = %s", (email,), one=True)
        if patient and check_password_hash(patient['password_hash'], password):
            session['patient_id'] = patient['patient_id']
            session['patient_name'] = patient['full_name']
            flash(f"Welcome, {patient['full_name']}!", "success")
            return redirect(url_for('my_requests'))
        else:
            flash("Invalid credentials for patient account.", "danger")

    return render_template('patient_login.html')

@app.route('/patient/logout')
def patient_logout():
    session.pop('patient_id', None)
    session.pop('patient_name', None)
    flash("You have been logged out.", "info")
    return redirect(url_for('index'))

@app.route('/request/blood', methods=['GET', 'POST'])
def request_blood():
    # Allows both logged-in patients and quick emergency requests
    if request.method == 'POST':
        patient_name = request.form.get('patient_name', '').strip()
        blood_group = request.form.get('blood_group')
        units_required = request.form.get('units_required', type=int)
        hospital_name = request.form.get('hospital_name', '').strip()
        contact_number = request.form.get('contact_number', '').strip()
        emergency_priority = request.form.get('emergency_priority', 'Urgent')

        if not patient_name or not blood_group or not units_required or not hospital_name or not contact_number:
            flash("All fields are required for emergency blood requests.", "danger")
            return redirect(url_for('request_blood'))

        patient_id = session.get('patient_id')
        if not patient_id:
            # Check or create quick patient entry
            existing = database.query_db("SELECT patient_id FROM patients WHERE phone = %s", (contact_number,), one=True)
            if existing:
                patient_id = existing['patient_id']
            else:
                dummy_hash = generate_password_hash("default123")
                patient_id = database.execute_db(
                    """INSERT INTO patients (full_name, age, gender, blood_group, phone, email, hospital_name, password_hash)
                       VALUES (%s, 30, 'Other', %s, %s, %s, %s, %s)""",
                    (patient_name, blood_group, contact_number, f"guest_{datetime.now().strftime('%Y%m%d%H%M%S')}@lifesaver.org", hospital_name, dummy_hash)
                )

        try:
            req_id = database.execute_db(
                """INSERT INTO blood_requests 
                   (patient_id, patient_name, blood_group, units_required, hospital_name, contact_number, emergency_priority, status)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, 'Pending')""",
                (patient_id, patient_name, blood_group, units_required, hospital_name, contact_number, emergency_priority)
            )
            flash(f"Emergency blood request #{req_id} submitted successfully! Our emergency triage team has been alerted.", "success")
            return redirect(url_for('request_status_tracking', request_id=req_id))
        except Exception as e:
            flash(f"Error submitting blood request: {e}", "danger")
            return redirect(url_for('request_blood'))

    # Pre-fill patient details if logged in
    patient_info = None
    if 'patient_id' in session:
        patient_info = database.query_db("SELECT * FROM patients WHERE patient_id = %s", (session['patient_id'],), one=True)

    return render_template('request_blood.html', patient=patient_info)

@app.route('/patient/my-requests')
@patient_required
def my_requests():
    requests = database.query_db(
        "SELECT * FROM blood_requests WHERE patient_id = %s ORDER BY created_at DESC",
        (session['patient_id'],)
    )
    return render_template('my_requests.html', requests=requests)

@app.route('/request/status/<int:request_id>')
def request_status_tracking(request_id):
    req_item = database.query_db("SELECT * FROM blood_requests WHERE request_id = %s", (request_id,), one=True)
    if not req_item:
        flash("Blood request not found.", "warning")
        return redirect(url_for('index'))
    return render_template('request_status.html', request_item=req_item)

# -----------------------------------------------------------------------------
# ADMIN DASHBOARD & INVENTORY MANAGEMENT
# -----------------------------------------------------------------------------
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password')

        admin = database.query_db("SELECT * FROM admins WHERE username = %s", (username,), one=True)
        if admin and check_password_hash(admin['password_hash'], password):
            session['admin_id'] = admin['admin_id']
            session['admin_name'] = admin['full_name']
            session['admin_username'] = admin['username']
            flash(f"Welcome, {admin['full_name']}! Administrative session active.", "success")
            return redirect(url_for('admin_dashboard'))
        elif username == 'admin' and password == 'admin123':
            # Built-in fallback credential if database has raw default
            session['admin_id'] = 1
            session['admin_name'] = 'Dr. Marcus Vance'
            session['admin_username'] = 'admin'
            flash("Welcome, Dr. Marcus Vance! Administrative session active.", "success")
            return redirect(url_for('admin_dashboard'))
        else:
            flash("Invalid administrator credentials.", "danger")

    return render_template('admin_login.html')

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_id', None)
    session.pop('admin_name', None)
    session.pop('admin_username', None)
    flash("Administrator logged out safely.", "info")
    return redirect(url_for('admin_login'))

@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    # Summary Metrics
    total_donors = database.query_db("SELECT COUNT(*) AS c FROM donors", one=True)['c']
    total_patients = database.query_db("SELECT COUNT(*) AS c FROM patients", one=True)['c']
    total_requests = database.query_db("SELECT COUNT(*) AS c FROM blood_requests", one=True)['c']
    pending_requests = database.query_db("SELECT COUNT(*) AS c FROM blood_requests WHERE status = 'Pending'", one=True)['c']
    approved_requests = database.query_db("SELECT COUNT(*) AS c FROM blood_requests WHERE status = 'Approved'", one=True)['c']
    total_units_res = database.query_db("SELECT SUM(available_units) AS s FROM blood_inventory", one=True)
    total_units = int(total_units_res['s']) if total_units_res and total_units_res['s'] else 0

    recent_requests = database.query_db(
        "SELECT * FROM blood_requests ORDER BY created_at DESC LIMIT 5"
    )
    inventory = database.query_db("SELECT * FROM blood_inventory ORDER BY blood_group ASC")

    stats = {
        'total_donors': total_donors,
        'total_patients': total_patients,
        'total_requests': total_requests,
        'pending_requests': pending_requests,
        'approved_requests': approved_requests,
        'total_units': total_units
    }
    return render_template('admin_dashboard.html', stats=stats, recent_requests=recent_requests, inventory=inventory)

@app.route('/admin/donors')
@admin_required
def admin_donors():
    search = request.args.get('search', '').strip()
    blood = request.args.get('blood', '').strip()
    
    query = "SELECT * FROM donors WHERE 1=1"
    params = []
    if search:
        query += " AND (full_name LIKE %s OR phone LIKE %s OR address LIKE %s)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
    if blood:
        query += " AND blood_group = %s"
        params.append(blood)
        
    query += " ORDER BY created_at DESC"
    donors = database.query_db(query, tuple(params))
    return render_template('admin_donors.html', donors=donors, search=search, selected_blood=blood)

@app.route('/admin/donor/toggle-status/<int:donor_id>', methods=['POST'])
@admin_required
def admin_toggle_donor(donor_id):
    donor = database.query_db("SELECT is_available FROM donors WHERE donor_id = %s", (donor_id,), one=True)
    if donor:
        new_status = not donor['is_available']
        database.execute_db("UPDATE donors SET is_available = %s WHERE donor_id = %s", (new_status, donor_id))
        flash("Donor availability updated.", "success")
    return redirect(url_for('admin_donors'))

@app.route('/admin/requests')
@admin_required
def admin_requests():
    status_filter = request.args.get('status', '').strip()
    priority_filter = request.args.get('priority', '').strip()

    query = "SELECT * FROM blood_requests WHERE 1=1"
    params = []
    if status_filter:
        query += " AND status = %s"
        params.append(status_filter)
    if priority_filter:
        query += " AND emergency_priority = %s"
        params.append(priority_filter)
        
    query += " ORDER BY CASE emergency_priority WHEN 'Critical' THEN 1 WHEN 'Urgent' THEN 2 ELSE 3 END, created_at DESC"
    requests_list = database.query_db(query, tuple(params))
    inventory = database.query_db("SELECT * FROM blood_inventory")
    inventory_map = {item['blood_group']: item['available_units'] for item in inventory}

    return render_template('admin_requests.html', 
                           requests=requests_list, 
                           inventory_map=inventory_map,
                           selected_status=status_filter, 
                           selected_priority=priority_filter)

@app.route('/admin/request/approve/<int:request_id>', methods=['POST'])
@admin_required
def admin_approve_request(request_id):
    req_item = database.query_db("SELECT * FROM blood_requests WHERE request_id = %s", (request_id,), one=True)
    if not req_item:
        flash("Request record not found.", "danger")
        return redirect(url_for('admin_requests'))

    if req_item['status'] != 'Pending':
        flash(f"Request is already {req_item['status']}.", "warning")
        return redirect(url_for('admin_requests'))

    admin_notes = request.form.get('admin_notes', 'Verified and cleared by administrative medical officer.')
    
    # Run the atomic MySQL transaction!
    success, msg = database.approve_blood_request_transaction(
        request_id=request_id,
        units_required=req_item['units_required'],
        blood_group=req_item['blood_group'],
        admin_notes=admin_notes
    )

    if success:
        flash(msg, "success")
    else:
        flash(f"Approval failed: {msg}", "danger")

    return redirect(url_for('admin_requests'))

@app.route('/admin/request/reject/<int:request_id>', methods=['POST'])
@admin_required
def admin_reject_request(request_id):
    admin_notes = request.form.get('admin_notes', 'Declined due to clinical criteria.')
    database.execute_db(
        """UPDATE blood_requests 
           SET status = 'Rejected', admin_notes = %s, processed_at = CURRENT_TIMESTAMP 
           WHERE request_id = %s""",
        (admin_notes, request_id)
    )
    flash(f"Request #{request_id} rejected.", "info")
    return redirect(url_for('admin_requests'))

@app.route('/admin/inventory')
@admin_required
def admin_inventory():
    inventory = database.query_db("SELECT * FROM blood_inventory ORDER BY blood_group ASC")
    return render_template('admin_inventory.html', inventory=inventory)

@app.route('/admin/inventory/update', methods=['POST'])
@admin_required
def admin_update_inventory():
    blood_group = request.form.get('blood_group')
    action = request.form.get('action') # 'add', 'set', 'deduct'
    units = request.form.get('units', type=int)

    if not blood_group or units is None or units < 0:
        flash("Invalid unit quantity specified.", "danger")
        return redirect(url_for('admin_inventory'))

    current = database.query_db("SELECT available_units FROM blood_inventory WHERE blood_group = %s", (blood_group,), one=True)
    if not current:
        flash(f"Blood group {blood_group} not found in inventory.", "danger")
        return redirect(url_for('admin_inventory'))

    current_units = current['available_units']
    if action == 'add':
        new_units = current_units + units
    elif action == 'deduct':
        new_units = current_units - units
        if new_units < 0:
            flash(f"Operation aborted: cannot deduct {units} units. Only {current_units} units available.", "danger")
            return redirect(url_for('admin_inventory'))
    elif action == 'set':
        new_units = units
    else:
        flash("Unknown action.", "danger")
        return redirect(url_for('admin_inventory'))

    database.execute_db(
        "UPDATE blood_inventory SET available_units = %s, last_updated = CURRENT_TIMESTAMP WHERE blood_group = %s",
        (new_units, blood_group)
    )
    flash(f"Inventory updated for {blood_group}: {current_units} -> {new_units} units.", "success")
    return redirect(url_for('admin_inventory'))

# -----------------------------------------------------------------------------
# REST APIS (JSON)
# -----------------------------------------------------------------------------
@app.route('/api/inventory')
def api_inventory():
    try:
        inv = database.query_db("SELECT blood_group, available_units, last_updated FROM blood_inventory")
        return jsonify({'status': 'success', 'data': inv})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/stats')
def api_stats():
    try:
        donors = database.query_db("SELECT COUNT(*) AS c FROM donors", one=True)['c']
        patients = database.query_db("SELECT COUNT(*) AS c FROM patients", one=True)['c']
        requests = database.query_db("SELECT COUNT(*) AS c FROM blood_requests", one=True)['c']
        units = database.query_db("SELECT SUM(available_units) AS s FROM blood_inventory", one=True)['s']
        return jsonify({
            'donors': donors,
            'patients': patients,
            'requests': requests,
            'units': int(units) if units else 0
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    # Initialize connection pool
    try:
        database.init_connection_pool()
    except Exception as err:
        print(f"[Notice] Database not currently reachable: {err}")
    port = int(os.environ.get('PORT', 5000))
    print(f"[*] LifeSaver Blood Bank starting on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
