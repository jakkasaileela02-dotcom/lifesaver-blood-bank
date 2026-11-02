import React, { useState } from 'react';
import { 
  ShieldCheck, Check, X, AlertTriangle, Users, Droplet, 
  ClipboardList, Search, Plus, Minus, ArrowRight, Lock, LogOut, CheckCircle2 
} from 'lucide-react';
import { 
  Admin, BloodInventoryItem, Donor, Patient, BloodRequest, BloodGroup 
} from '../types/bloodBank';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  admin: Admin;
  inventory: BloodInventoryItem[];
  donors: Donor[];
  patients: Patient[];
  requests: BloodRequest[];
  onApproveRequest: (requestId: number, notes: string) => { success: boolean; message: string };
  onRejectRequest: (requestId: number, notes: string) => void;
  onUpdateInventory: (bloodGroup: BloodGroup, action: 'add' | 'deduct' | 'set', units: number) => { success: boolean; message: string };
  onToggleDonorStatus: (donorId: number) => void;
}

export const AdminPortalModal: React.FC<Props> = ({
  isOpen,
  onClose,
  admin,
  inventory,
  donors,
  patients,
  requests,
  onApproveRequest,
  onRejectRequest,
  onUpdateInventory,
  onToggleDonorStatus
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'inventory' | 'donors'>('overview');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  // Filtering states
  const [requestFilter, setRequestFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [donorSearch, setDonorSearch] = useState('');
  const [donorBloodFilter, setDonorBloodFilter] = useState<string>('All');
  const [inventoryActionState, setInventoryActionState] = useState<Record<string, { units: number; action: 'add' | 'deduct' | 'set' }>>({});
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername === 'admin' && loginPassword === 'admin123') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid administrator credentials. Try admin / admin123');
    }
  };

  // KPI Metrics
  const totalDonors = donors.length;
  const totalPatients = patients.length;
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'Pending').length;
  const approvedRequests = requests.filter(r => r.status === 'Approved').length;
  const totalUnits = inventory.reduce((acc, curr) => acc + curr.available_units, 0);

  // Filtered requests
  const filteredRequests = requests.filter(r => {
    if (requestFilter === 'All') return true;
    return r.status === requestFilter;
  });

  // Filtered donors
  const filteredDonors = donors.filter(d => {
    const matchesSearch = d.full_name.toLowerCase().includes(donorSearch.toLowerCase()) ||
                          d.phone.includes(donorSearch) ||
                          d.address.toLowerCase().includes(donorSearch.toLowerCase());
    const matchesBlood = donorBloodFilter === 'All' || d.blood_group === donorBloodFilter;
    return matchesSearch && matchesBlood;
  });

  const getInventoryForBlood = (bg: BloodGroup) => {
    return inventory.find(i => i.blood_group === bg)?.available_units ?? 0;
  };

  const handleApprove = (req: BloodRequest) => {
    const res = onApproveRequest(req.request_id, `Verified by ${admin.full_name}. Cross-matched & dispatched via cold-chain.`);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleReject = (req: BloodRequest) => {
    onRejectRequest(req.request_id, `Declined by ${admin.full_name} due to clinical protocol mismatch.`);
    showToast(`Request #${req.request_id} has been rejected.`, 'success');
  };

  const handleStockUpdate = (bg: BloodGroup) => {
    const cfg = inventoryActionState[bg] || { units: 1, action: 'add' };
    const res = onUpdateInventory(bg, cfg.action, Number(cfg.units));
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">LifeSaver Clinical Administration Console</h3>
              <p className="text-xs text-slate-400">Authenticated Session: {admin.full_name} ({admin.role})</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={() => setIsAuthenticated(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white flex items-center gap-1 rounded-md"
              >
                <LogOut className="w-3.5 h-3.5" /> Log Out
              </button>
            )}
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast alert */}
        {toastMsg && (
          <div className={`px-6 py-2 text-xs font-semibold flex items-center justify-between ${
            toastMsg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            <span>{toastMsg.text}</span>
            <button onClick={() => setToastMsg(null)} className="text-white hover:opacity-80">✕</button>
          </div>
        )}

        {!isAuthenticated ? (
          /* Login Screen */
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-sm bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Administrative Access</h4>
                <p className="text-xs text-slate-500">Sign in to manage blood inventory &amp; approvals</p>
              </div>

              {loginError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Default demo: <code>admin</code> / <code>admin123</code></p>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Sign In to Admin Console
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard Body */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs Bar */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors ${
                  activeTab === 'overview' 
                    ? 'bg-white text-red-700 border-t-2 border-red-600 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Operations Overview
              </button>
              <button 
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'requests' 
                    ? 'bg-white text-red-700 border-t-2 border-red-600 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Requisitions &amp; Approvals
                {pendingRequests > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {pendingRequests}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('inventory')}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors ${
                  activeTab === 'inventory' 
                    ? 'bg-white text-red-700 border-t-2 border-red-600 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Blood Inventory Control (8 Types)
              </button>
              <button 
                onClick={() => setActiveTab('donors')}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors ${
                  activeTab === 'donors' 
                    ? 'bg-white text-red-700 border-t-2 border-red-600 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Donor Directory ({totalDonors})
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              
              {/* TAB: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Registered Donors</span>
                      <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{totalDonors}</div>
                      <span className="text-[11px] text-emerald-600 mt-0.5 block">Active Community</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Blood Units</span>
                      <div className="text-2xl font-black text-red-600 mt-1 tabular-nums">{totalUnits}</div>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">In Cold-Bank</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Requisitions</span>
                      <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{totalRequests}</div>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">Hospital Cases</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border-l-4 border-amber-500 shadow-xs">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Pending Triage</span>
                      <div className="text-2xl font-black text-amber-600 mt-1 tabular-nums">{pendingRequests}</div>
                      <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">Needs Approval</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border-l-4 border-emerald-500 shadow-xs">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Approved &amp; Sent</span>
                      <div className="text-2xl font-black text-emerald-600 mt-1 tabular-nums">{approvedRequests}</div>
                      <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">Cleared</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Patients Assisted</span>
                      <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{totalPatients}</div>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">Hospital Registry</span>
                    </div>
                  </div>

                  {/* Stock Overview Mini-Strip */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-slate-900 text-sm">Cold-Storage Inventory Level by Group</h4>
                      <button 
                        onClick={() => setActiveTab('inventory')}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold"
                      >
                        Adjust Stock Units →
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                      {inventory.map(item => (
                        <div key={item.blood_group} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                          <span className="text-lg font-black text-red-600 block">{item.blood_group}</span>
                          <span className="text-xl font-bold text-slate-900 tabular-nums block mt-1">{item.available_units}</span>
                          <span className="text-[10px] text-slate-400 block">units</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-block mt-2 ${
                            item.available_units > 20 ? 'bg-emerald-50 text-emerald-700' : item.available_units >= 8 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {item.available_units > 20 ? 'Adequate' : item.available_units >= 8 ? 'Moderate' : 'Critical'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending Triage Fast Action */}
                  {pendingRequests > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                          <h4 className="font-bold text-amber-900 text-sm">
                            {pendingRequests} Blood Requisitions Awaiting Immediate Approval
                          </h4>
                        </div>
                        <button 
                          onClick={() => setActiveTab('requests')}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
                        >
                          Open Triage Center
                        </button>
                      </div>
                      <p className="text-xs text-amber-800">
                        Hospitals have requested blood components for pending surgeries. Click above to execute transactional stock verification and unit dispatch.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Requisitions & Approvals */}
              {activeTab === 'requests' && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Filter Status:</span>
                      {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(st => (
                        <button
                          key={st}
                          onClick={() => setRequestFilter(st)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            requestFilter === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      Showing {filteredRequests.length} requests
                    </span>
                  </div>

                  {/* Requests Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-600 uppercase font-mono border-b border-slate-200">
                          <tr>
                            <th className="p-3.5">Req #</th>
                            <th className="p-3.5">Patient Details</th>
                            <th className="p-3.5">Required Blood</th>
                            <th className="p-3.5">In Stock</th>
                            <th className="p-3.5">Hospital Destination</th>
                            <th className="p-3.5">Priority</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-right">Triage Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredRequests.map(req => {
                            const stock = getInventoryForBlood(req.blood_group);
                            const hasEnough = stock >= req.units_required;
                            return (
                              <tr key={req.request_id} className="hover:bg-slate-50">
                                <td className="p-3.5 font-bold font-mono text-slate-500">#{req.request_id}</td>
                                <td className="p-3.5">
                                  <div className="font-bold text-slate-900">{req.patient_name}</div>
                                  <div className="text-[11px] text-slate-500">{req.contact_number}</div>
                                </td>
                                <td className="p-3.5">
                                  <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                                    {req.units_required} × {req.blood_group}
                                  </span>
                                </td>
                                <td className="p-3.5 font-bold tabular-nums">
                                  <span className={hasEnough ? 'text-emerald-700' : 'text-red-600'}>
                                    {stock} units
                                  </span>
                                </td>
                                <td className="p-3.5 text-slate-700 max-w-xs truncate">
                                  {req.hospital_name}
                                </td>
                                <td className="p-3.5">
                                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                    req.emergency_priority === 'Critical' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    {req.emergency_priority}
                                  </span>
                                </td>
                                <td className="p-3.5">
                                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                    req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : req.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {req.status}
                                  </span>
                                </td>
                                <td className="p-3.5 text-right">
                                  {req.status === 'Pending' ? (
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        onClick={() => handleApprove(req)}
                                        disabled={!hasEnough}
                                        title={!hasEnough ? 'Insufficient inventory units' : 'Execute transaction approval'}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                                          hasEnough 
                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        }`}
                                      >
                                        <Check className="w-3.5 h-3.5" /> Approve &amp; Deduct
                                      </button>
                                      <button
                                        onClick={() => handleReject(req)}
                                        className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg transition-colors"
                                        title="Reject requisition"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-slate-400">Transaction Finalized</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Inventory Control */}
              {activeTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center text-xs text-slate-600">
                    <span>
                      <strong>ACID Transaction Guard:</strong> All inventory modifications enforce <code>CHECK (available_units &gt;= 0)</code>.
                    </span>
                    <span className="font-mono text-slate-400">Total units stored: {totalUnits}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {inventory.map(item => {
                      const cfg = inventoryActionState[item.blood_group] || { units: 1, action: 'add' };
                      return (
                        <div key={item.blood_group} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-black text-red-600">{item.blood_group}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              item.available_units > 20 ? 'bg-emerald-50 text-emerald-700' : item.available_units >= 8 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {item.available_units > 20 ? 'Adequate' : item.available_units >= 8 ? 'Moderate' : 'Critical Low'}
                            </span>
                          </div>

                          <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">{item.available_units}</span>
                            <span className="text-xs text-slate-500 block">Units Currently Available</span>
                            <span className="text-[10px] text-slate-400 block mt-1 font-mono">Updated: {item.last_updated}</span>
                          </div>

                          {/* Adjuster controls */}
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="flex gap-2">
                              <select
                                value={cfg.action}
                                onChange={(e) => setInventoryActionState(prev => ({
                                  ...prev,
                                  [item.blood_group]: { ...cfg, action: e.target.value as any }
                                }))}
                                className="w-1/2 px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                              >
                                <option value="add">+ Add</option>
                                <option value="deduct">- Deduct</option>
                                <option value="set">= Set Exact</option>
                              </select>

                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={cfg.units}
                                onChange={(e) => setInventoryActionState(prev => ({
                                  ...prev,
                                  [item.blood_group]: { ...cfg, units: Number(e.target.value) }
                                }))}
                                className="w-1/2 px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
                              />
                            </div>

                            <button
                              onClick={() => handleStockUpdate(item.blood_group)}
                              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                            >
                              Apply Update
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: Donor Directory */}
              {activeTab === 'donors' && (
                <div className="space-y-4">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-2 flex-grow max-w-md">
                      <div className="relative w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={donorSearch}
                          onChange={(e) => setDonorSearch(e.target.value)}
                          placeholder="Search donors by name, phone, or address..."
                          className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Blood Group:</span>
                      <select
                        value={donorBloodFilter}
                        onChange={(e) => setDonorBloodFilter(e.target.value)}
                        className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="All">All Groups</option>
                        {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Donors List Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-600 uppercase font-mono border-b border-slate-200">
                          <tr>
                            <th className="p-3.5">ID</th>
                            <th className="p-3.5">Full Name</th>
                            <th className="p-3.5">Blood</th>
                            <th className="p-3.5">Age / Gender</th>
                            <th className="p-3.5">Contact</th>
                            <th className="p-3.5">Last Donation</th>
                            <th className="p-3.5">Availability</th>
                            <th className="p-3.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredDonors.map(d => (
                            <tr key={d.donor_id} className="hover:bg-slate-50">
                              <td className="p-3.5 font-mono text-slate-400">#{d.donor_id}</td>
                              <td className="p-3.5">
                                <div className="font-bold text-slate-900">{d.full_name}</div>
                                <div className="text-[11px] text-slate-500 truncate max-w-xs">{d.address}</div>
                              </td>
                              <td className="p-3.5">
                                <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                                  {d.blood_group}
                                </span>
                              </td>
                              <td className="p-3.5 text-slate-700">{d.age} yrs / {d.gender}</td>
                              <td className="p-3.5 text-slate-600">{d.phone}</td>
                              <td className="p-3.5 text-slate-500">{d.last_donation_date || 'None'}</td>
                              <td className="p-3.5">
                                {d.is_available ? (
                                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                                    Available
                                  </span>
                                ) : (
                                  <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                                    Resting
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5 text-right">
                                <button
                                  onClick={() => onToggleDonorStatus(d.donor_id)}
                                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                    d.is_available 
                                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                                >
                                  {d.is_available ? 'Set Inactive' : 'Activate'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
