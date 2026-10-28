import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate, formatDateTime } from '../../lib/utils';
import {
  ArrowLeft,
  Calendar,
  Clock,
  PlusCircle,
  FileText,
  Lock,
  Eye,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  GraduationCap,
  Target,
  Sparkles,
} from 'lucide-react';

export function MenteeDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const queryClient = useQueryClient();

  // Modals state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [actionItemModalOpen, setActionItemModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  // Schedule Form State
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [meetingType, setMeetingType] = useState('IN_PERSON');
  const [location, setLocation] = useState('Faculty Cabin');
  const [meetingLink, setMeetingLink] = useState('');
  const [agenda, setAgenda] = useState('');

  // Note Form State
  const [noteContent, setNoteContent] = useState('');
  const [visibility, setVisibility] = useState('SHARED_STUDENT');

  // Action Item Form State
  const [actionDescription, setActionDescription] = useState('');
  const [actionDueDate, setActionDueDate] = useState('');

  // Status messages
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  const { data, isLoading, error } = useQuery<any>({
    queryKey: ['menteeDetail', studentId],
    queryFn: () => api.get(`/mentors/mentees/${studentId}`),
    enabled: !!studentId,
  });

  const scheduleMutation = useMutation({
    mutationFn: (body: any) => api.post('/sessions', body),
    onSuccess: () => {
      setModalSuccess('Mentoring session scheduled successfully.');
      queryClient.invalidateQueries({ queryKey: ['menteeDetail', studentId] });
      queryClient.invalidateQueries({ queryKey: ['mentorDashboard'] });
      setTimeout(() => {
        setScheduleModalOpen(false);
        setModalSuccess('');
      }, 1500);
    },
    onError: (err: any) => setModalError(err.message || 'Failed to schedule session.'),
  });

  const noteMutation = useMutation({
    mutationFn: ({ sessionId, body }: { sessionId: string; body: any }) =>
      api.post(`/sessions/${sessionId}/notes`, body),
    onSuccess: () => {
      setModalSuccess('Mentoring note saved.');
      queryClient.invalidateQueries({ queryKey: ['menteeDetail', studentId] });
      setTimeout(() => {
        setNoteModalOpen(false);
        setModalSuccess('');
        setNoteContent('');
      }, 1500);
    },
    onError: (err: any) => setModalError(err.message || 'Failed to add note.'),
  });

  const actionMutation = useMutation({
    mutationFn: ({ sessionId, body }: { sessionId: string; body: any }) =>
      api.post(`/sessions/${sessionId}/action-items`, body),
    onSuccess: () => {
      setModalSuccess('Action item created.');
      queryClient.invalidateQueries({ queryKey: ['menteeDetail', studentId] });
      setTimeout(() => {
        setActionItemModalOpen(false);
        setModalSuccess('');
        setActionDescription('');
      }, 1500);
    },
    onError: (err: any) => setModalError(err.message || 'Failed to add action item.'),
  });

  if (isLoading) return <LoadingSpinner message="Loading mentee mentoring record..." />;
  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
        Access Denied or Mentee Record Not Found. You may only view students assigned directly to you.
      </div>
    );
  }

  const { student, assignment, sessions } = data;

  const handleOpenSchedule = () => {
    setModalError('');
    setModalSuccess('');
    setTitle('Regular Mentoring Discussion');
    setAgenda('Academic progress, curriculum topics, and project roadmap.');
    // Default to tomorrow 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setScheduledAt(tomorrow.toISOString().slice(0, 16));
    setScheduleModalOpen(true);
  };

  const handleOpenNoteModal = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setNoteContent('');
    setModalError('');
    setModalSuccess('');
    setNoteModalOpen(true);
  };

  const handleOpenActionModal = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setActionDescription('');
    setModalError('');
    setModalSuccess('');
    setActionItemModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/mentor/mentees">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back to Mentees
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{student.fullName}</h1>
            <p className="text-xs text-slate-500">
              USN: {student.usn} • Semester {student.semester} • {student.department?.name}
            </p>
          </div>
        </div>

        <Button onClick={handleOpenSchedule} className="gap-2">
          <Calendar className="w-4 h-4" /> Schedule Mentoring Session
        </Button>
      </div>

      {/* Mentee Profile Summary Card */}
      <Card>
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Mentee Profile Details</CardTitle>
            <Badge variant="success">Assigned on {formatDate(assignment.assignedAt)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">Contact</span>
              <span className="font-medium text-slate-800">{student.user?.email}</span>
              {student.phone && <span className="block text-slate-500">{student.phone}</span>}
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">Degree & Section</span>
              <span className="font-medium text-slate-800">{student.degree}</span>
              <span className="block text-slate-500">Section {student.section || 'A'} • Academic Year 2026-27</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">Assignment Note</span>
              <span className="font-medium text-slate-800">{assignment.notes || 'Direct Assignment'}</span>
            </div>
          </div>

          {/* Bio */}
          {student.bio && (
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Self-Introduction / Bio
              </span>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed">
                {student.bio}
              </p>
            </div>
          )}

          {/* Career Goals & Guidance Needs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-600" /> Career Ambitions
              </span>
              <div className="flex flex-wrap gap-1">
                {student.careerGoals?.length > 0 ? (
                  student.careerGoals.map((g: string) => (
                    <Badge key={g} variant="primary">
                      {g}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">None specified yet</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Guidance Needs
              </span>
              <div className="flex flex-wrap gap-1">
                {student.guidanceNeeds?.length > 0 ? (
                  student.guidanceNeeds.map((need: string) => (
                    <Badge key={need} variant="secondary">
                      {need}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">None specified yet</span>
                )}
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          {student.technicalSkills && student.technicalSkills.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Technical Skills & Tools
              </span>
              <div className="flex flex-wrap gap-1">
                {student.technicalSkills.map((s: string) => (
                  <span key={s} className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mentoring Sessions History & Notes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Mentoring Sessions & Notes</h2>
          <span className="text-xs text-slate-500 font-medium">{sessions.length} Sessions Recorded</span>
        </div>

        {sessions && sessions.length > 0 ? (
          sessions.map((session: any) => (
            <Card key={session.id} className="overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{session.title}</CardTitle>
                      <Badge variant="primary">{session.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{formatDateTime(session.scheduledAt)}</span>
                      <span>•</span>
                      <span>{session.durationMinutes} mins ({session.meetingType})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      onClick={() => handleOpenNoteModal(session.id)}
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" /> Add Note
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      onClick={() => handleOpenActionModal(session.id)}
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-600" /> Action Item
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                {/* Agenda */}
                <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900 block mb-0.5">Agenda:</span>
                  {session.agenda}
                </div>

                {/* Session Notes */}
                {session.notes && session.notes.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Session Notes & Observations
                    </span>
                    <div className="space-y-2">
                      {session.notes.map((n: any) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-lg text-xs leading-relaxed border ${
                            n.visibility === 'PRIVATE_MENTOR'
                              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                              : 'bg-indigo-50/50 border-indigo-100 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold flex items-center gap-1.5">
                              {n.visibility === 'PRIVATE_MENTOR' ? (
                                <>
                                  <Lock className="w-3 h-3 text-amber-700" /> Confidential Mentor Note (Hidden from Student)
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3 h-3 text-indigo-700" /> Shared with Mentee
                                </>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400">{formatDate(n.createdAt)}</span>
                          </div>
                          <p>{n.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Items */}
                {session.actionItems && session.actionItems.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    <span className="font-semibold text-slate-700 block">Follow-Up Action Items:</span>
                    {session.actionItems.map((ai: any) => (
                      <div
                        key={ai.id}
                        className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-200"
                      >
                        <span className={ai.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-800'}>
                          {ai.description}
                        </span>
                        <Badge variant={ai.status === 'COMPLETED' ? 'success' : 'warning'}>
                          {ai.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState
            icon={Calendar}
            title="No Sessions Recorded"
            description="You have not scheduled any mentoring sessions with this student yet."
            actionText="Schedule First Session"
            onAction={handleOpenSchedule}
          />
        )}
      </div>

      {/* Schedule Session Modal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title={`Schedule Mentoring Session with ${student.fullName}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                scheduleMutation.mutate({
                  title,
                  studentId: student.id,
                  scheduledAt,
                  durationMinutes: Number(durationMinutes),
                  meetingType,
                  location,
                  meetingLink,
                  agenda,
                })
              }
              isLoading={scheduleMutation.isPending}
              disabled={!title || !scheduledAt || !agenda}
            >
              Confirm Schedule
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

          <Input label="Session Title *" value={title} onChange={(e) => setTitle(e.target.value)} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date & Time *"
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
              label="Location / Office"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {meetingType !== 'IN_PERSON' && (
            <Input
              label="Virtual Meeting Link (e.g. Google Meet)"
              placeholder="https://meet.google.com/..."
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
          )}

          <Textarea
            label="Meeting Agenda *"
            rows={3}
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
          />
        </div>
      </Modal>

      {/* Add Note Modal */}
      <Modal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title="Add Mentoring Note"
        footer={
          <>
            <Button variant="outline" onClick={() => setNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                noteMutation.mutate({
                  sessionId: selectedSessionId,
                  body: { content: noteContent, visibility },
                })
              }
              isLoading={noteMutation.isPending}
              disabled={noteContent.trim().length < 3}
            >
              Save Note
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

          <Select
            label="Note Visibility Control"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            helperText="Private notes are strictly confidential to faculty; Shared notes appear on mentee dashboard."
          >
            <option value="SHARED_STUDENT">Shared with Student (Feedback & Guidance)</option>
            <option value="PRIVATE_MENTOR">Private Mentor Only (Confidential Evaluation)</option>
          </Select>

          <Textarea
            label="Note Content *"
            rows={4}
            placeholder="Record observations, student engagement, recommendations..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
        </div>
      </Modal>

      {/* Add Action Item Modal */}
      <Modal
        isOpen={actionItemModalOpen}
        onClose={() => setActionItemModalOpen(false)}
        title="Assign Action Item"
        footer={
          <>
            <Button variant="outline" onClick={() => setActionItemModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                actionMutation.mutate({
                  sessionId: selectedSessionId,
                  body: { description: actionDescription, dueDate: actionDueDate || null },
                })
              }
              isLoading={actionMutation.isPending}
              disabled={actionDescription.trim().length < 3}
            >
              Create Action Item
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Action Item Description *"
            placeholder="e.g. Complete chapter 4 database normalization assignment"
            value={actionDescription}
            onChange={(e) => setActionDescription(e.target.value)}
          />
          <Input
            label="Due Date (Optional)"
            type="date"
            value={actionDueDate}
            onChange={(e) => setActionDueDate(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
