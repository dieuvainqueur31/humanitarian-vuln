import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../../services/api';
import type { UserProfile } from '../../types/admin';
import { Search, X, Loader2, Mail, Shield } from 'lucide-react';

interface UserSelectSearchProps {
  onSelectUser: (user: UserProfile | null) => void;
  selectedUser: UserProfile | null;
}

export const UserSelectSearch: React.FC<UserSelectSearchProps> = ({ onSelectUser, selectedUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced user search query
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        // Supports server-side query filtering: /api/v1/users?search=keyword
        const data = await apiFetch<UserProfile[]>(`/users?search=${encodeURIComponent(searchTerm)}`);
        setResults(data || []);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
         setLoading(false);
      }

    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (selectedUser) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-950 text-sky-400 border border-sky-800 flex items-center justify-center font-bold text-xs">
            {selectedUser.firstName[0]}
            {selectedUser.lastName[0]}
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              {selectedUser.firstName} {selectedUser.lastName}
              <span className="text-[10px] font-mono text-slate-500">#{selectedUser.id}</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-500" /> {selectedUser.email}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelectUser(null)}
          className="text-slate-400 hover:text-rose-400 transition-colors p-1"
          title="Change Selected User"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, or user ID..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-8 text-white text-xs placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
        {loading && <Loader2 className="w-4 h-4 text-sky-400 animate-spin absolute right-2.5 top-2.5" />}
      </div>

      {isOpen && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-800/60">
          {results.length === 0 ? (
            <div className="p-3 text-xs text-slate-500 text-center">No matching user accounts found</div>
          ) : (
            results.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  onSelectUser(user);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="w-full text-left p-2.5 hover:bg-slate-800/70 transition-colors flex items-center justify-between group text-xs"
              >
                <div>
                  <div className="text-white font-medium group-hover:text-sky-300">
                    {user.firstName} {user.lastName} <span className="text-slate-500 text-[10px]">#{user.id}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{user.email}</div>
                </div>
                {user.roles && user.roles.length > 0 && (
                  <span className="text-[10px] font-mono bg-slate-950 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5 text-amber-400" /> {user.roles[0]}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
