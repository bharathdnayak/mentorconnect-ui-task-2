import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmationModal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Users, Search, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';

export function HodStudentsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [semester, setSemester] = useState('');
  const [assigned, setAssigned] = useState('');
  const [page, setPage] = useState(1);

  // Status Toggle Modal State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: deptData } = useQuery<any[]>({
    queryKey: ['departments'],
    queryFn: () => api.get('/departments'),
  });

  const { data, isLoading } = useQuery<any>({
    queryKey: ['hodStudents', search, departmentId, semester, assigned, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (departmentId) params.append('departmentId', departmentId);
      if (semester) params.append('semester', semester);
      if (assigned) params.append('assigned', assigned);
      params.append('page', String(page));
      params.append('limit', '10');
      return api.get(`/users/students?${params.toString()}`);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      api.patch(`/users/${userId}/status`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hodStudents'] });
      setConfirmModalOpen(false);
      setSelectedUser(null);
    },
  });

  const handleToggleClick = (student: any) => {
    setSelectedUser(student);
    setConfirmModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Account Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review registered student profiles, verify assignments, and manage access status.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search by student name or USN..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <Select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Departments</option>
              {deptData?.map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </Select>

            <Select
              value={assigned}
              onChange={(e) => {
                setAssigned(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Mentoring Status</option>
              <option value="true">Assigned to Mentor</option>
              <option value="false">Unassigned</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <LoadingSpinner message="Loading students list..." />
          ) : data?.students && data.students.length > 0 ? (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student USN & Name</th>
                  <th className="py-3 px-4">Department & Sem</th>
                  <th className="py-3 px-4">Assigned Mentor</th>
                  <th className="py-3 px-4">Profile Readiness</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.students.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">{s.fullName}</span>
                      <span className="text-[11px] text-slate-400">{s.usn} • {s.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {s.department.code} (Sem {s.semester})
                    </td>
                    <td className="py-3.5 px-4">
                      {s.activeMentor ? (
                        <span className="font-medium text-slate-800">
                          {s.activeMentor.fullName}
                        </span>
                      ) : (
                        <Badge variant="warning">Unassigned</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={s.profileCompleted ? 'success' : 'secondary'}>
                        {s.profileCompleted ? 'Complete' : 'Pending Details'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={s.isActive ? 'success' : 'destructive'}>
                        {s.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant={s.isActive ? 'outline' : 'secondary'}
                        className={`text-xs ${s.isActive ? 'text-red-600 hover:text-red-700' : 'text-emerald-700'}`}
                        onClick={() => handleToggleClick(s)}
                      >
                        {s.isActive ? 'Deactivate' : 'Reactivate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              icon={Users}
              title="No Students Found"
              description="No student accounts match the filter criteria."
            />
          )}
        </div>

        {/* Pagination Controls */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} students)
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Confirmation Modal */}
      {selectedUser && (
        <ConfirmationModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={() =>
            toggleStatusMutation.mutate({
              userId: selectedUser.userId,
              isActive: !selectedUser.isActive,
            })
          }
          isDestructive={selectedUser.isActive}
          isLoading={toggleStatusMutation.isPending}
          title={selectedUser.isActive ? 'Deactivate Student Account' : 'Reactivate Student Account'}
          message={`Are you sure you want to ${
            selectedUser.isActive ? 'deactivate' : 'reactivate'
          } account access for ${selectedUser.fullName} (${selectedUser.usn})? This action will be recorded in the audit trail.`}
          confirmText={selectedUser.isActive ? 'Deactivate Account' : 'Reactivate'}
        />
      )}
    </div>
  );
}
