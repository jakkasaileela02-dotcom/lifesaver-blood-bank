import { BloodInventoryItem, Donor, Patient, BloodRequest, DonationRecord, Admin, BloodGroup } from '../types/bloodBank';

export const INITIAL_ADMIN: Admin = {
  admin_id: 1,
  username: 'admin',
  full_name: 'Dr. Marcus Vance',
  email: 'admin@lifesaver.org',
  role: 'Medical Director & Super Admin'
};

export const INITIAL_INVENTORY: BloodInventoryItem[] = [
  { inventory_id: 1, blood_group: 'A+', available_units: 28, last_updated: '2026-11-01 14:15' },
  { inventory_id: 2, blood_group: 'A-', available_units: 12, last_updated: '2026-11-01 13:40' },
  { inventory_id: 3, blood_group: 'B+', available_units: 34, last_updated: '2026-11-01 15:02' },
  { inventory_id: 4, blood_group: 'B-', available_units: 8, last_updated: '2026-11-01 11:20' },
  { inventory_id: 5, blood_group: 'AB+', available_units: 15, last_updated: '2026-11-01 12:45' },
  { inventory_id: 6, blood_group: 'AB-', available_units: 4, last_updated: '2026-11-01 09:30' },
  { inventory_id: 7, blood_group: 'O+', available_units: 45, last_updated: '2026-11-01 15:10' },
  { inventory_id: 8, blood_group: 'O-', available_units: 6, last_updated: '2026-11-01 10:05' }
];

export const INITIAL_DONORS: Donor[] = [
  {
    donor_id: 1,
    full_name: 'Elena Rostova',
    age: 29,
    gender: 'Female',
    blood_group: 'O+',
    phone: '+1 (555) 234-8901',
    email: 'elena.rostova@example.com',
    address: '742 Evergreen Terrace, Springfield',
    last_donation_date: '2026-08-14',
    is_available: true,
    total_donations: 18,
    created_at: '2026-01-15'
  },
  {
    donor_id: 2,
    full_name: 'David Chen',
    age: 34,
    gender: 'Male',
    blood_group: 'A+',
    phone: '+1 (555) 345-6712',
    email: 'david.chen@example.com',
    address: '128 Willow Creek Lane, Metro City',
    last_donation_date: '2026-07-20',
    is_available: true,
    total_donations: 9,
    created_at: '2026-02-10'
  },
  {
    donor_id: 3,
    full_name: 'Sarah Jenkins',
    age: 24,
    gender: 'Female',
    blood_group: 'O-',
    phone: '+1 (555) 890-1234',
    email: 'sarah.j@example.com',
    address: '405 University Ave, Cambridge',
    last_donation_date: '2026-06-10',
    is_available: true,
    total_donations: 5,
    created_at: '2026-03-22'
  },
  {
    donor_id: 4,
    full_name: 'Carlos Mendez',
    age: 41,
    gender: 'Male',
    blood_group: 'B+',
    phone: '+1 (555) 456-7890',
    email: 'carlos.m@example.com',
    address: '910 Oak Street, Austin',
    last_donation_date: '2026-09-02',
    is_available: true,
    total_donations: 12,
    created_at: '2026-04-05'
  },
  {
    donor_id: 5,
    full_name: 'Amina Al-Mansoor',
    age: 31,
    gender: 'Female',
    blood_group: 'AB+',
    phone: '+1 (555) 678-9012',
    email: 'amina.m@example.com',
    address: '332 Harbor Blvd, Seattle',
    last_donation_date: '2026-05-18',
    is_available: false,
    total_donations: 4,
    created_at: '2026-04-18'
  },
  {
    donor_id: 6,
    full_name: 'Michael Thorne',
    age: 38,
    gender: 'Male',
    blood_group: 'AB-',
    phone: '+1 (555) 789-0123',
    email: 'michael.t@example.com',
    address: '55 Highland Road, Denver',
    last_donation_date: '2026-04-12',
    is_available: true,
    total_donations: 7,
    created_at: '2026-05-30'
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    patient_id: 1,
    full_name: 'Robert Sterling',
    age: 52,
    gender: 'Male',
    blood_group: 'O+',
    phone: '+1 (555) 912-3456',
    email: 'robert.sterling@example.com',
    hospital_name: 'Central Metropolitan Hospital',
    created_at: '2026-10-12'
  },
  {
    patient_id: 2,
    full_name: 'Maya Patel',
    age: 28,
    gender: 'Female',
    blood_group: 'B-',
    phone: '+1 (555) 823-4567',
    email: 'maya.patel@example.com',
    hospital_name: 'St. Jude Healthcare Center',
    created_at: '2026-10-25'
  },
  {
    patient_id: 3,
    full_name: 'Liam Henderson',
    age: 64,
    gender: 'Male',
    blood_group: 'A-',
    phone: '+1 (555) 734-5678',
    email: 'liam.h@example.com',
    hospital_name: 'General Memorial Pavilion',
    created_at: '2026-10-30'
  }
];

export const INITIAL_REQUESTS: BloodRequest[] = [
  {
    request_id: 101,
    patient_id: 1,
    patient_name: 'Robert Sterling',
    blood_group: 'O+',
    units_required: 3,
    hospital_name: 'Central Metropolitan Hospital, ICU Ward 4',
    contact_number: '+1 (555) 912-3456',
    emergency_priority: 'Critical',
    status: 'Pending',
    admin_notes: null,
    created_at: '2026-11-01 13:20',
    processed_at: null
  },
  {
    request_id: 102,
    patient_id: 2,
    patient_name: 'Maya Patel',
    blood_group: 'B-',
    units_required: 2,
    hospital_name: 'St. Jude Healthcare Center, Trauma Bay 2',
    contact_number: '+1 (555) 823-4567',
    emergency_priority: 'Critical',
    status: 'Approved',
    admin_notes: 'Cross-matching completed. 2 units dispatched via cold-chain transit unit #14.',
    created_at: '2026-11-01 10:15',
    processed_at: '2026-11-01 10:45'
  },
  {
    request_id: 103,
    patient_id: 3,
    patient_name: 'Liam Henderson',
    blood_group: 'A-',
    units_required: 1,
    hospital_name: 'General Memorial Pavilion, Surgery B',
    contact_number: '+1 (555) 734-5678',
    emergency_priority: 'Urgent',
    status: 'Pending',
    admin_notes: null,
    created_at: '2026-11-01 14:05',
    processed_at: null
  }
];

export const INITIAL_DONATION_RECORDS: DonationRecord[] = [
  {
    donation_id: 501,
    donor_id: 1,
    donor_name: 'Elena Rostova',
    blood_group: 'O+',
    units_donated: 1,
    donation_date: '2026-08-14',
    hemoglobin_level: 14.2,
    health_notes: 'Vitals optimal. BP 118/76. Whole blood collection 450 mL.',
    verified_by: 'Dr. Marcus Vance'
  },
  {
    donation_id: 502,
    donor_id: 2,
    donor_name: 'David Chen',
    blood_group: 'A+',
    units_donated: 1,
    donation_date: '2026-07-20',
    hemoglobin_level: 15.0,
    health_notes: 'Routine whole blood donation. Excellent recovery.',
    verified_by: 'Dr. Marcus Vance'
  },
  {
    donation_id: 503,
    donor_id: 3,
    donor_name: 'Sarah Jenkins',
    blood_group: 'O-',
    units_donated: 1,
    donation_date: '2026-06-10',
    hemoglobin_level: 13.6,
    health_notes: 'Universal O- donor drive. Cleared for apheresis next.',
    verified_by: 'Dr. Marcus Vance'
  },
  {
    donation_id: 504,
    donor_id: 4,
    donor_name: 'Carlos Mendez',
    blood_group: 'B+',
    units_donated: 1,
    donation_date: '2026-09-02',
    hemoglobin_level: 14.8,
    health_notes: 'Mobile blood drive donation. Stored at 4°C.',
    verified_by: 'Dr. Marcus Vance'
  }
];

export const BLOOD_COMPATIBILITY: Record<BloodGroup, { canReceiveFrom: BloodGroup[]; canDonateTo: BloodGroup[]; description: string }> = {
  'O-': {
    canReceiveFrom: ['O-'],
    canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    description: 'Universal Red Blood Cell Donor: Essential for emergency trauma rooms when recipient blood type is unknown.'
  },
  'O+': {
    canReceiveFrom: ['O+', 'O-'],
    canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
    description: 'Most Common Blood Type: Frequently transfused in clinical surgeries.'
  },
  'A-': {
    canReceiveFrom: ['A-', 'O-'],
    canDonateTo: ['A+', 'A-', 'AB+', 'AB-'],
    description: 'Rare Rh-negative type: Critical for maternal obstetrics and scheduled elective surgeries.'
  },
  'A+': {
    canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
    canDonateTo: ['A+', 'AB+'],
    description: 'Second most common blood type in the global population.'
  },
  'B-': {
    canReceiveFrom: ['B-', 'O-'],
    canDonateTo: ['B+', 'B-', 'AB+', 'AB-'],
    description: 'Rare type found in under 2% of donors: High demand for ongoing sickle cell therapies.'
  },
  'B+': {
    canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
    canDonateTo: ['B+', 'AB+'],
    description: 'Crucial for multi-unit trauma resuscitations and surgical support.'
  },
  'AB-': {
    canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
    canDonateTo: ['AB+', 'AB-'],
    description: 'Rarest blood group: Highly prized universal plasma donor.'
  },
  'AB+': {
    canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    canDonateTo: ['AB+'],
    description: 'Universal Red Blood Cell Recipient: Can safely receive red blood cells from any blood type.'
  }
};
