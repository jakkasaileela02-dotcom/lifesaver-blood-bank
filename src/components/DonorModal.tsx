import React, { useState } from 'react';
import { Heart, UserCheck, ShieldCheck, X } from 'lucide-react';
import { BloodGroup, Gender, Donor } from '../types/bloodBank';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRegisterDonor: (donorData: Omit<Donor, 'donor_id' | 'total_donations' | 'created_at'>) => void;
  onLoginDonor: (email: string) => void;
}

export const DonorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onRegisterDonor,
  onLoginDonor
}) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>(28);
  const [gender, setGender] = useState<Gender>('Male');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [password, setPassword] = useState('');
  const [eligibilityAgreed, setEligibilityAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !phone.trim() || !email.trim() || !address.trim() || !age) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    const numAge = Number(age);
    if (numAge < 18 || numAge > 65) {
      setErrorMsg('Donors must be between 18 and 65 years old to donate blood safely.');
      return;
    }

    if (!eligibilityAgreed) {
      setErrorMsg('Please confirm health eligibility and voluntary consent.');
      return;
    }

    onRegisterDonor({
      full_name: fullName.trim(),
      age: numAge,
      gender,
      blood_group: bloodGroup,
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      last_donation_date: lastDonationDate || null,
      is_available: true
    });

    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your registered donor email.');
      return;
    }
    onLoginDonor(email.trim().toLowerCase());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {mode === 'register' ? 'Voluntary Donor Registration' : 'Donor Portal Sign In'}
              </h3>
              <p className="text-xs text-slate-400">LifeSaver Clinical Blood Transfusion Network</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3">
          <button
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              mode === 'register' ? 'border-red-600 text-red-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Register as New Donor
          </button>
          <button
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              mode === 'login' ? 'border-red-600 text-red-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Existing Donor Sign In
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          {mode === 'register' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Maria Thorne"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Age (18-65) *</label>
                    <input
                      type="number"
                      required
                      min={18}
                      max={65}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group *</label>
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
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Donation Date</label>
                  <input
                    type="date"
                    value={lastDonationDate}
                    onChange={(e) => setLastDonationDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maria@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address *</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street Address, City, State, ZIP code"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="eligCheck"
                  checked={eligibilityAgreed}
                  onChange={(e) => setEligibilityAgreed(e.target.checked)}
                  className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                />
                <label htmlFor="eligCheck" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                  I confirm that I weigh at least 50 kg, am in good general health, and consent to voluntary blood donation records storage.
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <UserCheck className="w-4 h-4" /> Complete Voluntary Donor Registration
              </button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4 py-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Donor Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena.rostova@example.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Demo hint: You can test with <code>elena.rostova@example.com</code> or <code>david.chen@example.com</code>
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
              >
                Sign In to Donor Portal
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
