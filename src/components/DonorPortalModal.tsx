import React from 'react';
import { Donor, DonationRecord } from '../types/bloodBank';
import { Heart, Award, Calendar, CheckCircle2, Moon, Sun, X, Activity } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  donor: Donor;
  donationRecords: DonationRecord[];
  onToggleAvailability: (donorId: number) => void;
  onLogTestDonation: (donorId: number) => void;
  onLogout: () => void;
}

export const DonorPortalModal: React.FC<Props> = ({
  isOpen,
  onClose,
  donor,
  donationRecords,
  onToggleAvailability,
  onLogTestDonation,
  onLogout
}) => {
  if (!isOpen) return null;

  const donorHistory = donationRecords.filter(r => r.donor_id === donor.donor_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Donor Portal &amp; Hemotherapy Pass</h3>
              <p className="text-xs text-slate-400">Welcome, {donor.full_name} · LifeSaver Donor #{donor.donor_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { onLogout(); onClose(); }}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md"
            >
              Sign Out
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 bg-slate-50">
          
          {/* Top Grid: Profile & Digital Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Donor Identity & Status */}
            <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{donor.full_name}</h4>
                  <span className="text-xs text-slate-500">{donor.email} · {donor.phone}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-mono">BLOOD GROUP</span>
                  <span className="text-2xl font-black text-red-600">{donor.blood_group}</span>
                </div>
              </div>

              {/* Status Toggle Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Current Availability Status:</span>
                  {donor.is_available ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready to Donate
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-200 px-2.5 py-1 rounded-full">
                      <Moon className="w-3.5 h-3.5" /> Temporarily Resting
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onToggleAvailability(donor.donor_id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    donor.is_available 
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {donor.is_available ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  {donor.is_available ? 'Take a Break' : 'Set as Ready'}
                </button>
              </div>

              {/* Personal Details List */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Age &amp; Gender:</span>
                  <span className="font-semibold text-slate-800">{donor.age} yrs / {donor.gender}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Last Donation:</span>
                  <span className="font-semibold text-slate-800">{donor.last_donation_date || 'No recent donation'}</span>
                </div>
                <div className="col-span-2 p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Registered Address:</span>
                  <span className="font-medium text-slate-700">{donor.address}</span>
                </div>
              </div>
            </div>

            {/* Right: Digital LifeSaver Donor Pass Card */}
            <div className="lg:col-span-6 flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 text-white shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <span className="text-[10px] tracking-widest text-red-400 uppercase font-mono font-bold block mb-1">
                    LifeSaver Donor Credential Pass
                  </span>
                  <h3 className="font-bold text-lg text-white tracking-tight">{donor.full_name}</h3>
                  <span className="text-xs text-slate-300 font-mono">ID: LSB-{String(donor.donor_id).padStart(4, '0')}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-600/30 border border-red-500/40 flex items-center justify-center">
                  <Award className="w-6 h-6 text-red-400" />
                </div>
              </div>

              <div className="my-6 relative z-10 flex justify-between items-end border-t border-white/10 pt-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Blood Group</span>
                  <span className="text-3xl font-black text-red-400">{donor.blood_group}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Donations</span>
                  <span className="text-xl font-bold text-white tabular-nums">{donor.total_donations} times</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Status</span>
                  <span className="text-xs font-semibold text-emerald-400">Verified Donor</span>
                </div>
              </div>

              <div className="relative z-10 flex justify-between items-center text-[10px] text-slate-400 border-t border-white/10 pt-3">
                <span>Certified Hemotherapy Center</span>
                <span className="font-mono">lifesaver.org/verify</span>
              </div>
            </div>

          </div>

          {/* Donation History Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                <h4 className="font-bold text-slate-900 text-sm">Donation History Records ({donorHistory.length})</h4>
              </div>
              <button
                onClick={() => onLogTestDonation(donor.donor_id)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5" /> + Record New Donation Today
              </button>
            </div>

            {donorHistory.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {donorHistory.map(record => (
                  <div key={record.donation_id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-900">Donation #{record.donation_id}</span>
                      <span className="text-slate-400 mx-2">·</span>
                      <span className="text-slate-600">{record.donation_date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded-md">
                        {record.units_donated} Unit ({record.blood_group})
                      </span>
                      <span className="text-slate-600">Hemoglobin: {record.hemoglobin_level} g/dL</span>
                      <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md">
                        Verified by {record.verified_by}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                No past donations recorded yet for this donor. Click "+ Record New Donation Today" to add one!
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
