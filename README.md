# LifeSaver Blood Bank – Donor and Inventory Management System

A production-grade, responsive full-stack healthcare web application built with **Python Flask**, **MySQL**, and **Bootstrap 5**. Designed specifically for hospitals, regional blood transfusion centers, and voluntary donor networks, with full suitability for a **College DBMS Project Demonstration**.

---

## 🩸 System Architecture & Technology Stack

- **Backend**: Python 3.10+ & Flask 3.0.3
- **Database**: MySQL 8.0+ (InnoDB Engine)
- **Database Driver**: Python MySQL Connector (`mysql-connector-python`) with Connection Pooling
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3.3
- **Design Language**: Healthcare-themed Deep Red (`#991b1b`), Dark Navy (`#0f172a`), Crisp White
- **Security**: Werkzeug Scrypt password hashing, Parameterized SQL Queries (prevent SQL injection), Atomic MySQL Transactions with Row Locking (`FOR UPDATE`), and Role-Based Session Access Control

---

## 📂 Project Directory Structure

```text
lifesaver-blood-bank/
├── app.py                     # Main Flask Application & Route Controllers
├── database.py                # MySQL Connection Pooling, Transactions & Queries
├── schema.sql                 # MySQL DDL (Tables, Constraints, Indexes) & Seed Data
├── requirements.txt           # Python Dependencies
├── .env.example               # Environment Configuration Template
├── README.md                  # Comprehensive Documentation & Setup Guide
├── templates/                 # Jinja2 HTML5 Templates (Bootstrap 5)
│   ├── base.html              # Core Layout, Navigation & Healthcare Footer
│   ├── index.html             # Homepage, Hero, Availability, Stats & Contact
│   ├── donor_register.html    # Voluntary Donor Registration Form
│   ├── donor_login.html       # Donor Portal Authentication
│   ├── donor_profile.html     # Donor Dashboard, Digital Card & History
│   ├── patient_register.html  # Patient / Hospital Sign-Up
│   ├── patient_login.html     # Patient Login
│   ├── request_blood.html     # Emergency Blood Requisition Form
│   ├── my_requests.html       # Requisition History & Live Tracker
│   ├── request_status.html    # Clinical Progress Stepper for Requisitions
│   ├── admin_login.html       # Staff Administration Login
│   ├── admin_dashboard.html   # Operations Console with KPI Metrics
│   ├── admin_donors.html      # Donor Registry, Search & Status Toggles
│   ├── admin_requests.html    # Triage Queue with Transactional Approval
│   └── admin_inventory.html   # Real-Time Inventory Control (8 Blood Groups)
└── static/
    ├── css/
    │   └── style.css          # Healthcare Custom Styling & Typography
    ├── js/
    │   └── main.js            # Client-Side Validation & Interactions
    └── images/                # Clinical Photography & Brand Assets
```

---

## 🚀 Setup & Execution on Windows (Step-by-Step)

Follow these 5 simple steps to run LifeSaver locally on your Windows machine:

### Step 1: Install Python & MySQL
1. Install **Python 3.10 or higher** from [python.org](https://www.python.org/downloads/). (Make sure to check *"Add Python to PATH"* during installation).
2. Install **MySQL Server 8.0** or **XAMPP** (with MySQL started).

### Step 2: Create the MySQL Database & Import Schema
Open **Command Prompt**, **PowerShell**, or **MySQL Workbench**:

```bash
# If using MySQL Command Line Client:
mysql -u root -p < schema.sql
```

*Or inside MySQL Workbench / XAMPP phpMyAdmin:*
1. Open MySQL Workbench.
2. Open `schema.sql` (File -> Open SQL Script).
3. Click the lightning bolt icon (Execute).
4. Verify that `lifesaver_db` and its 6 relational tables are created with sample records.

### Step 3: Configure Database Credentials
Create a `.env` file in the root directory (or edit `database.py`):
```ini
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password_here
MYSQL_DATABASE=lifesaver_db
SECRET_KEY=lifesaver-super-secret-key-2026-secure
PORT=5000
```

### Step 4: Install Dependencies & Run the Application
Open a terminal in the project folder:

```powershell
# Optional but recommended: Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install required packages
pip install -r requirements.txt

# Run the Flask web application
python app.py
```

### Step 5: Open the Website in Google Chrome
Launch Google Chrome and visit:
```text
http://localhost:5000
```

---

## 🔐 Default Demo Credentials

| Role | Username / Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin` | `admin123` | Full dashboard, stock management, request approvals |
| **Voluntary Donor** | `elena.rostova@example.com` | `donor123` | Availability toggle, donor card, donation history |
| **Hospital / Patient**| `robert.sterling@example.com`| `patient123` | Submit urgent requests, track delivery status |

---

## 🗄️ Database Design (Relational Schema)

### 1. `admins`
Stores clinical administrative credentials, hashed passwords, and contact info.
- `admin_id` (INT PK AI), `username` (VARCHAR 50 UNIQUE), `password_hash`, `full_name`, `email`, `role`, `created_at`.

### 2. `donors`
Tracks voluntary blood donors, physiological eligibility, and availability.
- `donor_id` (INT PK AI), `full_name`, `age` (CHECK 18-65), `gender`, `blood_group` (ENUM 8 types), `phone`, `email` (UNIQUE), `address`, `last_donation_date`, `is_available` (BOOL), `password_hash`, `created_at`.

### 3. `patients`
Tracks patients and hospital wards requiring blood transfusions.
- `patient_id` (INT PK AI), `full_name`, `age`, `gender`, `blood_group`, `phone`, `email` (UNIQUE), `hospital_name`, `password_hash`, `created_at`.

### 4. `blood_inventory`
Live unit inventory for all 8 blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-).
- `inventory_id` (INT PK AI), `blood_group` (ENUM UNIQUE), `available_units` (INT CHECK >= 0), `last_updated`.

### 5. `blood_requests`
Emergency blood requisitions with clinical priority and triage status.
- `request_id` (INT PK AI), `patient_id` (FK -> patients.patient_id), `patient_name`, `blood_group`, `units_required`, `hospital_name`, `contact_number`, `emergency_priority` (Critical / Urgent / Standard), `status` (Pending / Approved / Rejected / Fulfilled), `admin_notes`, `created_at`, `processed_at`.

### 6. `donation_records`
Audit trail of completed voluntary blood donations.
- `donation_id` (INT PK AI), `donor_id` (FK -> donors.donor_id), `units_donated`, `donation_date`, `hemoglobin_level`, `health_notes`, `verified_by` (FK -> admins.admin_id).

---

## 💡 Transaction Safety in Blood Allocation

When an administrator approves a blood request in `database.py`:
1. The system executes a `SELECT ... FOR UPDATE` row lock on `blood_inventory` for the requested blood group.
2. Checks that `available_units >= units_required`.
3. If sufficient, deducts the units and sets `status = 'Approved'` in `blood_requests`.
4. Executes `conn.commit()`.
5. If stock is insufficient or any exception occurs, it issues `conn.rollback()`, ensuring **zero possibility of negative stock or partial updates**.

---

## 🎓 College DBMS Demonstration Viva Questions & Answers

1. **Q: How does the application prevent SQL Injection?**  
   *A:* All queries in `database.py` use parameterized queries with `%s` placeholders supplied as tuples, separating SQL code from user inputs.

2. **Q: Why is InnoDB chosen over MyISAM for the storage engine?**  
   *A:* InnoDB supports ACID transactions, row-level locking (`FOR UPDATE`), and foreign key constraints, which are essential for clinical safety.

3. **Q: How is negative inventory prevented?**  
   *A:* At the database level via `CHECK (available_units >= 0)`, and at the application layer via atomic transactions that verify stock before updating.
