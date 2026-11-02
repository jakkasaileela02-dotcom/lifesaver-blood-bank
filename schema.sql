-- ============================================================================
-- LifeSaver Blood Bank – Donor and Inventory Management System
-- Database Schema: MySQL 8.0+
-- File: schema.sql
-- ============================================================================

CREATE DATABASE IF NOT EXISTS lifesaver_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lifesaver_db;

-- ----------------------------------------------------------------------------
-- Table: admins
-- Stores administrative credentials and profile data
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS donation_records;
DROP TABLE IF EXISTS blood_requests;
DROP TABLE IF EXISTS blood_inventory;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS donors;
DROP TABLE IF EXISTS admins;

CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(30) DEFAULT 'Super Administrator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Table: donors
-- Stores voluntary blood donor details, eligibility, and availability
-- ----------------------------------------------------------------------------
CREATE TABLE donors (
    donor_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    age INT NOT NULL CHECK (age >= 18 AND age <= 65),
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    last_donation_date DATE NULL,
    is_available BOOLEAN DEFAULT TRUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_blood_group (blood_group),
    INDEX idx_donor_availability (is_available)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Table: patients
-- Stores patient records requiring blood transfusions
-- ----------------------------------------------------------------------------
CREATE TABLE patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    hospital_name VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_patient_blood (blood_group)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Table: blood_inventory
-- Real-time stock tracking for each of the 8 blood groups
-- ----------------------------------------------------------------------------
CREATE TABLE blood_inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL UNIQUE,
    available_units INT NOT NULL DEFAULT 0 CHECK (available_units >= 0),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Table: blood_requests
-- Tracks emergency blood requests from patients / hospital liaisons
-- ----------------------------------------------------------------------------
CREATE TABLE blood_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    units_required INT NOT NULL CHECK (units_required > 0),
    hospital_name VARCHAR(150) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    emergency_priority ENUM('Critical', 'Urgent', 'Standard') NOT NULL DEFAULT 'Urgent',
    status ENUM('Pending', 'Approved', 'Rejected', 'Fulfilled') NOT NULL DEFAULT 'Pending',
    admin_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    INDEX idx_request_status (status),
    INDEX idx_request_priority (emergency_priority)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Table: donation_records
-- Audit log of successful voluntary donations
-- ----------------------------------------------------------------------------
CREATE TABLE donation_records (
    donation_id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT NOT NULL,
    units_donated INT NOT NULL DEFAULT 1 CHECK (units_donated > 0),
    donation_date DATE NOT NULL,
    hemoglobin_level DECIMAL(4, 1) NULL,
    health_notes VARCHAR(255) NULL,
    verified_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES donors(donor_id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES admins(admin_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================================
-- SEED DATA
-- Default administrator (Username: admin, Password: pbkdf2 hash for 'admin123')
-- ============================================================================
INSERT INTO admins (username, password_hash, full_name, email, role) VALUES 
('admin', 'scrypt:32768:8:1$uH34G1k87X9W$33fa97a15998f483c66f7729f2aa94a737e44da23a7bb4ff346d5c66e4a29a4a4b27815f9b456127118182ec8219ae089e933e49e29547d2524b0fa27d0c3ab7', 'Dr. Marcus Vance', 'admin@lifesaver.org', 'Medical Director & Super Admin');

-- Initialize the 8 Blood Groups in Inventory
INSERT INTO blood_inventory (blood_group, available_units) VALUES
('A+', 28),
('A-', 12),
('B+', 34),
('B-', 8),
('AB+', 15),
('AB-', 4),
('O+', 45),
('O-', 6);

-- Sample Donors
INSERT INTO donors (full_name, age, gender, blood_group, phone, email, address, last_donation_date, is_available, password_hash) VALUES
('Elena Rostova', 29, 'Female', 'O+', '+1 (555) 234-8901', 'elena.rostova@example.com', '742 Evergreen Terrace, Springfield', '2026-08-14', TRUE, 'scrypt:32768:8:1$sample$donor123hash'),
('David Chen', 34, 'Male', 'A+', '+1 (555) 345-6712', 'david.chen@example.com', '128 Willow Creek Lane, Metro City', '2026-07-20', TRUE, 'scrypt:32768:8:1$sample$donor123hash'),
('Sarah Jenkins', 24, 'Female', 'O-', '+1 (555) 890-1234', 'sarah.j@example.com', '405 University Ave, Cambridge', '2026-06-10', TRUE, 'scrypt:32768:8:1$sample$donor123hash'),
('Carlos Mendez', 41, 'Male', 'B+', '+1 (555) 456-7890', 'carlos.m@example.com', '910 Oak Street, Austin', '2026-09-02', TRUE, 'scrypt:32768:8:1$sample$donor123hash'),
('Amina Al-Mansoor', 31, 'Female', 'AB+', '+1 (555) 678-9012', 'amina.m@example.com', '332 Harbor Blvd, Seattle', '2026-05-18', FALSE, 'scrypt:32768:8:1$sample$donor123hash'),
('Michael Thorne', 38, 'Male', 'AB-', '+1 (555) 789-0123', 'michael.t@example.com', '55 Highland Road, Denver', '2026-04-12', TRUE, 'scrypt:32768:8:1$sample$donor123hash');

-- Sample Patients
INSERT INTO patients (full_name, age, gender, blood_group, phone, email, hospital_name, password_hash) VALUES
('Robert Sterling', 52, 'Male', 'O+', '+1 (555) 912-3456', 'robert.sterling@example.com', 'Central Metropolitan Hospital', 'scrypt:32768:8:1$sample$patient123hash'),
('Maya Patel', 28, 'Female', 'B-', '+1 (555) 823-4567', 'maya.patel@example.com', 'St. Jude Healthcare Center', 'scrypt:32768:8:1$sample$patient123hash'),
('Liam Henderson', 64, 'Male', 'A-', '+1 (555) 734-5678', 'liam.h@example.com', 'General Memorial Pavilion', 'scrypt:32768:8:1$sample$patient123hash');

-- Sample Blood Requests
INSERT INTO blood_requests (patient_id, patient_name, blood_group, units_required, hospital_name, contact_number, emergency_priority, status, admin_notes, created_at, processed_at) VALUES
(1, 'Robert Sterling', 'O+', 3, 'Central Metropolitan Hospital, ICU Ward 4', '+1 (555) 912-3456', 'Critical', 'Pending', NULL, NOW() - INTERVAL 2 HOUR, NULL),
(2, 'Maya Patel', 'B-', 2, 'St. Jude Healthcare Center, Trauma Bay 2', '+1 (555) 823-4567', 'Critical', 'Approved', 'Cross-matching completed. Units dispatched via cold-chain courier.', NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 4 HOUR),
(3, 'Liam Henderson', 'A-', 1, 'General Memorial Pavilion, Surgery B', '+1 (555) 734-5678', 'Urgent', 'Pending', NULL, NOW() - INTERVAL 8 HOUR, NULL);

-- Sample Donation Records
INSERT INTO donation_records (donor_id, units_donated, donation_date, hemoglobin_level, health_notes, verified_by) VALUES
(1, 1, '2026-08-14', 14.2, 'Vitals optimal. BP 118/76.', 1),
(2, 1, '2026-07-20', 15.0, 'Routine whole blood donation.', 1),
(3, 1, '2026-06-10', 13.6, 'Universal O- donor drive.', 1),
(4, 1, '2026-09-02', 14.8, 'Mobile blood drive donation.', 1);
