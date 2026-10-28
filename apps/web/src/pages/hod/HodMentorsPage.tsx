import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmationModal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { UserPlus, Search, CheckCircle2, AlertCircle } from 'lucide-react';

export function HodMentorsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [page, setPage] = useState(1);

  // New Mentor Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [email, setEmail] = useState('');
  const [mentorDeptId, setMentorDeptId] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [maxCapacity, setMaxCapacity] = useState(10);
  const [password, setPassword] = useState('Password123!');
  const [expertise, setExpertise] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  // Status Toggle Modal State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: deptData } = useQuery<any[]>({
    queryKey: ['departments'],
    queryFn: () => api.get('/departments'),
  });

  const { data, isLoading } = useQuery<any>({
    queryKey: ['hodMentors', search, departmentId, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (departmentId) params.append('departmentId', departmentId);
      params.append('page', String(page));
      params.append('limit', '10');
      return api.get(`/users/mentors?${params.toString()}`);
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/users/mentors', body),
    onSuccess: () => {
      setModalSuccess('Faculty mentor account provisioned successfully.');
      queryClient.invalidateQueries({ queryKey: ['hodMentors'] });
      setTimeout(() => {
        setCreateModalOpen(false);
        setModalSuccess('');
        setFullName('');
        setFacultyId('');
        setEmail('');
        setExpertise('');
      }, 1500);
    },
    onError: (err: any) => setModalError(err.message || 'Failed to create faculty mentor.'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      api.patch(`/users/${userId}/status`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hodMentors'] });
      setConfirmModalOpen(false);
      setSelectedUser(null);
    },
  });

  const handleOpenCreateModal = () => {
    setModalSuccess('');
    setModalError('');
    if (deptData && deptData.length > 0) {
      setMentorDeptId(deptData[0].id);
    }
    setCreateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faculty Mentor Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Provision new faculty mentors, monitor workload allocations, and manage institutional capacity.
          </p>
        </div>

        <Button onClick={handleOpenCreateModal} className="gap-2">
          <UserPlus className="w-4 h-4" /> Provision New Mentor
        </Button>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search by faculty name or Faculty ID..."
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
          </div>
        </CardContent>
      </Card>

      {/* Mentors Table */}
      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <LoadingSpinner message="Loading faculty mentors..." />
          ) : data?.mentors && data.mentors.length > 0 ? (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Faculty Member & ID</th>
                  <th className="py-3 px-4">Department & Role</th>
                  <th className="py-3 px-4">Mentee Quota</th>
                  <th className="py-3 px-4">Capacity Status</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.mentors.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">{m.fullName}</span>
                      <span className="text-[11px] text-slate-400">{m.facultyId} • {m.email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">{m.designation}</span>
                      <span className="text-[11px] text-slate-400">{m.department.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {m.activeMenteeCount} / {m.maxCapacity} Mentees
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={m.isAtCapacity ? 'destructive' : 'success'}>
                        {m.isAtCapacity ? 'Full Capacity' : `${m.availableSlots} Slots Available`}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={m.isActive ? 'success' : 'destructive'}>
                        {m.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant={m.isActive ? 'outline' : 'secondary'}
                        className={`text-xs ${m.isActive ? 'text-red-600' : 'text-emerald-700'}`}
                        onClick={() => {
                          setSelectedUser(m);
                          setConfirmModalOpen(true);
                        }}
                      >
                        {m.isActive ? 'Deactivate' : 'Reactivate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              icon={UserPlus}
              title="No Faculty Mentors Found"
              description="No mentors match the selected criteria."
            />
          )}
        </div>
      </Card>

      {/* Provision New Faculty Mentor Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Provision New Faculty Mentor"
        description="Create an institutional faculty account with authorized mentoring role."
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                createMutation.mutate({
                  fullName,
                  facultyId,
                  email,
                  departmentId: mentorDeptId || deptData?.[0]?.id,
                  designation,
                  maxCapacity: Number(maxCapacity),
                  password,
                  expertise: expertise.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
              isLoading={createMutation.isPending}
              disabled={!fullName || !facultyId || !email}
            >
              Provision Account
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name *" placeholder="e.g. Dr. Rajesh Kumar" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input label="Faculty ID *" placeholder="e.g. FAC-CSE-004" value={facultyId} onChange={(e) => setFacultyId(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Institutional Email *" type="email" placeholder="rajesh@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Temporary Password *" type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select label="Department *" value={mentorDeptId} onChange={(e) => setMentorDeptId(e.target.value)}>
              {deptData?.map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </Select>

            <Input label="Designation *" value={designation} onChange={(e) => setDesignation(e.target.value)} />

            <Input
              label="Mentee Capacity Quota"
              type="number"
              min={1}
              max={50}
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number(e.target.value))}
            />
          </div>

          <Input
            label="Areas of Expertise (comma-separated)"
            placeholder="e.g. Cyber Security, Cryptography, Network Protocols"
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
          />
        </div>
      </Modal>

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
          title={selectedUser.isActive ? 'Deactivate Mentor Account' : 'Reactivate Mentor Account'}
          message={`Are you sure you want to ${
            selectedUser.isActive ? 'deactivate' : 'reactivate'
          } account access for faculty member ${selectedUser.fullName} (${selectedUser.facultyId})?`}
          confirmText={selectedUser.isActive ? 'Deactivate' : 'Reactivate'}
        />
      )}
    </div>
  );
}
