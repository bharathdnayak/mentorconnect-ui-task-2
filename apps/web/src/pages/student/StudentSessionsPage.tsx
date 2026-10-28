import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDateTime, formatDate } from '../../lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  FileText,
  CheckCircle,
  Star,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export function StudentSessionsPage() {
  const queryClient = useQueryClient();

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const { data: sessions, isLoading } = useQuery<any[]>({
    queryKey: ['studentSessions'],
    queryFn: () => api.get('/students/sessions'),
  });

  const toggleActionItemMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/sessions/action-items/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentSessions'] });
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
    },
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: (body: { rating: number; comment: string }) =>
      api.post(`/sessions/${selectedSession.id}/feedback`, body),
    onSuccess: () => {
      setFeedbackSuccess('Feedback submitted successfully. Thank you!');
      queryClient.invalidateQueries({ queryKey: ['studentSessions'] });
      setTimeout(() => {
        setFeedbackModalOpen(false);
        setFeedbackSuccess('');
        setSelectedSession(null);
        setComment('');
      }, 1800);
    },
    onError: (err: any) => {
      setFeedbackError(err.message || 'Failed to submit feedback.');
    },
  });

  if (isLoading) return <LoadingSpinner message="Loading mentoring sessions..." />;

  const statusVariantMap: Record<string, 'primary' | 'success' | 'destructive' | 'warning'> = {
    SCHEDULED: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'destructive',
    RESCHEDULED: 'warning',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mentoring Sessions</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review upcoming schedules, past discussions, shared action items, and submit meeting feedback.
        </p>
      </div>

      {sessions && sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session: any) => {
            const hasFeedback = session.feedbacks && session.feedbacks.length > 0;

            return (
              <Card key={session.id} className="overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{session.title}</CardTitle>
                        <Badge variant={statusVariantMap[session.status] || 'secondary'}>
                          {session.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs mt-1">
                        Mentor: {session.mentor.fullName} ({session.mentor.designation})
                      </CardDescription>
                    </div>

                    {session.status === 'COMPLETED' && (
                      <div>
                        {hasFeedback ? (
                          <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>Rated {session.feedbacks[0].rating}/5 Stars</span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs gap-1.5"
                            onClick={() => {
                              setSelectedSession(session);
                              setFeedbackModalOpen(true);
                            }}
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500" /> Submit Feedback
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {/* Date, duration, meeting details */}
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
                        className="flex items-center gap-1.5 text-indigo-600 hover:underline font-medium"
                      >
                        <Video className="w-3.5 h-3.5 text-indigo-600" /> Join Virtual Meeting
                      </a>
                    )}
                  </div>

                  {/* Agenda */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-800 block mb-1">Agenda:</span>
                    <p className="text-slate-600 leading-relaxed">{session.agenda}</p>
                  </div>

                  {/* Notes Shared with Student */}
                  {session.notes && session.notes.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" /> Meeting Notes & Feedback
                      </span>
                      {session.notes.map((note: any) => (
                        <div
                          key={note.id}
                          className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 leading-relaxed"
                        >
                          {note.content}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Items */}
                  {session.actionItems && session.actionItems.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-700 block">
                        Assigned Action Items:
                      </span>
                      <div className="space-y-1.5">
                        {session.actionItems.map((ai: any) => {
                          const isDone = ai.status === 'COMPLETED';

                          return (
                            <div
                              key={ai.id}
                              className="flex items-start justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs gap-3"
                            >
                              <div className="flex items-start gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() =>
                                    toggleActionItemMutation.mutate({
                                      id: ai.id,
                                      status: isDone ? 'PENDING' : 'COMPLETED',
                                    })
                                  }
                                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                  <span
                                    className={`font-medium ${
                                      isDone ? 'line-through text-slate-400' : 'text-slate-800'
                                    }`}
                                  >
                                    {ai.description}
                                  </span>
                                  {ai.dueDate && (
                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                      Due: {formatDate(ai.dueDate)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Badge variant={isDone ? 'success' : 'warning'}>
                                {ai.status}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
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
          title="No Mentoring Sessions"
          description="You do not have any scheduled or past mentoring sessions yet."
        />
      )}

      {/* Feedback Submission Modal */}
      {selectedSession && (
        <Modal
          isOpen={feedbackModalOpen}
          onClose={() => setFeedbackModalOpen(false)}
          title={`Session Feedback — ${selectedSession.title}`}
          description="Your constructive feedback helps mentors evaluate session outcomes and refine their guidance."
          footer={
            <>
              <Button variant="outline" onClick={() => setFeedbackModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => submitFeedbackMutation.mutate({ rating, comment })}
                isLoading={submitFeedbackMutation.isPending}
                disabled={comment.trim().length < 5}
              >
                Submit Feedback
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {feedbackSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{feedbackSuccess}</span>
              </div>
            )}
            {feedbackError && (
              <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{feedbackError}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mentoring Experience Rating:
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm font-semibold text-slate-700 ml-2">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            <Textarea
              label="Feedback & Meeting Outcomes *"
              rows={4}
              placeholder="What went well in this session? What actionable guidance was provided?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              helperText="Minimum 5 characters."
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
