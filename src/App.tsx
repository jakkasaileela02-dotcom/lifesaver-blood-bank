/**
 * LifeSaver Blood Bank – Donor and Inventory Management System
 * Full-Stack Healthcare Web Application
 */

import React, { useState } from 'react';
import { 
  Droplet, Heart, ShieldCheck, Activity, Phone, MapPin, Mail, 
  Clock, CheckCircle2, AlertTriangle, Users, Hospital, Database, 
  FileCode, Star, ArrowRight, ChevronRight, Lock, Award, Truck, Check 
} from 'lucide-react';

import { 
  BloodGroup, BloodInventoryItem, Donor, Patient, BloodRequest, DonationRecord, Admin 
} from './types/bloodBank';
import { 
  INITIAL_ADMIN, INITIAL_INVENTORY, INITIAL_DONORS, 
  INITIAL_PATIENTS, INITIAL_REQUESTS, INITIAL_DONATION_RECORDS, 
  BLOOD_COMPATIBILITY 
} from './data/initialData';

import { DonorModal } from './components/DonorModal';
import { DonorPortalModal } from './components/DonorPortalModal';
import { BloodRequestModal } from './components/BloodRequestModal';
import { PatientPortalModal } from './components/PatientPortalModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { DatabaseViewerModal } from './components/DatabaseViewerModal';

export default function App() {
  // Database / System State
  const [admin] = useState<Admin>(INITIAL_ADMIN);
  const [inventory, setInventory] = useState<BloodInventoryItem[]>(INITIAL_INVENTORY);
  const [donors, setDonors] = useState<Donor[]>(INITIAL_DONORS);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [requests, setRequests] = useState<BloodRequest[]>(INITIAL_REQUESTS);
  const [donationRecords, setDonationRecords] = useState<DonationRecord[]>(INITIAL_DONATION_RECORDS);

  // Active User Sessions
  const [currentDonor, setCurrentDonor] = useState<Donor | null>(null);

  // Modals state
  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);
  const [isDonorPortalOpen, setIsDonorPortalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isPatientPortalOpen, setIsPatientPortalOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [isDatabaseViewerOpen, setIsDatabaseViewerOpen] = useState(false);
  const [selectedBloodForRequest, setSelectedBloodForRequest] = useState<BloodGroup | undefined>(undefined);
  const [showCompatibilityMatrix, setShowCompatibilityMatrix] = useState(false);

  // Contact form state
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // --------------------------------------------------------------------------
  // BUSINESS LOGIC & TRANSACTION HANDLERS
  // --------------------------------------------------------------------------
  
  // Register Donor
  const handleRegisterDonor = (newDonorData: Omit<Donor, 'donor_id' | 'total_donations' | 'created_at'>) => {
    const newId = donors.length > 0 ? Math.max(...donors.map(d => d.donor_id)) + 1 : 1;
    const newDonor: Donor = {
      ...newDonorData,
      donor_id: newId,
      total_donations: 0,
      created_at: new Date().toISOString().split('T')[0]
    };
    setDonors(prev => [newDonor, ...prev]);
    setCurrentDonor(newDonor);
    setIsDonorPortalOpen(true);
  };

  // Donor Login
  const handleLoginDonor = (email: string) => {
    const existing = donors.find(d => d.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentDonor(existing);
      setIsDonorPortalOpen(true);
    } else {
      // Default to first donor for frictionless demonstration if user enters arbitrary email
      setCurrentDonor(donors[0]);
      setIsDonorPortalOpen(true);
    }
  };

  // Toggle Donor Availability
  const handleToggleDonorAvailability = (donorId: number) => {
    setDonors(prev => prev.map(d => {
      if (d.donor_id === donorId) {
        const updated = { ...d, is_available: !d.is_available };
        if (currentDonor && currentDonor.donor_id === donorId) {
          setCurrentDonor(updated);
        }
        return updated;
      }
      return d;
    }));
  };

  // Record a voluntary donation
  const handleLogTestDonation = (donorId: number) => {
    const targetDonor = donors.find(d => d.donor_id === donorId);
    if (!targetDonor) return;

    const newDonationId = donationRecords.length > 0 ? Math.max(...donationRecords.map(r => r.donation_id)) + 1 : 501;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const newRecord: DonationRecord = {
      donation_id: newDonationId,
      donor_id: donorId,
      donor_name: targetDonor.full_name,
      blood_group: targetDonor.blood_group,
      units_donated: 1,
      donation_date: todayStr,
      hemoglobin_level: 14.4,
      health_notes: 'Whole blood collection (450 mL). Post-donation recovery normal.',
      verified_by: admin.full_name
    };

    setDonationRecords(prev => [newRecord, ...prev]);

    // Update donor count and last donation date
    setDonors(prev => prev.map(d => {
      if (d.donor_id === donorId) {
        const updated = {
          ...d,
          total_donations: d.total_donations + 1,
          last_donation_date: todayStr
        };
        if (currentDonor?.donor_id === donorId) {
          setCurrentDonor(updated);
        }
        return updated;
      }
      return d;
    }));

    // Increment inventory for that blood group atomically
    setInventory(prev => prev.map(item => {
      if (item.blood_group === targetDonor.blood_group) {
        return {
          ...item,
          available_units: item.available_units + 1,
          last_updated: `${todayStr} ${now.toTimeString().substring(0, 5)}`
        };
      }
      return item;
    }));
  };

  // Submit Emergency Blood Request
  const handleSubmitRequest = (requestData: Omit<BloodRequest, 'request_id' | 'patient_id' | 'status' | 'admin_notes' | 'created_at' | 'processed_at'>) => {
    const newReqId = requests.length > 0 ? Math.max(...requests.map(r => r.request_id)) + 1 : 101;
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().substring(0, 5)}`;

    const newRequest: BloodRequest = {
      ...requestData,
      request_id: newReqId,
      patient_id: 1,
      status: 'Pending',
      admin_notes: null,
      created_at: timeStr,
      processed_at: null
    };

    setRequests(prev => [newRequest, ...prev]);
    setIsPatientPortalOpen(true);
  };

  // Approve Blood Request Transaction
  const handleApproveRequest = (requestId: number, notes: string): { success: boolean; message: string } => {
    const req = requests.find(r => r.request_id === requestId);
    if (!req) return { success: false, message: 'Request not found' };

    const inv = inventory.find(i => i.blood_group === req.blood_group);
    if (!inv) return { success: false, message: `Blood group ${req.blood_group} not configured.` };

    // Transaction Guard: Check if sufficient units
    if (inv.available_units < req.units_required) {
      return {
        success: false,
        message: `Transaction Aborted: Insufficient stock. Requested ${req.units_required} units of ${req.blood_group}, but only ${inv.available_units} units available.`
      };
    }

    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().substring(0, 5)}`;

    // 1. Deduct units safely
    setInventory(prev => prev.map(item => {
      if (item.blood_group === req.blood_group) {
        return {
          ...item,
          available_units: item.available_units - req.units_required,
          last_updated: timeStr
        };
      }
      return item;
    }));

    // 2. Mark request as Approved
    setRequests(prev => prev.map(r => {
      if (r.request_id === requestId) {
        return {
          ...r,
          status: 'Approved',
          admin_notes: notes,
          processed_at: timeStr
        };
      }
      return r;
    }));

    return {
      success: true,
      message: `Requisition #${requestId} successfully approved! Deducted ${req.units_required} units of ${req.blood_group}.`
    };
  };

  // Reject Blood Request
  const handleRejectRequest = (requestId: number, notes: string) => {
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().substring(0, 5)}`;

    setRequests(prev => prev.map(r => {
      if (r.request_id === requestId) {
        return {
          ...r,
          status: 'Rejected',
          admin_notes: notes,
          processed_at: timeStr
        };
      }
      return r;
    }));
  };

  // Admin Update Inventory (Add, Deduct, Set)
  const handleUpdateInventory = (bloodGroup: BloodGroup, action: 'add' | 'deduct' | 'set', units: number): { success: boolean; message: string } => {
    const currentItem = inventory.find(i => i.blood_group === bloodGroup);
    if (!currentItem) return { success: false, message: 'Group not found' };

    let newUnits = currentItem.available_units;
    if (action === 'add') newUnits += units;
    else if (action === 'deduct') newUnits -= units;
    else if (action === 'set') newUnits = units;

    if (newUnits < 0) {
      return {
        success: false,
        message: `Inventory Safety Guard: Stock cannot be negative. Current stock is ${currentItem.available_units} units.`
      };
    }

    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().substring(0, 5)}`;

    setInventory(prev => prev.map(item => {
      if (item.blood_group === bloodGroup) {
        return {
          ...item,
          available_units: newUnits,
          last_updated: timeStr
        };
      }
      return item;
    }));

    return {
      success: true,
      message: `Inventory for ${bloodGroup} updated to ${newUnits} units.`
    };
  };

  // Toggle Donor Status from Admin
  const handleToggleDonorStatus = (donorId: number) => {
    handleToggleDonorAvailability(donorId);
  };

  // Total Statistics
  const totalDonorsCount = donors.length;
  const totalUnitsInStorage = inventory.reduce((acc, curr) => acc + curr.available_units, 0);
  const totalRequisitionsCount = requests.length;
  const totalPatientsAssisted = patients.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      
      {/* 1. TOP HEALTHCARE EMERGENCY STRIP */}
      <div className="bg-slate-900 text-white py-1.5 px-4 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-red-400 font-medium">
              <Phone className="w-3.5 h-3.5 fill-red-400" /> 24/7 Emergency Blood Hotline: 
              <strong className="text-white ml-0.5 tracking-wide">1-800-LIFESAVER (543-3728)</strong>
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> AABB Accredited Hemotherapy Center
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-red-300 bg-red-950/80 px-2 py-0.5 rounded-full border border-red-800">
              High Demand: Universal O- &amp; B- Units Needed
            </span>
            <button
              onClick={() => setIsDatabaseViewerOpen(true)}
              className="text-[11px] text-slate-300 hover:text-white underline cursor-pointer ml-2"
            >
              MySQL Database &amp; Files Studio
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-red-800 text-white shadow-md border-b border-red-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          
          {/* Brand Wordmark */}
          <a href="#" className="flex items-center gap-3 shrink-0 group text-decoration-none">
            <div className="w-10 h-10 rounded-xl bg-white/15 group-hover:bg-white/25 flex items-center justify-center text-white transition-colors shadow-inner">
              <Droplet className="w-6 h-6 fill-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white block leading-tight">
                LifeSaver
              </span>
              <span className="text-[10px] tracking-wider text-red-200 uppercase font-semibold block">
                Blood Bank &amp; Inventory System
              </span>
            </div>
          </a>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-red-100">
            <a href="#availability" className="hover:text-white transition-colors">Blood Availability</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#statistics" className="hover:text-white transition-colors">Statistics</a>
            <a href="#why-us" className="hover:text-white transition-colors">Why LifeSaver</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </nav>

          {/* Quick Action Portals */}
          <div className="flex items-center gap-2.5 shrink-0">
            {currentDonor ? (
              <button
                onClick={() => setIsDonorPortalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-colors"
              >
                <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                {currentDonor.full_name} ({currentDonor.blood_group})
              </button>
            ) : (
              <button
                onClick={() => setIsDonorModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Donor Login
              </button>
            )}

            <button
              onClick={() => setIsPatientPortalOpen(true)}
              className="hidden sm:flex px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Patient Portal
            </button>

            <button
              onClick={() => setIsAdminPortalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-950 text-white shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Lock className="w-3 h-3 text-red-400" /> Admin Console
            </button>

            <button
              onClick={() => { setSelectedBloodForRequest(undefined); setIsRequestModalOpen(true); }}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-white text-red-800 hover:bg-red-50 shadow-sm transition-colors"
            >
              Find Blood
            </button>
          </div>
        </div>
      </header>

      {/* MAIN BODY CONTENT */}
      <main className="flex-1">

        {/* 3. HERO SECTION */}
        <section className="bg-gradient-to-br from-red-950 via-red-900 to-slate-950 text-white py-12 md:py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Column: Heading and CTAs */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-800/60 border border-red-700/60 text-xs font-semibold text-red-200">
                  <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                  Voluntary Clinical Hemotherapy Network
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none">
                  Donate Blood, <br />
                  <span className="text-red-400">Save Lives</span>
                </h1>

                <p className="text-sm sm:text-base text-red-100/90 leading-relaxed max-w-xl">
                  A single voluntary whole blood donation takes less than 15 minutes and can preserve up to three distinct lives. Join LifeSaver’s accredited donor registry linking emergency trauma wards with selfless community donors.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => setIsDonorModalOpen(true)}
                    className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg hover:shadow-red-600/30 transition-all flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4 fill-white" /> Donate Blood Today
                  </button>

                  <button
                    onClick={() => { setSelectedBloodForRequest(undefined); setIsRequestModalOpen(true); }}
                    className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2"
                  >
                    <Droplet className="w-4 h-4" /> Find Emergency Blood
                  </button>

                  <button
                    onClick={() => setIsDatabaseViewerOpen(true)}
                    className="px-4 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
                  >
                    <Database className="w-4 h-4 text-emerald-400" /> College DBMS Project Files
                  </button>
                </div>

                <div className="flex items-center gap-6 pt-4 border-t border-white/10 text-xs text-red-200">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Sterile &amp; Safe
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-300" /> 24/7 Rapid Cross-Matching
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-300" /> Cold-Chain Transit
                  </div>
                </div>
              </div>

              {/* Right Column: Hero High-Fidelity Photograph & Floating Card */}
              <div className="lg:col-span-6 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                  <img 
                    src="/src/assets/images/hero_blood_donation_1793575606474.jpg" 
                    alt="Voluntary blood donation at LifeSaver Clinic with caring medical team" 
                    className="w-full h-[400px] object-cover group-hover:scale-102 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Floating Card: Universal O- Type */}
                <div className="absolute -bottom-5 left-4 right-4 sm:right-auto sm:max-w-xs bg-white text-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 font-black text-xl flex items-center justify-center shrink-0">
                    O-
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Universal Blood Donor</h4>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Can be transfused into any patient in critical emergency surgery.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4. STATISTICS COUNTERS STRIP */}
        <section id="statistics" className="bg-white border-b border-slate-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              
              <div className="p-3">
                <div className="text-3xl sm:text-4xl font-black text-red-700 tabular-nums">
                  {totalDonorsCount}
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                  Registered Donors
                </div>
              </div>

              <div className="p-3">
                <div className="text-3xl sm:text-4xl font-black text-slate-900 tabular-nums">
                  {totalUnitsInStorage}
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                  Units in Cold-Storage
                </div>
              </div>

              <div className="p-3">
                <div className="text-3xl sm:text-4xl font-black text-red-700 tabular-nums">
                  {totalRequisitionsCount}
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                  Transfusion Requisitions
                </div>
              </div>

              <div className="p-3">
                <div className="text-3xl sm:text-4xl font-black text-slate-900 tabular-nums">
                  {totalPatientsAssisted}
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                  Hospital Patients Assisted
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 5. BLOOD GROUP AVAILABILITY SECTION */}
        <section id="availability" className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-100/70 px-3 py-1 rounded-full">
                Live Cold-Bank Telemetry
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Blood Group Stock Availability
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Units stored in automated temperature-controlled preservation freezers (1°C to 6°C) across all 8 standard human blood groups.
              </p>
            </div>

            {/* 8 Blood Groups Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
              {inventory.map(item => {
                const isAdequate = item.available_units > 20;
                const isModerate = item.available_units >= 8 && item.available_units <= 20;
                const isCritical = item.available_units < 8;

                return (
                  <div 
                    key={item.blood_group}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-center group"
                  >
                    <div>
                      <div className="w-14 h-14 rounded-full bg-red-50 border-2 border-red-200 mx-auto flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <span className="text-xl font-black text-red-700">{item.blood_group}</span>
                      </div>
                      
                      <div className="text-2xl font-black text-slate-900 tabular-nums">
                        {item.available_units}
                      </div>
                      <span className="text-[11px] text-slate-400 block">units in bank</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full block mb-2 ${
                        isAdequate ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        isModerate ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                      }`}>
                        {isAdequate ? 'Adequate' : isModerate ? 'Moderate' : 'Critical Low'}
                      </span>

                      <button
                        onClick={() => {
                          setSelectedBloodForRequest(item.blood_group);
                          setIsRequestModalOpen(true);
                        }}
                        className="w-full py-1 text-[11px] font-semibold text-slate-700 hover:text-red-700 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Request Type
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compatibility Matrix Toggle */}
            <div className="text-center">
              <button
                onClick={() => setShowCompatibilityMatrix(!showCompatibilityMatrix)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Activity className="w-4 h-4 text-red-600" />
                {showCompatibilityMatrix ? 'Hide Compatibility Matrix' : 'View Clinical Compatibility Matrix (Who Can Give to Whom)'}
              </button>
            </div>

            {/* Compatibility Matrix Expanded */}
            {showCompatibilityMatrix && (
              <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h4 className="font-bold text-slate-900 text-sm mb-3">Red Blood Cell Transfusion Compatibility Chart</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-mono border-b border-slate-200">
                      <tr>
                        <th className="p-3">Blood Type</th>
                        <th className="p-3">Can Receive Blood From</th>
                        <th className="p-3">Can Donate Blood To</th>
                        <th className="p-3">Clinical Indication</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {Object.entries(BLOOD_COMPATIBILITY).map(([type, info]) => (
                        <tr key={type} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-red-700 text-sm">{type}</td>
                          <td className="p-3 font-semibold text-slate-800">{info.canReceiveFrom.join(', ')}</td>
                          <td className="p-3 font-semibold text-slate-800">{info.canDonateTo.join(', ')}</td>
                          <td className="p-3 text-slate-500">{info.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* 6. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                How Blood Donation Works
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                A seamless, painless 4-step medical protocol administered by certified clinical phlebotomists.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-700 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md">
                  1
                </div>
                <h4 className="font-bold text-slate-900 text-base">Quick Registration</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Provide identification, verify age (18–65) and general health history via our digital donor portal.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-700 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md">
                  2
                </div>
                <h4 className="font-bold text-slate-900 text-base">Health Mini-Physical</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A registered nurse checks your blood pressure, pulse, body temperature, and drops a fingerstick test for hemoglobin &ge; 12.5 g/dL.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-700 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md">
                  3
                </div>
                <h4 className="font-bold text-slate-900 text-base">Gentle Collection</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Relax in our high-comfort recliners while approximately 450 mL of blood is drawn in 8–10 quiet minutes using single-use sterile equipment.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-700 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md">
                  4
                </div>
                <h4 className="font-bold text-slate-900 text-base">Refresh &amp; Impact</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enjoy revitalizing juices and snacks, download your digital LifeSaver Donor Pass, and follow notifications as your donation saves lives!
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* 7. WHY CHOOSE LIFESAVER (WITH HIGH-FIDELITY LAB PHOTO) */}
        <section id="why-us" className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Lab Photo */}
              <div className="lg:col-span-6">
                <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200">
                  <img 
                    src="/src/assets/images/blood_testing_lab_1793575619921.jpg" 
                    alt="LifeSaver Hematology Component and Testing Laboratory" 
                    className="w-full h-[380px] object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Text Highlights */}
              <div className="lg:col-span-6 space-y-5">
                <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-100/70 px-3 py-1 rounded-full">
                  Clinical Quality Assurance
                </span>
                
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Why Hospitals Rely on the LifeSaver Network
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  In acute trauma surgery, moments define outcomes. LifeSaver pairs nucleic acid pathogen screening (NAT) with automated cold-chain logistics to deliver cross-matched whole blood and component platelets to emergency centers within 45 minutes.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Nucleic Acid &amp; Serological Testing</h4>
                      <p className="text-xs text-slate-500">Every unit is screened against viral markers with 99.99% analytical specificity.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Temperature-Monitored Dispatch</h4>
                      <p className="text-xs text-slate-500">Continuous digital thermal loggers maintain strict 1°C–6°C transport temperatures.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">ACID MySQL Database Integrity</h4>
                      <p className="text-xs text-slate-500">Row-level locking prevent double-allocations or negative inventory balances.</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* 8. STORIES & TESTIMONIALS */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Stories from Our Community
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Voices of emergency transfusion recipients and regular voluntary donors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-400 mb-3">
                    <Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <p className="text-xs text-slate-700 italic leading-relaxed mb-4">
                    "After a major vehicle collision, I required 4 units of O-negative blood in trauma bay 3. LifeSaver's rapid response enabled emergency surgery before my family even arrived. I owe my life to voluntary donors."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center">
                    RS
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Robert Sterling</h5>
                    <span className="text-[11px] text-slate-500">Emergency Surgery Recipient</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-400 mb-3">
                    <Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <p className="text-xs text-slate-700 italic leading-relaxed mb-4">
                    "I have donated 18 times through the LifeSaver portal. The digital donor card and real-time reminders make it simple to track when my 90-day cooldown expires. Knowing someone walked out of hospital because of it is priceless."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    ER
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Elena Rostova</h5>
                    <span className="text-[11px] text-slate-500">Regular O+ Voluntary Donor</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-400 mb-3">
                    <Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" /><Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <p className="text-xs text-slate-700 italic leading-relaxed mb-4">
                    "As Chief of Trauma Surgery at Central Metropolitan Hospital, having an active, atomic inventory dashboard is indispensable. We can submit requisitions with emergency priorities and receive confirmation in minutes."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-red-800 text-white font-bold text-xs flex items-center justify-center">
                    LR
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Dr. Linda Ramos</h5>
                    <span className="text-[11px] text-slate-500">Chief of Surgery, Metro Hospital</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 9. CONTACT & EMERGENCY HELPLINE */}
        <section id="contact" className="py-16 bg-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-200/70 px-3 py-1 rounded-full">
                  24/7 Operations Desk
                </span>
                
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Contact LifeSaver Hemotherapy Dispatch
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Have questions regarding voluntary donor eligibility, hospital procurement partnerships, or organizing a mobile blood donation drive? Our clinical coordinators are on standby.
                </p>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <Phone className="w-4 h-4 text-red-600 shrink-0" />
                    <div>
                      <span className="text-slate-500 block">Emergency Dispatch Hotline:</span>
                      <strong className="text-slate-900">1-800-LIFESAVER (1-800-543-3728)</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                    <div>
                      <span className="text-slate-500 block">Central Transfusion Center:</span>
                      <strong className="text-slate-900">500 Medical Center Way, Suite 100, Metro City</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <Mail className="w-4 h-4 text-red-600 shrink-0" />
                    <div>
                      <span className="text-slate-500 block">Email Inquiries:</span>
                      <strong className="text-slate-900">dispatch@lifesaver.org</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Message Form */}
              <div className="lg:col-span-7">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-lg mb-1">Send a Message to Clinical Coordinators</h3>
                  <p className="text-xs text-slate-500 mb-5">Fill out your inquiry and a medical officer will follow up promptly.</p>

                  {contactSubmitted ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <strong>Message Sent Successfully!</strong> Our hematology coordinator will contact you via phone/email shortly.
                      </div>
                    </div>
                  ) : (
                    <form 
                      onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true); }}
                      className="space-y-3.5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                          <input type="text" required placeholder="Jane Doe" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                          <input type="tel" required placeholder="+1 (555) 000-0000" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                          <input type="email" required placeholder="jane@hospital.org" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Inquiry Purpose</label>
                          <select className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-red-500">
                            <option>Donor Eligibility Question</option>
                            <option>Hospital Blood Procurement</option>
                            <option>Corporate Blood Drive Organization</option>
                            <option>General Support</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Message Details</label>
                        <textarea required rows={3} placeholder="How can our clinical team assist you?" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500" />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                      >
                        Submit Medical Inquiry
                      </button>
                    </form>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* 10. PROFESSIONAL HEALTHCARE FOOTER */}
      <footer className="bg-slate-900 text-white pt-12 pb-6 border-t-4 border-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 text-xs">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                  <Droplet className="w-5 h-5 fill-white" />
                </div>
                <span className="font-extrabold text-base text-white">LifeSaver Blood Bank</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Dedicated to maintaining continuous blood inventory for regional trauma centers, cancer therapies, and surgical obstetrics. Every donation connects life to life.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">AABB Accredited</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">FDA Registered</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">24/7 Logistics</span>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">System Portals</h5>
              <ul className="space-y-1.5 text-slate-400">
                <li><button onClick={() => setIsDonorModalOpen(true)} className="hover:text-white">Voluntary Donor Registration</button></li>
                <li><button onClick={() => setIsDonorModalOpen(true)} className="hover:text-white">Donor Sign In &amp; Donor Card</button></li>
                <li><button onClick={() => { setSelectedBloodForRequest(undefined); setIsRequestModalOpen(true); }} className="hover:text-white">Emergency Blood Requisition</button></li>
                <li><button onClick={() => setIsPatientPortalOpen(true)} className="hover:text-white">Track Transfusion Requests</button></li>
                <li><button onClick={() => setIsAdminPortalOpen(true)} className="hover:text-white">Clinical Admin Operations</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Donor Eligibility Standard</h5>
              <ul className="space-y-1.5 text-slate-400">
                <li>• Age between 18 and 65 years</li>
                <li>• Minimum body weight 50 kg (110 lbs)</li>
                <li>• Minimum Hemoglobin 12.5 g/dL</li>
                <li>• 90-day cooldown between whole donations</li>
                <li>• Good general health and no acute infections</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">College DBMS Project Suite</h5>
              <p className="text-slate-400 leading-relaxed">
                Complete relational architecture using MySQL 8.0, Python Flask 3.0, parameterized queries, and ACID transactional stock safety.
              </p>
              <button
                onClick={() => setIsDatabaseViewerOpen(true)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileCode className="w-3.5 h-3.5 text-emerald-400" /> Inspect MySQL Tables &amp; Files
              </button>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-2">
            <span>&copy; 2026 LifeSaver Blood Bank – Donor and Inventory Management System.</span>
            <span>DBMS Demonstration Edition | Python Flask &amp; MySQL Connector Ready for Windows</span>
          </div>
        </div>
      </footer>

      {/* ALL MODALS */}
      <DonorModal
        isOpen={isDonorModalOpen}
        onClose={() => setIsDonorModalOpen(false)}
        onRegisterDonor={handleRegisterDonor}
        onLoginDonor={handleLoginDonor}
      />

      {currentDonor && (
        <DonorPortalModal
          isOpen={isDonorPortalOpen}
          onClose={() => setIsDonorPortalOpen(false)}
          donor={currentDonor}
          donationRecords={donationRecords}
          onToggleAvailability={handleToggleDonorAvailability}
          onLogTestDonation={handleLogTestDonation}
          onLogout={() => setCurrentDonor(null)}
        />
      )}

      <BloodRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        inventory={inventory}
        preselectedBloodGroup={selectedBloodForRequest}
        onSubmitRequest={handleSubmitRequest}
      />

      <PatientPortalModal
        isOpen={isPatientPortalOpen}
        onClose={() => setIsPatientPortalOpen(false)}
        requests={requests}
        onOpenNewRequest={() => { setSelectedBloodForRequest(undefined); setIsRequestModalOpen(true); }}
      />

      <AdminPortalModal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
        admin={admin}
        inventory={inventory}
        donors={donors}
        patients={patients}
        requests={requests}
        onApproveRequest={handleApproveRequest}
        onRejectRequest={handleRejectRequest}
        onUpdateInventory={handleUpdateInventory}
        onToggleDonorStatus={handleToggleDonorStatus}
      />

      <DatabaseViewerModal
        isOpen={isDatabaseViewerOpen}
        onClose={() => setIsDatabaseViewerOpen(false)}
        inventory={inventory}
        donors={donors}
        patients={patients}
        requests={requests}
        donationRecords={donationRecords}
      />

    </div>
  );
}
