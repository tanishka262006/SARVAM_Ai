'use client';

import React, { useState } from 'react';
import {
  User,
  MapPin,
  Briefcase,
  IndianRupee,
  Users,
  GraduationCap,
  Tractor,
  FileText,
  Edit2,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CitizenProfile } from '@/types';

interface CitizenProfileCardProps {
  profile: CitizenProfile;
  onUpdateProfile: (newProfile: CitizenProfile) => void;
  onLoadDemo: () => void;
  eligibleCount: number;
}

export const CitizenProfileCard: React.FC<CitizenProfileCardProps> = ({
  profile,
  onUpdateProfile,
  onLoadDemo,
  eligibleCount
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<CitizenProfile>(profile);

  // Sync draft when profile updates
  React.useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const handleSave = () => {
    onUpdateProfile(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const toggleDocument = (docName: string) => {
    const docs = draft.documentsAvailable || [];
    const exists = docs.includes(docName);
    const updated = exists ? docs.filter((d) => d !== docName) : [...docs, docName];
    setDraft({ ...draft, documentsAvailable: updated });
  };

  const commonDocs = [
    'Aadhaar Card',
    'Income Certificate',
    'Ration Card',
    'Bank Passbook',
    'Land Record (7/12)',
    'Caste Certificate'
  ];

  const availableCount = profile.documentsAvailable?.length || 0;
  const readinessPercent = Math.min(100, Math.round((availableCount / commonDocs.length) * 100));

  return (
    <div id="citizen-profile-section" className="bg-white rounded-2xl border border-[#E8E5DE] shadow-xs p-5 sm:p-6 transition-all">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E8E5DE]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-800 font-bold shrink-0">
            <User className="w-5 h-5 text-forest-800" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {profile.name || 'Citizen Profile Ledger'}
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-forest-50 text-forest-800 font-semibold text-[10px] border border-forest-200">
                {eligibleCount} Eligible Schemes
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {profile.occupation || 'Occupation not set'} • {profile.state ? `${profile.district ? profile.district + ', ' : ''}${profile.state}` : 'State not set'}
            </p>
          </div>
        </div>

        <div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-forest-900 bg-ivory-100 hover:bg-ivory-200 border border-[#D8D4CA] transition-all"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Details</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-forest-800 hover:bg-forest-900 shadow-xs transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-ivory-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Details (Read-only vs Edit Mode) */}
      {!isEditing ? (
        <div className="mt-4 space-y-4">
          
          {/* Key Attributes Ledger Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            
            <div className="p-3 rounded-xl bg-ivory-100 border border-[#E8E5DE]">
              <span className="text-[11px] text-slate-500 block mb-0.5">Annual Income</span>
              <span className="font-bold text-slate-900 text-sm flex items-center">
                {profile.annualHouseholdIncome !== undefined
                  ? `₹${profile.annualHouseholdIncome.toLocaleString('en-IN')}`
                  : 'Not specified'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-ivory-100 border border-[#E8E5DE]">
              <span className="text-[11px] text-slate-500 block mb-0.5">Family & Age</span>
              <span className="font-bold text-slate-900 text-sm truncate block">
                {profile.age ? `${profile.age} yrs` : 'Age ?'}, {profile.childrenCount || 0} child(ren)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-ivory-100 border border-[#E8E5DE]">
              <span className="text-[11px] text-slate-500 block mb-0.5">Occupation & Sector</span>
              <span className="font-bold text-slate-900 text-sm truncate block">
                {profile.occupation || 'Unspecified'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-ivory-100 border border-[#E8E5DE]">
              <span className="text-[11px] text-slate-500 block mb-0.5">Category</span>
              <span className="font-bold text-slate-900 text-sm truncate block">
                {profile.socialCategory || 'General'}
              </span>
            </div>

          </div>

          {/* Document Verification Readiness Progress Bar */}
          <div className="p-3.5 rounded-xl bg-[#FBFBFA] border border-[#E8E5DE] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-forest-700" />
                <span>Document Readiness Score</span>
              </span>
              <span className="font-bold text-forest-800">
                {availableCount} of {commonDocs.length} Verified ({readinessPercent}%)
              </span>
            </div>
            
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-forest-700 rounded-full transition-all duration-500"
                style={{ width: `${readinessPercent}%` }}
              />
            </div>
          </div>

        </div>
      ) : (
        /* Edit Form */
        <div className="mt-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={draft.name || ''}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#D8D4CA] text-xs focus:outline-none focus:border-forest-700 focus:ring-1 focus:ring-forest-700"
                placeholder="e.g. Ramesh Kumar"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Age</label>
              <input
                type="number"
                value={draft.age || ''}
                onChange={(e) => setDraft({ ...draft, age: Number(e.target.value) || undefined })}
                className="w-full px-3 py-2 rounded-lg border border-[#D8D4CA] text-xs focus:outline-none focus:border-forest-700 focus:ring-1 focus:ring-forest-700"
                placeholder="e.g. 38"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">State</label>
              <input
                type="text"
                value={draft.state || ''}
                onChange={(e) => setDraft({ ...draft, state: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#D8D4CA] text-xs focus:outline-none focus:border-forest-700 focus:ring-1 focus:ring-forest-700"
                placeholder="e.g. Maharashtra"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">District</label>
              <input
                type="text"
                value={draft.district || ''}
                onChange={(e) => setDraft({ ...draft, district: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#D8D4CA] text-xs focus:outline-none focus:border-forest-700 focus:ring-1 focus:ring-forest-700"
                placeholder="e.g. Pune"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Occupation</label>
              <input
                type="text"
                value={draft.occupation || ''}
                onChange={(e) => setDraft({ ...draft, occupation: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#D8D4CA] text-xs focus:outline-none focus:border-forest-700 focus:ring-1 focus:ring-forest-700"
                placeholder="e.g. Delivery worker"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Annual Household Income (₹)</label>
              <input
                type="number"
                value={draft.annualHouseholdIncome || ''}
                onChange={(e) =>
                  setDraft({ ...draft, annualHouseholdIncome: Number(e.target.value) || undefined })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#D8D4CA] text-xs focus:outline-none focus:border-forest-700 focus:ring-1 focus:ring-forest-700"
                placeholder="e.g. 200000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Children Count</label>
              <input
                type="number"
                value={draft.childrenCount ?? ''}
                onChange={(e) =>
                  setDraft({ ...draft, childrenCount: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#D8D4CA] text-xs focus:outline-none focus:border-forest-700 focus:ring-1 focus:ring-forest-700"
                placeholder="e.g. 2"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Farmer Status</label>
              <select
                value={draft.farmerStatus ? 'yes' : 'no'}
                onChange={(e) => setDraft({ ...draft, farmerStatus: e.target.value === 'yes' })}
                className="w-full px-3 py-2 rounded-lg border border-[#D8D4CA] text-xs focus:outline-none focus:border-forest-700 focus:ring-1 focus:ring-forest-700"
              >
                <option value="no">No (Non-agricultural worker)</option>
                <option value="yes">Yes (Cultivable Landholder)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Available Documents Section */}
      <div className="mt-4 pt-3.5 border-t border-[#E8E5DE]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700">
            Available Government Documents
          </span>
          <span className="text-[11px] text-slate-400">
            {isEditing ? 'Tap to toggle available docs' : 'Used for automated scheme eligibility'}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {commonDocs.map((doc) => {
            const has = (isEditing ? draft : profile).documentsAvailable?.includes(doc);
            return (
              <button
                key={doc}
                type="button"
                disabled={!isEditing}
                onClick={() => isEditing && toggleDocument(doc)}
                className={`text-[11px] px-2.5 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
                  has
                    ? 'bg-forest-50 text-forest-900 border-forest-300 font-semibold'
                    : 'bg-ivory-100 text-slate-400 border-[#E2DFD7] line-through'
                } ${isEditing ? 'cursor-pointer hover:border-forest-400' : 'cursor-default'}`}
              >
                <FileText className={`w-3 h-3 ${has ? 'text-forest-700' : 'text-slate-400'}`} />
                <span>{doc}</span>
                {has && <Check className="w-3 h-3 text-forest-700" />}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
