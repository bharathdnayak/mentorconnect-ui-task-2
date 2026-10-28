import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';
import {
  UserCheck,
  Mail,
  Phone,
  Building2,
  BookOpen,
  Code2,
  Compass,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function StudentMentorPage() {
  const queryClient = useQueryClient();
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const { data: mentorData, isLoading } = useQuery<any>({
    queryKey: ['myMentor'],
    queryFn: () => api.get('/students/my-mentor'),
  });

  const { data: changeRequests } = useQuery<any[]>({
    queryKey: ['myChangeRequests'],
    queryFn: () => api.get('/students/change-requests'),
  });

  const changeRequestMutation = useMutation({
    mutationFn: (body: { reason: string }) => api.post('/students/change-request', body),
    onSuccess: () => {
      setModalSuccess('Your mentor change request has been submitted for HOD review.');
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['myChangeRequests'] });
      setTimeout(() => {
        setChangeModalOpen(false);
        setModalSuccess('');
      }, 2000);
    },
    onError: (err: any) => {
      setModalError(err.message || 'Failed to submit request.');
    },
  });

  if (isLoading) return <LoadingSpinner message="Loading mentor details..." />;

  const mentor = mentorData?.mentor;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Faculty Mentor</h1>
          <p className="text-sm text-slate-500 mt-1">
            Official academic and career guide assigned by the department
          </p>
        </div>

        {mentor && (
          <Button variant="outline" className="gap-2" onClick={() => setChangeModalOpen(true)}>
            <ArrowRightLeft className="w-4 h-4 text-slate-600" /> Request Mentor Change
          </Button>
        )}
      </div>

      {mentor ? (
        <div className="space-y-6">
          {/* Mentor Profile Card */}
          <Card>
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                    {mentor.fullName.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{mentor.fullName}</CardTitle>
                    <CardDescription className="text-slate-600 font-medium">
                      {mentor.designation} • {mentor.department?.name}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="success" className="self-start sm:self-center">
                  Active Faculty Mentor
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span>{mentor.email}</span>
                </div>
                {mentor.phone && (
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Phone className="w-4 h-4 text-indigo-600" />
                    <span>{mentor.phone}</span>
                  </div>
                )}
              </div>

              {/* Professional Biography */}
              {mentor.bio && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Professional Biography
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{mentor.bio}</p>
                </div>
              )}

              {/* Areas of Expertise */}
              {mentor.expertise && mentor.expertise.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Areas of Expertise
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.expertise.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Skills */}
              {mentor.technicalSkills && mentor.technicalSkills.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-600" /> Technical Competencies
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.technicalSkills.map((tag: string) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Mentoring Interests */}
              {mentor.mentoringInterests && mentor.mentoringInterests.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-600" /> Mentoring Interests
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.mentoringInterests.map((tag: string) => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyState
          icon={UserCheck}
          title="No Faculty Mentor Assigned"
          description="The Head of Department has not yet assigned a faculty mentor to your profile. Check recommended mentors or notify administration."
          actionText="View Mentor Recommendations"
          onAction={() => {}}
        />
      )}

      {/* Change Requests History */}
      {changeRequests && changeRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mentor Change Request History</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {changeRequests.map((req: any) => (
              <div key={req.id} className="py-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    Submitted on {formatDate(req.createdAt)}
                  </span>
                  <Badge
                    variant={
                      req.status === 'APPROVED'
                        ? 'success'
                        : req.status === 'REJECTED'
                        ? 'destructive'
                        : 'warning'
                    }
                  >
                    {req.status}
                  </Badge>
                </div>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg">Reason: "{req.reason}"</p>
                {req.reviewNotes && (
                  <p className="text-slate-500 italic pl-1">HOD Review Notes: {req.reviewNotes}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Change Request Modal */}
      <Modal
        isOpen={changeModalOpen}
        onClose={() => setChangeModalOpen(false)}
        title="Request Mentor Change"
        description="Submit an official request to the Head of Department (HOD) explaining the reason for reassignment."
        footer={
          <>
            <Button variant="outline" onClick={() => setChangeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => changeRequestMutation.mutate({ reason })}
              isLoading={changeRequestMutation.isPending}
              disabled={reason.trim().length < 10}
            >
              Submit Request
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {modalSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{modalSuccess}</span>
            </div>
          )}
          {modalError && (
            <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{modalError}</span>
            </div>
          )}

          <Textarea
            label="Reason for Reassignment Request *"
            rows={4}
            placeholder="Please detail why a mentor change is requested (e.g. shift in research domain, scheduling conflict, technical focus)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            helperText="Minimum 10 characters required."
          />
        </div>
      </Modal>
    </div>
  );
}
