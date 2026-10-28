import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';
import {
  UserCheck,
  UserPlus,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export function HodAssignmentsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [page, setPage] = useState(1);

  // Assign Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [overrideCapacity, setOverrideCapacity] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  // Reassign Modal State
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignStudentId, setReassignStudentId] = useState('');
  const [reassignNewMentorId, setReassignNewMentorId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [reassignOverride, setReassignOverride] = useState(false);
  const [reassignError, setReassignError] = useState('');
  const [reassignSuccess, setReassignSuccess] = useState('');

  // Queries
  const { data, isLoading } = useQuery<any>({
    queryKey: ['assignments', search, status, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      params.append('page', String(page));
      params.append('limit', '10');
      return api.get(`/assignments?${params.toString()}`);
    },
  });

  const { data: unassignedStudents } = useQuery<any[]>({
    queryKey: ['unassignedStudents'],
    queryFn: () => api.get('/assignments/unassigned-students'),
    enabled: assignModalOpen,
  });

  const { data: mentorWorkloads } = useQuery<any[]>({
    queryKey: ['mentorWorkloads'],
    queryFn: () => api.get('/assignments/mentor-workloads'),
    enabled: assignModalOpen || reassignModalOpen,
  });

  // Mutations
  const assignMutation = useMutation({
    mutationFn: (body: any) => api.post('/assignments', body),
    onSuccess: (res: any) => {
      setAssignSuccess(res.message || 'Mentor assigned successfully.');
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['hodOverviewReport'] });
      setTimeout(() => {
        setAssignModalOpen(false);
        setAssignSuccess('');
        setAssignError('');
        setSelectedStudentId('');
        setSelectedMentorId('');
        setOverrideCapacity(false);
      }, 1500);
    },
    onError: (err: any) => {
      setAssignError(err.message || 'Assignment failed.');
    },
  });

  const reassignMutation = useMutation({
    mutationFn: (body: any) => api.post('/assignments/reassign', body),
    onSuccess: (res: any) => {
      setReassignSuccess(res.message || 'Mentor reassigned successfully.');
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['hodOverviewReport'] });
      setTimeout(() => {
        setReassignModalOpen(false);
        setReassignSuccess('');
        setReassignError('');
        setReassignStudentId('');
        setReassignNewMentorId('');
        setReassignReason('');
        setReassignOverride(false);
      }, 1500);
    },
    onError: (err: any) => {
      setReassignError(err.message || 'Reassignment failed.');
    },
  });

  const handleOpenAssignModal = () => {
    setAssignError('');
    setAssignSuccess('');
    setOverrideCapacity(false);
    setAssignmentNotes('Assigned based on academic goals and capacity.');
    setAssignModalOpen(true);
  };

  const handleOpenReassignModal = (studentId: string) => {
    setReassignError('');
    setReassignSuccess('');
    setReassignOverride(false);
    setReassignStudentId(studentId);
    setReassignReason('');
    setReassignModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mentor Assignments & Allocations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enforce mentor-mentee pairings, monitor faculty capacities, and manage reassignments.
          </p>
        </div>

        <Button onClick={handleOpenAssignModal} className="gap-2">
          <UserPlus className="w-4 h-4" /> Assign Unassigned Mentee
        </Button>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search by student name, USN, or mentor name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="ACTIVE">Active Pairings Only</option>
              <option value="REASSIGNED">Reassigned Historical</option>
              <option value="COMPLETED">Completed Mentorships</option>
              <option value="">All Pairings</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <LoadingSpinner message="Loading mentor assignments..." />
          ) : data?.assignments && data.assignments.length > 0 ? (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student Mentee</th>
                  <th className="py-3 px-4">Assigned Mentor</th>
                  <th className="py-3 px-4">Assigned On</th>
                  <th className="py-3 px-4">Pairing Status</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.assignments.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">{a.student.fullName}</span>
                      <span className="text-[11px] text-slate-400">{a.student.usn} • Sem {a.student.semester}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">{a.mentor.fullName}</span>
                      <span className="text-[11px] text-slate-400">{a.mentor.designation}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{formatDate(a.assignedAt)}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          a.status === 'ACTIVE'
                            ? 'success'
                            : a.status === 'REASSIGNED'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {a.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {a.notes || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {a.status === 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs gap-1"
                          onClick={() => handleOpenReassignModal(a.studentId)}
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" /> Reassign
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              icon={UserCheck}
              title="No Assignments Found"
              description="No mentor assignment records match the selected filter."
            />
          )}
        </div>
      </Card>

      {/* Manual Assignment Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Student to Faculty Mentor"
        description="Pair an unassigned student with a suitable mentor according to capacity rules."
        footer={
          <>
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                assignMutation.mutate({
                  studentId: selectedStudentId,
                  mentorId: selectedMentorId,
                  notes: assignmentNotes,
                  overrideCapacity,
                })
              }
              isLoading={assignMutation.isPending}
              disabled={!selectedStudentId || !selectedMentorId}
            >
              Confirm Assignment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {assignSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> <span>{assignSuccess}</span>
            </div>
          )}
          {assignError && (
            <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" /> <span>{assignError}</span>
            </div>
          )}

          <Select
            label="Select Unassigned Student *"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            <option value="">-- Choose unassigned student --</option>
            {unassignedStudents?.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.usn}) — Sem {s.semester} • {s.department.code}
              </option>
            ))}
          </Select>

          <Select
            label="Select Faculty Mentor *"
            value={selectedMentorId}
            onChange={(e) => setSelectedMentorId(e.target.value)}
          >
            <option value="">-- Choose faculty mentor --</option>
            {mentorWorkloads?.map((m: any) => (
              <option key={m.id} value={m.id}>
                {m.fullName} ({m.department.code}) — {m.activeCount}/{m.maxCapacity} Mentees ({m.availableSlots} slots free)
              </option>
            ))}
          </Select>

          <Input
            label="Assignment Notes / Justification"
            value={assignmentNotes}
            onChange={(e) => setAssignmentNotes(e.target.value)}
          />

          {/* Capacity Override Checkbox */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={overrideCapacity}
                onChange={(e) => setOverrideCapacity(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800">
                  Administrative Capacity Override
                </span>
                <p className="text-[11px] text-slate-500">
                  Check this box if assigning beyond the mentor's configured maximum capacity quota. This override will be recorded in the security audit log.
                </p>
              </div>
            </label>
          </div>
        </div>
      </Modal>

      {/* Reassign Student Modal */}
      <Modal
        isOpen={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        title="Reassign Mentee to New Faculty Mentor"
        description="Terminates previous active assignment and transitions student to new mentor with full historical preservation."
        footer={
          <>
            <Button variant="outline" onClick={() => setReassignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                reassignMutation.mutate({
                  studentId: reassignStudentId,
                  newMentorId: reassignNewMentorId,
                  reason: reassignReason,
                  overrideCapacity: reassignOverride,
                })
              }
              isLoading={reassignMutation.isPending}
              disabled={!reassignStudentId || !reassignNewMentorId || reassignReason.trim().length < 3}
            >
              Complete Reassignment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {reassignSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> <span>{reassignSuccess}</span>
            </div>
          )}
          {reassignError && (
            <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" /> <span>{reassignError}</span>
            </div>
          )}

          <Select
            label="Select New Faculty Mentor *"
            value={reassignNewMentorId}
            onChange={(e) => setReassignNewMentorId(e.target.value)}
          >
            <option value="">-- Choose target faculty mentor --</option>
            {mentorWorkloads?.map((m: any) => (
              <option key={m.id} value={m.id}>
                {m.fullName} — {m.activeCount}/{m.maxCapacity} Mentees ({m.availableSlots} open)
              </option>
            ))}
          </Select>

          <Textarea
            label="Reason for Reassignment *"
            rows={3}
            placeholder="Document administrative reasoning (e.g. approved student change request, faculty sabbatical)..."
            value={reassignReason}
            onChange={(e) => setReassignReason(e.target.value)}
          />

          <label className="flex items-start gap-2.5 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={reassignOverride}
              onChange={(e) => setReassignOverride(e.target.checked)}
              className="mt-0.5 rounded text-indigo-600"
            />
            <span className="text-xs text-slate-700">Override capacity if mentor is full</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
