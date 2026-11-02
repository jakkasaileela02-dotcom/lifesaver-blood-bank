import React, { useState } from 'react';
import { AlertCircle, Droplet, Send, X, PhoneCall } from 'lucide-react';
import { BloodGroup, EmergencyPriority, BloodRequest, BloodInventoryItem } from '../types/bloodBank';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  inventory: BloodInventoryItem[];
  preselectedBloodGroup?: BloodGroup;
  onSubmitRequest: (requestData: Omit<BloodRequest, 'request_id' | 'patient_id' | 'status' | 'admin_notes' | 'created_at' | 'processed_at'>) => void;
}

export const BloodRequestModal: React.FC<Props> = ({
  isOpen,
  onClose,
  inventory,
  preselectedBloodGroup,
  onSubmitRequest
}) => {
  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(preselectedBloodGroup || 'O+');
  const [unitsRequired, setUnitsRequired] = useState<number>(2);
  const [hospitalName, setHospitalName] = useState('Central Metropolitan Hospital, Emergency ICU');
  const [contactNumber, setContactNumber] = useState('');
  const [emergencyPriority, setEmergencyPriority] = useState<EmergencyPriority>('Urgent');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentStock = inventory.find(i => i.blood_group === bloodGroup)?.available_units ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !hospitalName.trim() || !contactNumber.trim() || !unitsRequired) {
      setErrorMsg('Please complete all mandatory requisition fields.');
      return;
    }

    if (unitsRequired <= 0) {
      setErrorMsg('Units required must be at least 1.');
      return;
    }

    onSubmitRequest({
      patient_name: patientName.trim(),
      blood_group: bloodGroup,
      units_required: unitsRequired,
      hospital_name: hospitalName.trim(),
      contact_number: contactNumber.trim(),
      emergency_priority: emergencyPriority
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Droplet className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Emergency Blood Transfusion Request</h3>
              <p className="text-xs text-red-100">Hospital &amp; Patient Clinical Requisition Triage</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-red-800 hover:bg-red-900 text-red-200 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Emergency Alert Box */}
        <div className="bg-red-50 p-4 border-b border-red-100 flex items-start gap-3 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong>Active Trauma or Surgery?</strong> If immediate blood is required within 30 minutes, call Central Dispatch at <strong className="underline">1-800-LIFESAVER (543-3728)</strong> in parallel with submitting this digital form.
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-100 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Full Name *</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Liam Henderson"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Required Blood Group *</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full px-3 py-2 text-xs font-bold text-red-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
              >
                {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Stock Notification */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-500 block">Current Cold-Bank Units for {bloodGroup}:</span>
              <span className={`font-bold ${currentStock >= unitsRequired ? 'text-emerald-700' : 'text-red-600'}`}>
                {currentStock} units available in inventory
              </span>
            </div>
            {currentStock < unitsRequired && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                Cross-matching from donors may be required
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Units Required (Bags) *</label>
              <input
                type="number"
                required
                min={1}
                max={10}
                value={unitsRequired}
                onChange={(e) => setUnitsRequired(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Priority Level *</label>
              <select
                value={emergencyPriority}
                onChange={(e) => setEmergencyPriority(e.target.value as EmergencyPriority)}
                className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
              >
                <option value="Critical">Critical (Immediate OR / Trauma)</option>
                <option value="Urgent">Urgent (Within 2 to 4 hours)</option>
                <option value="Standard">Standard (Scheduled Surgery)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital / Clinic &amp; Ward Destination *</label>
            <input
              type="text"
              required
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="e.g. St. Jude Healthcare Center, Trauma Bay 3"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Physician / Attendant Contact Number *</label>
            <input
              type="tel"
              required
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="pt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" /> Submit Requisition
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
