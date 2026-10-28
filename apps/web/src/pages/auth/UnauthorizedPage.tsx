import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '@mentorconnect/shared';

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (user?.role === UserRole.STUDENT) return '/student/dashboard';
    if (user?.role === UserRole.MENTOR) return '/mentor/dashboard';
    if (user?.role === UserRole.HOD) return '/hod/dashboard';
    return '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">403 — Access Denied</h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          You do not have the required permissions or role authorization to view this resource. Role-based access control (RBAC) is enforced by the MentorConnect security layer.
        </p>
        <div className="pt-2">
          <Button onClick={() => navigate(getDashboardPath())} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-6xl font-black text-indigo-600">404</h1>
        <h2 className="text-xl font-bold text-slate-900">Page Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested page could not be located on the server.
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
