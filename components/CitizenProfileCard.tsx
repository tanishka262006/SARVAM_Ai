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
  ShieldCheck
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

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-5 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {draft.name || 'Citizen Profile'}
            </h3>
            <p className="text-xs text-slate-500">
              {draft.occupation || 'Occupation not set'} • {draft.state || 'State not set'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-orange-600 hover:bg-orange-50 border border-slate-200 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Details (Read-only vs Edit Mode) */}
      {!isEditing ? (
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Annual Household Income</span>
            <span className="font-bold text-slate-800 text-sm flex items-center gap-0.5">
              <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
              {profile.annualHouseholdIncome !== undefined
                ? `₹${profile.annualHouseholdIncome.toLocaleString('en-IN')}`
                : 'Not specified'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Location</span>
            <span className="font-bold text-slate-800 text-sm flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              {profile.state ? `${profile.district ? profile.district + ', ' : ''}${profile.state}` : 'Not set'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Age & Family</span>
            <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              {profile.age ? `${profile.age} yrs` : 'Age ?'}, {profile.childrenCount || 0} child(ren)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Category & Occupation</span>
            <span className="font-bold text-slate-800 text-sm truncate block">
              {profile.occupation || 'Unspecified'} ({profile.socialCategory || 'General'})
            </span>
          </div>

        </div>
      ) : (
        /* Edit Form */
        <div className="mt-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={draft.name || ''}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. Ramesh Kumar"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Age</label>
              <input
                type="number"
                value={draft.age || ''}
                onChange={(e) => setDraft({ ...draft, age: Number(e.target.value) || undefined })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. 38"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 font-medium mb-1">State</label>
              <input
                type="text"
                value={draft.state || ''}
                onChange={(e) => setDraft({ ...draft, state: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. Maharashtra"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">District</label>
              <input
                type="text"
                value={draft.district || ''}
                onChange={(e) => setDraft({ ...draft, district: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. Pune"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Occupation</label>
              <input
                type="text"
                value={draft.occupation || ''}
                onChange={(e) => setDraft({ ...draft, occupation: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. Delivery worker"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Annual Income (₹)</label>
              <input
                type="number"
                value={draft.annualHouseholdIncome || ''}
                onChange={(e) =>
                  setDraft({ ...draft, annualHouseholdIncome: Number(e.target.value) || undefined })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. 200000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Children Count</label>
              <input
                type="number"
                value={draft.childrenCount ?? ''}
                onChange={(e) =>
                  setDraft({ ...draft, childrenCount: Number(e.target.value) || 0 })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. 2"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Farmer Status</label>
              <select
                value={draft.farmerStatus ? 'yes' : 'no'}
                onChange={(e) => setDraft({ ...draft, farmerStatus: e.target.value === 'yes' })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-orange-500"
              >
                <option value="no">No</option>
                <option value="yes">Yes (Landholding)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Available Documents Section */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-600 block mb-2">
          Verified / Available Documents ({profile.documentsAvailable?.length || 0})
        </span>
        <div className="flex flex-wrap gap-1.5">
          {commonDocs.map((doc) => {
            const has = (isEditing ? draft : profile).documentsAvailable?.includes(doc);
            return (
              <button
                key={doc}
                type="button"
                disabled={!isEditing}
                onClick={() => isEditing && toggleDocument(doc)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                  has
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                    : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                } ${isEditing ? 'cursor-pointer hover:border-orange-300' : 'cursor-default'}`}
              >
                <FileText className="w-3 h-3" />
                <span>{doc}</span>
                {has && <Check className="w-3 h-3 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
