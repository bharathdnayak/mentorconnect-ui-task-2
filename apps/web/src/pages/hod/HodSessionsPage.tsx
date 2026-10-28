import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDateTime, formatDate } from '../../lib/utils';
import { Calendar, Clock, Star, MapPin, Video, Users } from 'lucide-react';

export function HodSessionsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<any>({
    queryKey: ['allSessionsOverview', status, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', String(page));
      params.append('limit', '12');
      return api.get(`/sessions/overview?${params.toString()}`);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Institutional Sessions Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Global monitoring of mentoring sessions, discussion completion rates, and feedback.
          </p>
        </div>

        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-48">
          <option value="">All Session Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading sessions..." />
      ) : data?.sessions && data.sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.sessions.map((session: any) => {
            const hasFeedback = session.feedbacks && session.feedbacks.length > 0;

            return (
              <Card key={session.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{session.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Student: <span className="font-medium text-slate-700">{session.student.fullName} ({session.student.usn})</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Mentor: <span className="font-medium text-slate-700">{session.mentor.fullName}</span>
                    </p>
                  </div>
                  <Badge variant={session.status === 'COMPLETED' ? 'success' : 'primary'}>
                    {session.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    {formatDateTime(session.scheduledAt)}
                  </span>
                  <span>•</span>
                  <span>{session.durationMinutes}m ({session.meetingType})</span>
                  {hasFeedback && (
                    <span className="flex items-center gap-1 text-amber-700 font-semibold ml-auto">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {session.feedbacks[0].rating}/5
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No Sessions Recorded"
          description="No sessions match the selected filter."
        />
      )}
    </div>
  );
}
