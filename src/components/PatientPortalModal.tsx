import React from 'react';
import { BloodRequest } from '../types/bloodBank';
import { Hospital, CheckCircle2, Clock, AlertTriangle, X, ChevronRight, Truck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  requests: BloodRequest[];
  onOpenNewRequest: () => void;
}

export const PatientPortalModal: React.FC<Props> = ({
  isOpen,
  onClose,
  requests,
  onOpenNewRequest
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white">
              <Hospital className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Patient &amp; Hospital Transfusion Portal</h3>
              <p className="text-xs text-slate-400">Requisition History &amp; Cold-Chain Dispatch Tracker</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action strip */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-600 font-medium">Active Hospital Requisitions: {requests.length}</span>
          <button
            onClick={() => { onClose(); onOpenNewRequest(); }}
            className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            + New Emergency Requisition
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 bg-slate-50">
          {requests.length > 0 ? (
            requests.map(req => (
              <div key={req.request_id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{req.patient_name}</span>
                      <span className="text-xs text-slate-400 font-mono">REQ #{req.request_id}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        req.emergency_priority === 'Critical' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {req.emergency_priority} Priority
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 block mt-0.5">{req.hospital_name} · Contact: {req.contact_number}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 inline-block">
                      {req.units_required} Units of {req.blood_group}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1">{req.created_at}</span>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="pt-2">
                  <div className="flex justify-between items-center relative text-xs">
                    <div className="flex flex-col items-center gap-1 z-10 bg-white px-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] text-slate-600 font-medium">Requisition Logged</span>
                    </div>

                    <div className="flex flex-col items-center gap-1 z-10 bg-white px-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        req.status === 'Approved' ? 'bg-emerald-600 text-white' : req.status === 'Pending' ? 'bg-amber-500 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {req.status === 'Approved' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <span className="text-[11px] text-slate-600 font-medium">Clinical Triage</span>
                    </div>

                    <div className="flex flex-col items-center gap-1 z-10 bg-white px-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        req.status === 'Approved' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        <Truck className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] text-slate-600 font-medium">Transit Courier</span>
                    </div>

                    <div className="flex flex-col items-center gap-1 z-10 bg-white px-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        req.status === 'Approved' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        <Hospital className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] text-slate-600 font-medium">Ward Receipt</span>
                    </div>
                  </div>
                </div>

                {/* Notes box */}
                {req.admin_notes && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800">
                    <strong>Medical Officer Note:</strong> {req.admin_notes}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              No active blood requests found. Click the button above to submit an emergency requisition.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
