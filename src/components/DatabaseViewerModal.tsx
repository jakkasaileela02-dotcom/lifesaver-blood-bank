import React, { useState } from 'react';
import { Database, FileCode, Check, Copy, Table, Terminal, Download, ShieldCheck } from 'lucide-react';
import { BloodInventoryItem, Donor, Patient, BloodRequest, DonationRecord } from '../types/bloodBank';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  inventory: BloodInventoryItem[];
  donors: Donor[];
  patients: Patient[];
  requests: BloodRequest[];
  donationRecords: DonationRecord[];
}

export const DatabaseViewerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  inventory,
  donors,
  patients,
  requests,
  donationRecords
}) => {
  const [activeTab, setActiveTab] = useState<'tables' | 'query' | 'schema' | 'files'>('tables');
  const [selectedTable, setSelectedTable] = useState<'blood_inventory' | 'donors' | 'patients' | 'blood_requests' | 'donation_records'>('blood_inventory');
  const [queryInput, setQueryInput] = useState<string>('SELECT blood_group, available_units FROM blood_inventory WHERE available_units > 10;');
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<'schema.sql' | 'app.py' | 'database.py' | 'requirements.txt' | 'README.md'>('schema.sql');

  if (!isOpen) return null;

  const handleCopy = (filename: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const runMockQuery = () => {
    const q = queryInput.trim().toUpperCase();
    if (q.includes('BLOOD_INVENTORY')) {
      setQueryResult(inventory.map(i => ({ blood_group: i.blood_group, available_units: i.available_units, last_updated: i.last_updated })));
    } else if (q.includes('DONORS')) {
      setQueryResult(donors.map(d => ({ donor_id: d.donor_id, full_name: d.full_name, blood_group: d.blood_group, phone: d.phone, is_available: d.is_available })));
    } else if (q.includes('BLOOD_REQUESTS')) {
      setQueryResult(requests.map(r => ({ request_id: r.request_id, patient_name: r.patient_name, blood_group: r.blood_group, units_required: r.units_required, status: r.status })));
    } else {
      setQueryResult([
        { note: 'Query executed successfully against live simulated MySQL memory pool.' },
        { total_donors: donors.length, total_inventory_units: inventory.reduce((a, b) => a + b.available_units, 0) }
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">MySQL Database &amp; Project Files Studio</h3>
              <p className="text-xs text-slate-400">DBMS College Demonstration Architecture | lifesaver_db</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Studio Subnavigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
          <button 
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
              activeTab === 'tables' 
                ? 'bg-white text-red-700 border-t-2 border-red-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-4 h-4" /> Live Relational Tables
          </button>
          <button 
            onClick={() => setActiveTab('query')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
              activeTab === 'query' 
                ? 'bg-white text-red-700 border-t-2 border-red-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" /> SQL Query Console
          </button>
          <button 
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
              activeTab === 'schema' 
                ? 'bg-white text-red-700 border-t-2 border-red-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> ER Schema &amp; Constraints
          </button>
          <button 
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
              activeTab === 'files' 
                ? 'bg-white text-red-700 border-t-2 border-red-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4" /> Download Python / MySQL Files
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          
          {/* TAB 1: Live Relational Tables */}
          {activeTab === 'tables' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 pb-2">
                {(['blood_inventory', 'donors', 'patients', 'blood_requests', 'donation_records'] as const).map(tbl => (
                  <button
                    key={tbl}
                    onClick={() => setSelectedTable(tbl)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      selectedTable === tbl 
                        ? 'bg-slate-900 text-white shadow-xs' 
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    TABLE `{tbl}`
                  </button>
                ))}
              </div>

              {/* Table Data Render */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-slate-800">
                    USE lifesaver_db; SELECT * FROM `{selectedTable}`;
                  </span>
                  <span className="text-xs text-slate-500">
                    Engine: InnoDB | Character Set: utf8mb4
                  </span>
                </div>

                <div className="overflow-x-auto max-h-[460px]">
                  {selectedTable === 'blood_inventory' && (
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 font-mono uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-3">inventory_id</th>
                          <th className="p-3">blood_group</th>
                          <th className="p-3">available_units</th>
                          <th className="p-3">last_updated</th>
                          <th className="p-3">stock_level</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {inventory.map(row => (
                          <tr key={row.inventory_id} className="hover:bg-slate-50">
                            <td className="p-3 text-slate-500">#{row.inventory_id}</td>
                            <td className="p-3 font-bold text-red-700">{row.blood_group}</td>
                            <td className="p-3 font-bold text-slate-900 tabular-nums">{row.available_units} units</td>
                            <td className="p-3 text-slate-500">{row.last_updated}</td>
                            <td className="p-3 font-sans">
                              {row.available_units > 20 ? (
                                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] font-medium">Adequate</span>
                              ) : row.available_units >= 8 ? (
                                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[11px] font-medium">Moderate</span>
                              ) : (
                                <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-md text-[11px] font-medium">Critical</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {selectedTable === 'donors' && (
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 font-mono uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-3">donor_id</th>
                          <th className="p-3">full_name</th>
                          <th className="p-3">blood_group</th>
                          <th className="p-3">age / gender</th>
                          <th className="p-3">phone</th>
                          <th className="p-3">email</th>
                          <th className="p-3">is_available</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {donors.map(d => (
                          <tr key={d.donor_id} className="hover:bg-slate-50">
                            <td className="p-3 text-slate-500">#{d.donor_id}</td>
                            <td className="p-3 font-bold text-slate-900">{d.full_name}</td>
                            <td className="p-3 font-bold text-red-700">{d.blood_group}</td>
                            <td className="p-3 text-slate-700">{d.age} / {d.gender}</td>
                            <td className="p-3 text-slate-600">{d.phone}</td>
                            <td className="p-3 text-slate-500">{d.email}</td>
                            <td className="p-3 font-sans">
                              {d.is_available ? (
                                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] font-medium">TRUE (Available)</span>
                              ) : (
                                <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-[11px] font-medium">FALSE (Resting)</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {selectedTable === 'blood_requests' && (
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 font-mono uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-3">request_id</th>
                          <th className="p-3">patient_name</th>
                          <th className="p-3">blood_group</th>
                          <th className="p-3">units_required</th>
                          <th className="p-3">hospital_name</th>
                          <th className="p-3">priority</th>
                          <th className="p-3">status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {requests.map(r => (
                          <tr key={r.request_id} className="hover:bg-slate-50">
                            <td className="p-3 text-slate-500">#{r.request_id}</td>
                            <td className="p-3 font-bold text-slate-900">{r.patient_name}</td>
                            <td className="p-3 font-bold text-red-700">{r.blood_group}</td>
                            <td className="p-3 font-bold text-slate-900 tabular-nums">{r.units_required}</td>
                            <td className="p-3 text-slate-600 truncate max-w-xs">{r.hospital_name}</td>
                            <td className="p-3 font-sans">
                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                                r.emergency_priority === 'Critical' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {r.emergency_priority}
                              </span>
                            </td>
                            <td className="p-3 font-sans">
                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                                r.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {selectedTable === 'patients' && (
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 font-mono uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-3">patient_id</th>
                          <th className="p-3">full_name</th>
                          <th className="p-3">blood_group</th>
                          <th className="p-3">age / gender</th>
                          <th className="p-3">hospital_name</th>
                          <th className="p-3">phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {patients.map(p => (
                          <tr key={p.patient_id} className="hover:bg-slate-50">
                            <td className="p-3 text-slate-500">#{p.patient_id}</td>
                            <td className="p-3 font-bold text-slate-900">{p.full_name}</td>
                            <td className="p-3 font-bold text-red-700">{p.blood_group}</td>
                            <td className="p-3 text-slate-700">{p.age} / {p.gender}</td>
                            <td className="p-3 text-slate-600">{p.hospital_name}</td>
                            <td className="p-3 text-slate-500">{p.phone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {selectedTable === 'donation_records' && (
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 font-mono uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-3">donation_id</th>
                          <th className="p-3">donor_name</th>
                          <th className="p-3">blood_group</th>
                          <th className="p-3">units_donated</th>
                          <th className="p-3">donation_date</th>
                          <th className="p-3">hemoglobin</th>
                          <th className="p-3">verified_by</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {donationRecords.map(dr => (
                          <tr key={dr.donation_id} className="hover:bg-slate-50">
                            <td className="p-3 text-slate-500">#{dr.donation_id}</td>
                            <td className="p-3 font-bold text-slate-900">{dr.donor_name}</td>
                            <td className="p-3 font-bold text-red-700">{dr.blood_group}</td>
                            <td className="p-3 font-bold text-slate-900 tabular-nums">{dr.units_donated} Unit</td>
                            <td className="p-3 text-slate-600">{dr.donation_date}</td>
                            <td className="p-3 text-slate-700">{dr.hemoglobin_level} g/dL</td>
                            <td className="p-3 text-slate-500">{dr.verified_by}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SQL Console */}
          {activeTab === 'query' && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-xs text-slate-400">MySQL Terminal Query (Enter SELECT query):</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setQueryInput("SELECT blood_group, available_units FROM blood_inventory ORDER BY available_units DESC;")}
                      className="text-[11px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md hover:bg-slate-700"
                    >
                      Stock Levels
                    </button>
                    <button 
                      onClick={() => setQueryInput("SELECT * FROM donors WHERE is_available = TRUE;")}
                      className="text-[11px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md hover:bg-slate-700"
                    >
                      Active Donors
                    </button>
                    <button 
                      onClick={() => setQueryInput("SELECT * FROM blood_requests WHERE status = 'Pending';")}
                      className="text-[11px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md hover:bg-slate-700"
                    >
                      Pending Requests
                    </button>
                  </div>
                </div>
                <textarea 
                  rows={3}
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  className="w-full bg-slate-950 font-mono text-sm text-emerald-400 p-3 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <div className="mt-3 flex justify-end">
                  <button 
                    onClick={runMockQuery}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
                  >
                    <Terminal className="w-3.5 h-3.5" /> Execute Query
                  </button>
                </div>
              </div>

              {queryResult && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                  <h5 className="font-mono text-xs font-bold text-slate-700 mb-2">Query Execution Results:</h5>
                  <pre className="bg-slate-950 text-emerald-300 p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-64">
                    {JSON.stringify(queryResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Schema & Constraints */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h4 className="font-bold text-slate-900 text-sm mb-3">Database Relational Integrity &amp; Constraints</h4>
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800">1. blood_inventory Constraint</span>
                    <p className="text-slate-600">
                      <code>CHECK (available_units &gt;= 0)</code>: Strictly prevents inventory from dipping below zero under any race condition.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800">2. donors Age Check</span>
                    <p className="text-slate-600">
                      <code>CHECK (age &gt;= 18 AND age &lt;= 65)</code>: Enforces statutory clinical blood donation eligibility.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800">3. Foreign Key Constraints</span>
                    <p className="text-slate-600">
                      <code>blood_requests.patient_id -&gt; patients.patient_id</code> (ON DELETE CASCADE).
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800">4. Atomic Transaction Lock</span>
                    <p className="text-slate-600">
                      <code>SELECT ... FOR UPDATE</code>: Row-level pessimistic locking during approval to avoid double-allocation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Project Files */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="flex gap-2 border-b border-slate-200 pb-2">
                {(['schema.sql', 'app.py', 'database.py', 'requirements.txt', 'README.md'] as const).map(file => (
                  <button
                    key={file}
                    onClick={() => setSelectedFile(file)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                      selectedFile === file 
                        ? 'bg-red-600 text-white shadow-xs' 
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {file}
                  </button>
                ))}
              </div>

              <div className="bg-slate-900 rounded-xl p-4 text-white">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-xs text-slate-400">File: /{selectedFile}</span>
                  <button 
                    onClick={() => handleCopy(selectedFile, `// Refer to file /${selectedFile} created in project directory`)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-md flex items-center gap-1.5 transition-colors"
                  >
                    {copiedFile === selectedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedFile === selectedFile ? 'Copied' : 'Copy Content'}
                  </button>
                </div>
                <div className="text-xs text-slate-300 font-sans p-3 bg-slate-950 rounded-lg">
                  <p className="mb-2">
                    ✅ Complete file <strong>{selectedFile}</strong> is generated directly in the root of your workspace!
                  </p>
                  <p className="text-slate-400">
                    To run locally on Windows: simply run <code>pip install -r requirements.txt</code>, import <code>schema.sql</code> into your local MySQL server, and start with <code>python app.py</code>!
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <div>
            DBMS Demonstration Edition | Python Flask 3.0 &amp; MySQL 8.0
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Close Studio
          </button>
        </div>

      </div>
    </div>
  );
};
