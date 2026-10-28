import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { CheckCircle2, AlertCircle, Save } from 'lucide-react';

export function MentorProfilePage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ['mentorProfile'],
    queryFn: () => api.get('/mentors/profile'),
  });

  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(10);
  const [expertise, setExpertise] = useState('');
  const [technicalSkills, setTechnicalSkills] = useState('');
  const [researchInterests, setResearchInterests] = useState('');
  const [mentoringInterests, setMentoringInterests] = useState('');
  const [bio, setBio] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setDesignation(profile.designation || '');
      setPhone(profile.phone || '');
      setMaxCapacity(profile.maxCapacity || 10);
      setExpertise((profile.expertise || []).join(', '));
      setTechnicalSkills((profile.technicalSkills || []).join(', '));
      setResearchInterests((profile.researchInterests || []).join(', '));
      setMentoringInterests((profile.mentoringInterests || []).join(', '));
      setBio(profile.bio || '');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (payload: any) => api.put('/mentors/profile', payload),
    onSuccess: () => {
      setSuccessMessage('Faculty profile updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['mentorProfile'] });
      queryClient.invalidateQueries({ queryKey: ['mentorDashboard'] });
      setTimeout(() => setSuccessMessage(''), 4000);
    },
    onError: (err: any) => setErrorMessage(err.message || 'Failed to update profile.'),
  });

  if (isLoading) return <LoadingSpinner message="Loading faculty profile..." />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const splitTags = (str: string) =>
      str
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    updateMutation.mutate({
      fullName,
      designation,
      phone,
      maxCapacity: Number(maxCapacity),
      expertise: splitTags(expertise),
      technicalSkills: splitTags(technicalSkills),
      researchInterests: splitTags(researchInterests),
      mentoringInterests: splitTags(mentoringInterests),
      bio,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Faculty Mentor Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your academic background, areas of expertise, research domains, and mentee capacity limit.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-sm text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-sm text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Faculty Details</CardTitle>
            <CardDescription>Official institution profile and workload quota</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <Input label="Faculty ID" disabled value={profile?.facultyId || ''} helperText="Faculty ID cannot be changed." />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Department" disabled value={profile?.department?.name || ''} />
              <Input label="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />
              <Input
                label="Maximum Mentee Capacity"
                type="number"
                min={1}
                max={50}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                helperText={`Current Mentees: ${profile?.currentMenteeCount || 0}`}
              />
            </div>

            <Input label="Phone Number" placeholder="+91 ..." value={phone} onChange={(e) => setPhone(e.target.value)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expertise, Research & Mentoring Focus</CardTitle>
            <CardDescription>
              Used by the algorithm to match students with aligned career aspirations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Areas of Expertise (comma-separated)"
              placeholder="e.g. Cloud Computing, Distributed Systems, Software Engineering"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              helperText="Major academic and industrial subjects"
            />

            <Input
              label="Technical Skills (comma-separated)"
              placeholder="e.g. Kubernetes, Go, Docker, PostgreSQL, React"
              value={technicalSkills}
              onChange={(e) => setTechnicalSkills(e.target.value)}
            />

            <Input
              label="Research Interests (comma-separated)"
              placeholder="e.g. Microservices Reliability, High-Performance Computing"
              value={researchInterests}
              onChange={(e) => setResearchInterests(e.target.value)}
            />

            <Input
              label="Mentoring Interests (comma-separated)"
              placeholder="e.g. Career Coaching, Higher Studies, Portfolio Building"
              value={mentoringInterests}
              onChange={(e) => setMentoringInterests(e.target.value)}
            />

            <Textarea
              label="Professional Biography"
              rows={4}
              placeholder="Overview of your teaching experience, research achievements, and mentoring philosophy..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="gap-2" isLoading={updateMutation.isPending}>
            <Save className="w-4 h-4" /> Save Faculty Profile
          </Button>
        </div>
      </form>
    </div>
  );
}

export function MentorAnnouncementsPage() {
  const { data: announcements, isLoading } = useQuery<any[]>({
    queryKey: ['announcements'],
    queryFn: () => api.get('/announcements'),
  });

  if (isLoading) return <LoadingSpinner message="Loading announcements..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Faculty Announcements</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review department notices and mentoring cycle deadlines.
        </p>
      </div>

      <div className="space-y-4">
        {announcements && announcements.length > 0 ? (
          announcements.map((a: any) => (
            <Card key={a.id}>
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <Badge variant={a.priority === 'URGENT' ? 'destructive' : 'primary'}>
                    {a.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 text-sm text-slate-700 leading-relaxed">
                {a.content}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-xs text-slate-400 py-6 text-center">No announcements found.</p>
        )}
      </div>
    </div>
  );
}

export function MentorSettingsPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Faculty Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage notification and security settings.</p>
      </div>

      <Card>
        <CardContent className="p-6 text-xs text-slate-600 space-y-3">
          <p className="font-semibold text-slate-900">Role: Faculty Mentor</p>
          <p>
            Your account is secured by session token rotation and institutional directory controls.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
