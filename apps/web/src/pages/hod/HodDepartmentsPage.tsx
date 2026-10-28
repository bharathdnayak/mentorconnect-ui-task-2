import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Building2, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export function HodDepartmentsPage() {
  const queryClient = useQueryClient();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  const { data: departments, isLoading } = useQuery<any[]>({
    queryKey: ['departments'],
    queryFn: () => api.get('/departments'),
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/departments', body),
    onSuccess: () => {
      setModalSuccess('Department created successfully.');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setTimeout(() => {
        setCreateModalOpen(false);
        setModalSuccess('');
        setCode('');
        setName('');
        setDescription('');
      }, 1500);
    },
    onError: (err: any) => setModalError(err.message || 'Failed to create department.'),
  });

  if (isLoading) return <LoadingSpinner message="Loading departments..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Departments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage academic faculties, departmental codes, and student enrollment divisions.
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
          <PlusCircle className="w-4 h-4" /> Add New Department
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments?.map((dept: any) => (
          <Card key={dept.id}>
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="primary">{dept.code}</Badge>
                <span className="text-xs text-slate-400 font-medium">
                  {dept.active ? 'Active' : 'Archived'}
                </span>
              </div>
              <CardTitle className="text-base mt-2">{dept.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <p className="text-xs text-slate-600 min-h-[32px]">
                {dept.description || 'College engineering department.'}
              </p>
              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 text-slate-500">
                <span>{dept._count?.students || 0} Students</span>
                <span>{dept._count?.mentors || 0} Mentors</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Department Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Academic Department"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                createMutation.mutate({
                  code: code.toUpperCase().trim(),
                  name: name.trim(),
                  description: description.trim(),
                })
              }
              isLoading={createMutation.isPending}
              disabled={!code || !name}
            >
              Create Department
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

          <Input
            label="Department Code *"
            placeholder="e.g. MECH, CIVIL, ECE"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Input
            label="Department Full Name *"
            placeholder="e.g. Mechanical Engineering"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Description"
            placeholder="e.g. School of Mechanical Sciences"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}

export function HodAnnouncementsPage() {
  const queryClient = useQueryClient();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [priority, setPriority] = useState('NORMAL');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  const { data: announcements, isLoading } = useQuery<any[]>({
    queryKey: ['announcements'],
    queryFn: () => api.get('/announcements'),
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/announcements', body),
    onSuccess: () => {
      setModalSuccess('Announcement published.');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setTimeout(() => {
        setCreateModalOpen(false);
        setModalSuccess('');
        setTitle('');
        setContent('');
      }, 1500);
    },
    onError: (err: any) => setModalError(err.message || 'Failed to publish.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/announcements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  if (isLoading) return <LoadingSpinner message="Loading announcements..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Announcements Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Broadcast institutional notices and mentoring deadlines across roles.
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
          <PlusCircle className="w-4 h-4" /> Publish Announcement
        </Button>
      </div>

      <div className="space-y-4">
        {announcements?.map((a: any) => (
          <Card key={a.id}>
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <Badge variant={a.priority === 'URGENT' ? 'destructive' : a.priority === 'IMPORTANT' ? 'warning' : 'primary'}>
                    {a.priority}
                  </Badge>
                  <Badge variant="outline">Audience: {a.targetRole}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-red-600 hover:bg-red-50"
                  onClick={() => deleteMutation.mutate(a.id)}
                >
                  Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 text-sm text-slate-700 leading-relaxed">
              {a.content}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Publish Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Publish New Announcement"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                createMutation.mutate({
                  title,
                  content,
                  targetRole,
                  priority,
                })
              }
              isLoading={createMutation.isPending}
              disabled={!title || !content}
            >
              Publish
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Title *" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Target Audience" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
              <option value="ALL">All Users (Students & Mentors)</option>
              <option value="STUDENT">Students Only</option>
              <option value="MENTOR">Faculty Mentors Only</option>
            </Select>

            <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="NORMAL">Normal</option>
              <option value="IMPORTANT">Important</option>
              <option value="URGENT">Urgent Alert</option>
            </Select>
          </div>
          <Textarea label="Content *" rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
