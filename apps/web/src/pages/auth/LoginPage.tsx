import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, ApiError } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { UserRole } from '@mentorconnect/shared';
import { ShieldCheck, UserCheck, GraduationCap, Lock, Mail, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data: any = await api.post('/auth/login', { email, password });
      login(data.accessToken, data.user);

      // Redirect according to role
      if (data.user.role === UserRole.STUDENT) {
        navigate('/student/dashboard');
      } else if (data.user.role === UserRole.MENTOR) {
        navigate('/mentor/dashboard');
      } else if (data.user.role === UserRole.HOD) {
        navigate('/hod/dashboard');
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to connect to authentication server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-2xl shadow-md mb-3">
          M
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign in to MentorConnect
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Production-Ready Student–Faculty Mentoring Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="p-6 sm:p-8">
            {errorMessage && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="College Email Address"
                type="email"
                placeholder="you@college.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
              New undergraduate student?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Register Student Profile
              </Link>
            </div>

            {/* Quick Demo Selector for Evaluators */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
                Evaluator Quick Demo Logins
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('hod.cse@college.edu')}
                  className="flex flex-col items-center p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-center group"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600 mb-1" />
                  <span className="text-xs font-semibold text-slate-800">HOD Admin</span>
                  <span className="text-[10px] text-slate-400">hod.cse@</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('dr.sharma@college.edu')}
                  className="flex flex-col items-center p-2.5 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-center group"
                >
                  <UserCheck className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-xs font-semibold text-slate-800">Faculty Mentor</span>
                  <span className="text-[10px] text-slate-400">dr.sharma@</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('bharath.cs@college.edu')}
                  className="flex flex-col items-center p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-center group"
                >
                  <GraduationCap className="w-4 h-4 text-blue-600 mb-1" />
                  <span className="text-xs font-semibold text-slate-800">Student</span>
                  <span className="text-[10px] text-slate-400">bharath.cs@</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
