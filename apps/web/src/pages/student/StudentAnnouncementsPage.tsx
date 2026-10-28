import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';
import { Megaphone, AlertCircle, Info } from 'lucide-react';

export function StudentAnnouncementsPage() {
  const { data: announcements, isLoading } = useQuery<any[]>({
    queryKey: ['announcements'],
    queryFn: () => api.get('/announcements'),
  });

  if (isLoading) return <LoadingSpinner message="Loading announcements..." />;

  const priorityMap: Record<string, 'primary' | 'warning' | 'destructive'> = {
    NORMAL: 'primary',
    IMPORTANT: 'warning',
    URGENT: 'destructive',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Institutional Announcements</h1>
        <p className="text-sm text-slate-500 mt-1">
          Official departmental and college updates regarding mentoring reviews, clinics, and schedules.
        </p>
      </div>

      {announcements && announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((a: any) => (
            <Card key={a.id} className="overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{a.title}</CardTitle>
                    <Badge variant={priorityMap[a.priority] || 'primary'}>
                      {a.priority}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(a.createdAt)}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 text-sm text-slate-700 leading-relaxed">
                {a.content}
                {a.department && (
                  <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100">
                    Published for Department of {a.department.name}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Megaphone}
          title="No Announcements"
          description="There are currently no active announcements published for your role."
        />
      )}
    </div>
  );
}

export function StudentSettingsPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account credentials and notification preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session & Security Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-slate-600">
          <p>
            Your account is managed via verified institutional college credentials. Password updates and multi-factor authorization can be synchronized via college directory services.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-semibold text-slate-800 block">Security Protocols:</span>
            <span>• Argon2 / Bcrypt cryptographic password hashing enabled</span>
            <br />
            <span>• Short-lived Bearer access tokens with server-side role validation</span>
            <br />
            <span>• Least-privilege role boundaries strictly enforced on every API route</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
