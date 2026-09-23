import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { UserRole } from '../context/AuthContextObject';
import { useAuth } from '../context/useAuth';
import { apiFetch } from '../services/api';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: LoginUserResponse;
}
interface LocationState {
  from?: {
    pathname: string;
  };
}
interface LoginUserResponse {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: UserRole[];
}

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const data = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

            // Extract values safely
      const primaryRole = data.user.roles[0]; // "eg.FIELD_AGENT"
      const userEmail = data.user.email;


      // 1. Save auth state
      //login(data.token, data.email, data.role);
      login(data.accessToken, userEmail, primaryRole);
      

      // 2. Check if user was redirected from a protected 
      const locationState = location.state as LocationState | null;
      const from = locationState?.from?.pathname;
      //const from = (location.state as unknown)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      // 3. Route dynamically based on user role
      switch (primaryRole) {
        case 'VERIFIER':
          navigate('/verifier/queue', { replace: true });
          break;
        case 'ADMIN':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'FIELD_AGENT':
          navigate('/agent', { replace: true });
          break;
        case 'NGO_MANAGER':
          navigate('/ngo', { replace: true });
          break;
        case 'ANALYST':
          navigate('/analytics', { replace: true });
          break;
        case 'COMMUNITY_REPORTER':
        default:
          navigate('/my-reports', { replace: true });
          break;
      }
    } catch (err: unknown) {
      if(err instanceof Error){
         setError(err.message);
      }
      else{
        setError('Invalid credentials');
      }
     
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold text-white">Platform Login</h2>
        {error && <p className="text-xs text-rose-400 bg-rose-950/50 p-3 rounded-lg">{error}</p>}
        
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
            required
          />
        </div>

        <button type="submit" className="w-full py-3 bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white rounded-lg">
          Sign In
        </button>
      </form>
    </div>
  );
};