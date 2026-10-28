import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';
import { Compass, CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-react';

export function HodChangeRequestsPage() {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [targetMentorId, setTargetMentorId] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  const { data: requests, isLoading } = useQuery<any[]>({
    queryKey: ['hodChangeRequests', statusFilter],
    queryFn: () => {
      const q = statusFilter ? `?status=${statusFilter}` : '';
      return api.get(`/change-requests${q}`);
    },
  });

  const { data: mentors } = useQuery<any[]>({
    queryKey: ['mentorWorkloads'],
    queryFn: () => api.get('/assignments/mentor-workloads'),
    enabled: reviewModalOpen,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      api.post(`/change-requests/${id}/review`, body),
    onSuccess: (res: any) => {
      setModalSuccess(res.message || 'Change request reviewed.');
      queryClient.invalidateQueries({ queryKey: ['hodChangeRequests'] });
      queryClient.invalidateQueries({ queryKey: ['hodOverviewReport'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setTimeout(() => {
        setReviewModalOpen(false);
        setModalSuccess('');
        setSelectedRequest(null);
        setReviewNotes('');
      }, 1500);
    },
    onError: (err: any) => setModalError(err.message || 'Review failed.'),
  });

  const handleOpenReview = (req: any) => {
    setSelectedRequest(req);
    setDecision('APPROVED');
    setTargetMentorId(req.requestedMentorId || '');
    setReviewNotes('Approved after reviewing alignment with domain interests.');
    setModalSuccess('');
    setModalError('');
    setReviewModalOpen(true);
  };

  if (isLoading) return <LoadingSpinner message="Loading mentor change requests..." />;

  const statusVariantMap: Record<string, 'primary' | 'success' | 'destructive' | 'warning'> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'destructive',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mentor Change Requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review student requests for mentor reassignment, examine reasons, and approve or decline.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {['', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === st
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st === '' ? 'All Requests' : st}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {requests && requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req: any) => (
            <Card key={req.id} className="overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{req.student.fullName}</CardTitle>
                    <span className="text-xs text-slate-500">
                      ({req.student.usn} • Sem {req.student.semester} • {req.student.department.code})
                    </span>
                    <Badge variant={statusVariantMap[req.status] || 'secondary'}>
                      {req.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-400">
                    Submitted: {formatDate(req.createdAt)}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                      Current Mentor
                    </span>
                    <span className="font-semibold text-slate-800">
                      {req.currentMentor ? req.currentMentor.fullName : 'None Assigned'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                      Preferred / Requested Mentor
                    </span>
                    <span className="font-semibold text-slate-800">
                      {req.requestedMentor ? req.requestedMentor.fullName : 'Open to Department Recommendation'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100 text-xs text-amber-900">
                  <span className="font-semibold block mb-0.5">Student's Statement of Reason:</span>
                  "{req.reason}"
                </div>

                {req.reviewNotes && (
                  <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800 block mb-0.5">
                      Decision Notes by {req.reviewedBy || 'HOD'}:
                    </span>
                    {req.reviewNotes}
                  </div>
                )}

                {req.status === 'PENDING' && (
                  <div className="flex justify-end pt-2">
                    <Button size="sm" onClick={() => handleOpenReview(req)}>
                      Review & Decide
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Compass}
          title="No Change Requests"
          description="There are no mentor change requests matching the selected filter."
        />
      )}

      {/* Review Modal */}
      {selectedRequest && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`Review Change Request — ${selectedRequest.student.fullName}`}
          footer={
            <>
              <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={decision === 'APPROVED' ? 'primary' : 'destructive'}
                onClick={() =>
                  reviewMutation.mutate({
                    id: selectedRequest.id,
                    body: {
                      status: decision,
                      targetMentorId: decision === 'APPROVED' ? targetMentorId : undefined,
                      reviewNotes,
                    },
                  })
                }
                isLoading={reviewMutation.isPending}
                disabled={reviewNotes.trim().length < 2}
              >
                Submit Decision
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

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <p>
                <strong>Student:</strong> {selectedRequest.student.fullName} ({selectedRequest.student.usn})
              </p>
              <p>
                <strong>Reason:</strong> "{selectedRequest.reason}"
              </p>
            </div>

            <Select
              label="Administrative Decision *"
              value={decision}
              onChange={(e) => setDecision(e.target.value as any)}
            >
              <option value="APPROVED">Approve & Reassign</option>
              <option value="REJECTED">Reject Request</option>
            </Select>

            {decision === 'APPROVED' && (
              <Select
                label="Assign to New Mentor *"
                value={targetMentorId}
                onChange={(e) => setTargetMentorId(e.target.value)}
              >
                <option value="">-- Choose target faculty mentor --</option>
                {mentors?.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.department.code}) — {m.activeCount}/{m.maxCapacity} Mentees ({m.availableSlots} free)
                  </option>
                ))}
              </Select>
            )}

            <Textarea
              label="Review Notes & Rationale *"
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
