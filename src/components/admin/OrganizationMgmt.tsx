import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';
import type { LocationItem, Organization, OrganizationUserResponse, UserProfile } from '../../types/admin';
import { UserSelectSearch } from './UserSelectSearch';
import { Building2, UserPlus, Plus, MapPin, RefreshCw, ShieldCheck } from 'lucide-react';

export const OrganizationMgmt: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [availableLocations, setAvailableLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State: Create Organization
  const [name, setName] = useState('');
  const [organizationType, setOrganizationType] = useState('NGO');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);
  const [creatingOrg, setCreatingOrg] = useState(false);

  // Form State: Assign User to Organization (Asynchronous Search state)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [targetOrgId, setTargetOrgId] = useState<number | string>('');
  const [position, setPosition] = useState('Humanitarian Officer');
  const [assigningUser, setAssigningUser] = useState(false);
  const [orgUserResult, setOrgUserResult] = useState<OrganizationUserResponse | null>(null);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [orgsRes, locsRes] = await Promise.all([
        apiFetch<Organization[]>('/organizations'),
        apiFetch<LocationItem[]>('/locations'),
      ]);
      setOrganizations(orgsRes || []);
      setAvailableLocations(locsRes || []);

      if (orgsRes && orgsRes.length > 0) {
        setTargetOrgId(orgsRes[0].id);
      }
    } catch {
      setOrganizations([]);
      setAvailableLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLocationIds.length === 0) {
      alert('Please select at least one location for this organization.');
      return;
    }

    try {
      setCreatingOrg(true);
      await apiFetch<Organization>('/organizations', {
        method: 'POST',
        body: JSON.stringify({
          name,
          organizationType,
          description,
          email,
          phone,
          locationIds: selectedLocationIds,
        }),
      });

      alert('Organization created successfully!');
      // Reset Form
      setName('');
      setDescription('');
      setEmail('');
      setPhone('');
      setSelectedLocationIds([]);
      fetchInitialData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setCreatingOrg(false);
    }
  };

  const handleAssignUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      alert('Please search and select a user first.');
      return;
    }
    if (!targetOrgId) {
      alert('Please select a target organization.');
      return;
    }

    try {
      setAssigningUser(true);
      setOrgUserResult(null);
      const res = await apiFetch<OrganizationUserResponse>('/organization-users', {
        method: 'POST',
        body: JSON.stringify({
          userId: selectedUser.id,
          organizationId: Number(targetOrgId),
          position,
        }),
      });

      setOrgUserResult(res);
      alert(`User ${res.userName} successfully linked to ${res.organizationName}!`);
      setSelectedUser(null);
      setPosition('Humanitarian Officer');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to assign user to organization');
    } finally {
      setAssigningUser(false);
    }
  };

  const toggleLocationSelect = (id: number) => {
    if (selectedLocationIds.includes(id)) {
      setSelectedLocationIds(selectedLocationIds.filter((item) => item !== id));
    } else {
      setSelectedLocationIds([...selectedLocationIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Organization Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Plus className="w-5 h-5 text-purple-400" /> Create Humanitarian Organization
          </h2>

          <form onSubmit={handleCreateOrg} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Organization Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Health Care Relief"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Org Type</label>
                <select
                  value={organizationType}
                  onChange={(e) => setOrganizationType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="NGO">NGO</option>
                  <option value="GOVERNMENT">GOVERNMENT</option>
                  <option value="UN_AGENCY">UN AGENCY</option>
                  <option value="INDEPENDENT">INDEPENDENT</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+250780000000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Email Contact</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@org.domain"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summary of operational goals and mandate..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Assign Operating Locations</label>
              <div className="max-h-28 overflow-y-auto bg-slate-950 border border-slate-800 rounded-lg p-2 space-y-1">
                {availableLocations.length === 0 ? (
                  <p className="text-slate-500 text-[11px] py-1">No locations registered yet.</p>
                ) : (
                  availableLocations.map((loc) => (
                    <label key={loc.id} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={selectedLocationIds.includes(loc.id)}
                        onChange={() => toggleLocationSelect(loc.id)}
                        className="rounded border-slate-800 bg-slate-900 text-purple-500"
                      />
                      <span>
                        #{loc.id} {loc.locationName} ({loc.city}, {loc.province})
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingOrg}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              {creatingOrg ? 'Creating...' : 'Create Organization'}
            </button>
          </form>
        </div>

        {/* Assign User to Organization Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <UserPlus className="w-5 h-5 text-sky-400" /> Assign Personnel to Organization
          </h2>

          <form onSubmit={handleAssignUser} className="space-y-4 text-xs">
            {/* Enterprise Async Search Field */}
            <div>
              <label className="block text-slate-400 mb-1">Search & Select Personnel</label>
              <UserSelectSearch selectedUser={selectedUser} onSelectUser={setSelectedUser} />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Target Organization</label>
              <select
                value={targetOrgId}
                onChange={(e) => setTargetOrgId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-sky-500 focus:outline-none"
                required
              >
                <option value="">-- Select Organization --</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    #{org.id} - {org.name} ({org.organizationType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Position / Official Title</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Field Coordinator"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-sky-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={assigningUser || !selectedUser}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:hover:bg-sky-600 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {assigningUser ? 'Assigning...' : 'Link User to Org'}
            </button>
          </form>

          {orgUserResult && (
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-1.5 text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Personnel Linked Successfully
              </span>
              <div className="text-slate-300">
                <p>
                  <strong className="text-white">User:</strong> {orgUserResult.userName} (ID #{orgUserResult.userId})
                </p>
                <p>
                  <strong className="text-white">Organization:</strong> {orgUserResult.organizationName}
                </p>
                <p>
                  <strong className="text-white">Role Position:</strong> {orgUserResult.position}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Directory Listing */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" /> Active Organizations Directory ({organizations.length})
          </h2>
          <button
            onClick={fetchInitialData}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500 text-xs">Loading directory...</div>
        ) : organizations.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">No active organizations recorded.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizations.map((org) => (
              <div key={org.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">{org.name}</span>
                  <span className="bg-purple-950 text-purple-400 border border-purple-800 px-2 py-0.5 rounded text-[10px] font-mono">
                    {org.organizationType}
                  </span>
                </div>
                <p className="text-slate-400 line-clamp-2">{org.description}</p>
                <div className="text-slate-500 font-mono text-[11px] pt-1 border-t border-slate-800/80">
                  Email: {org.email} | Phone: {org.phone}
                </div>
                {org.locations && org.locations.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400 pt-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">
                      Locations: {org.locations.map((l) => l.locationName || l.city).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};