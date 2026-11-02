/**
 * LifeSaver Blood Bank – TypeScript Schema Interfaces
 * Perfectly aligned with MySQL schema.sql
 */

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type EmergencyPriority = 'Critical' | 'Urgent' | 'Standard';
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Fulfilled';
export type Gender = 'Male' | 'Female' | 'Other';

export interface Admin {
  admin_id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
}

export interface Donor {
  donor_id: number;
  full_name: string;
  age: number;
  gender: Gender;
  blood_group: BloodGroup;
  phone: string;
  email: string;
  address: string;
  last_donation_date: string | null;
  is_available: boolean;
  total_donations: number;
  created_at: string;
}

export interface Patient {
  patient_id: number;
  full_name: string;
  age: number;
  gender: Gender;
  blood_group: BloodGroup;
  phone: string;
  email: string;
  hospital_name: string;
  created_at: string;
}

export interface BloodInventoryItem {
  inventory_id: number;
  blood_group: BloodGroup;
  available_units: number;
  last_updated: string;
}

export interface BloodRequest {
  request_id: number;
  patient_id: number;
  patient_name: string;
  blood_group: BloodGroup;
  units_required: number;
  hospital_name: string;
  contact_number: string;
  emergency_priority: EmergencyPriority;
  status: RequestStatus;
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
}

export interface DonationRecord {
  donation_id: number;
  donor_id: number;
  donor_name: string;
  blood_group: BloodGroup;
  units_donated: number;
  donation_date: string;
  hemoglobin_level: number;
  health_notes: string;
  verified_by: string;
}
