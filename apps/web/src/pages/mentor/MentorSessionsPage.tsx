import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDateTime, formatDate } from '../../lib/utils';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Video,
  MapPin,
  Star,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function MentorSessionsPage() {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // New Session State
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [meetingType, setMeetingType] = useState('IN_PERSON');
  const [location, setLocation] = useState('Faculty Cabin');
  const [meetingLink, setMeetingLink] = useState('');
  const [agenda, setAgenda] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  // Fetch mentor sessions
  const { data: sessions, isLoading } = useQuery<any[]>({
    queryKey: ['mentorSessions', statusFilter],
    queryFn: () => {
      const q = statusFilter ? `?status=${statusFilter}` : '';
      return api.get(`/sessions/mentor-sessions${q}`);
    },
  });

  // Fetch mentees for dropdown
  const { data: mentees } = useQuery<any[]>({
    queryKey: ['myMenteesDropdown'],
    queryFn: () => api.get('/mentors/mentees'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/sessions/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorSessions'] });
      queryClient.invalidateQueries({ queryKey: ['mentorDashboard'] });
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: (body: any) => api.post('/sessions', body),
    onSuccess: () => {
      setModalSuccess('Mentoring session scheduled successfully.');
      queryClient.invalidateQueries({ queryKey: ['mentorSessions'] });
      queryClient.invalidateQueries({ queryKey: ['mentorDashboard'] });
      setTimeout(() => {
        setScheduleModalOpen(false);
        setModalSuccess('');
        setTitle('');
        setAgenda('');
      }, 1500);
    },
    onError: (err: any) => setModalError(err.message || 'Failed to schedule session.'),
  });

  const handleOpenSchedule = () => {
    setModalSuccess('');
    setModalError('');
    if (mentees && mentees.length > 0) {
      setStudentId(mentees[0].student.id);
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    setScheduledAt(tomorrow.toISOString().slice(0, 16));
    setScheduleModalOpen(true);
  };

  if (isLoading) return <LoadingSpinner message="Loading mentoring sessions..." />;

  const statusVariantMap: Record<string, 'primary' | 'success' | 'destructive' | 'warning'> = {
    SCHEDULED: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'destructive',
    RESCHEDULED: 'warning',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mentoring Sessions Schedule</h1>
          <p className="text-sm text-slate-500 mt-1">
            Conduct, track, and update outcomes for individual mentoring sessions.
          </p>
        </div>

        <Button onClick={handleOpenSchedule} className="gap-2">
          <PlusCircle className="w-4 h-4" /> Schedule New Session
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {['', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === st
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st === '' ? 'All Sessions' : st}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {sessions && sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session: any) => {
            const hasFeedback = session.feedbacks && session.feedbacks.length > 0;

            return (
              <Card key={session.id} className="overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{session.title}</CardTitle>
                        <Badge variant={statusVariantMap[session.status] || 'secondary'}>
                          {session.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Mentee:{' '}
                        <Link
                          to={`/mentor/mentees/${session.student.id}`}
                          className="font-semibold text-indigo-600 hover:underline"
                        >
                          {session.student.fullName} ({session.student.usn})
                        </Link>
                      </p>
                    </div>

                    {/* Status Toggle Action Buttons */}
                    <div className="flex items-center gap-2">
                      {session.status === 'SCHEDULED' && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: session.id,
                                status: 'COMPLETED',
                              })
                            }
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs gap-1.5"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: session.id,
                                status: 'CANCELLED',
                              })
                            }
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancel
                          </Button>
                        </>
                      )}

                      {hasFeedback && (
                        <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>Mentee Rated: {session.feedbacks[0].rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                  <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-medium">{formatDateTime(session.scheduledAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{session.durationMinutes} mins</span>
                    </div>
                    {session.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{session.location}</span>
                      </div>
                    )}
                    {session.meetingLink && (
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-indigo-600 hover:underline"
                      >
                        <Video className="w-3.5 h-3.5" /> Video Meeting
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg">
                    <span className="font-semibold text-slate-900 block mb-0.5">Agenda:</span>
                    {session.agenda}
                  </p>

                  {/* Mentee Feedback Review */}
                  {hasFeedback && (
                    <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-100 text-xs text-amber-900">
                      <span className="font-semibold block mb-0.5">Mentee Feedback:</span>
                      "{session.feedbacks[0].comment}"
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No Sessions Found"
          description="No mentoring sessions match the selected filter."
          actionText="Schedule Session"
          onAction={handleOpenSchedule}
        />
      )}

      {/* Schedule Modal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Mentoring Session"
        footer={
          <>
            <Button variant="outline" onClick={() => setScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                scheduleMutation.mutate({
                  studentId,
                  title,
                  scheduledAt,
                  durationMinutes: Number(durationMinutes),
                  meetingType,
                  location,
                  meetingLink,
                  agenda,
                })
              }
              isLoading={scheduleMutation.isPending}
              disabled={!studentId || !title || !scheduledAt || !agenda}
            >
              Schedule
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {modalSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> <span>{modalSuccess}</span>
            </div>
          )}
          {modalError && (
            <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" /> <span>{modalError}</span>
            </div>
          )}

          <Select
            label="Select Mentee *"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            {mentees?.map((m: any) => (
              <option key={m.student.id} value={m.student.id}>
                {m.student.fullName} ({m.student.usn}) — Sem {m.student.semester}
              </option>
            ))}
          </Select>

          <Input
            label="Meeting Title *"
            placeholder="e.g. Mid-term Review, Placement Counseling"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Scheduled Date & Time *"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
            <Select
              label="Duration"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Meeting Type"
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value)}
            >
              <option value="IN_PERSON">In-Person</option>
              <option value="VIRTUAL">Virtual</option>
              <option value="HYBRID">Hybrid</option>
            </Select>
            <Input
              label="Location / Room"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {meetingType !== 'IN_PERSON' && (
            <Input
              label="Meeting Link"
              placeholder="https://meet.google.com/..."
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
          )}

          <Textarea
            label="Agenda & Discussion Points *"
            rows={3}
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
