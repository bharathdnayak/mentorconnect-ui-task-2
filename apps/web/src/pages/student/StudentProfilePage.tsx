import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { CheckCircle2, AlertCircle, Save } from 'lucide-react';

export function StudentProfilePage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ['studentProfile'],
    queryFn: () => api.get('/students/profile'),
  });

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [degree, setDegree] = useState('');
  const [semester, setSemester] = useState(1);
  const [section, setSection] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [technicalSkills, setTechnicalSkills] = useState('');
  const [careerGoals, setCareerGoals] = useState('');
  const [guidanceNeeds, setGuidanceNeeds] = useState('');
  const [preferredTopics, setPreferredTopics] = useState('');
  const [bio, setBio] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
      setDegree(profile.degree || '');
      setSemester(profile.semester || 1);
      setSection(profile.section || '');
      setHobbies(profile.hobbies || '');
      setTechnicalSkills((profile.technicalSkills || []).join(', '));
      setCareerGoals((profile.careerGoals || []).join(', '));
      setGuidanceNeeds((profile.guidanceNeeds || []).join(', '));
      setPreferredTopics((profile.preferredTopics || []).join(', '));
      setBio(profile.bio || '');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (payload: any) => api.put('/students/profile', payload),
    onSuccess: (updatedData: any) => {
      setSuccessMessage('Your mentoring profile has been saved successfully.');
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
      setTimeout(() => setSuccessMessage(''), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to update profile.');
    },
  });

  if (isLoading) return <LoadingSpinner message="Loading profile..." />;

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
      phone,
      degree,
      semester: Number(semester),
      section,
      hobbies,
      technicalSkills: splitTags(technicalSkills),
      careerGoals: splitTags(careerGoals),
      guidanceNeeds: splitTags(guidanceNeeds),
      preferredTopics: splitTags(preferredTopics),
      bio,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Mentoring Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete your academic background, career ambitions, and areas where you need faculty guidance.
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
        {/* Academic Overview Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Academic Information</CardTitle>
              <Badge variant={profile?.profileCompleted ? 'success' : 'warning'}>
                {profile?.profileCompleted ? 'Profile Verified' : 'Incomplete Profile'}
              </Badge>
            </div>
            <CardDescription>Institutional credentials associated with your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <Input label="USN / Student ID" disabled value={profile?.usn || ''} helperText="USN is registered and cannot be modified." />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Department" disabled value={profile?.department?.name || ''} />
              <Input label="Degree / Programme" value={degree} onChange={(e) => setDegree(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select label="Semester" value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </Select>
              <Input label="Section" placeholder="e.g. A" value={section} onChange={(e) => setSection(e.target.value)} />
              <Input label="Phone Number" placeholder="+91 ..." value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Mentoring Match Criteria Card */}
        <Card>
          <CardHeader>
            <CardTitle>Mentoring Interests & Guidance Goals</CardTitle>
            <CardDescription>
              These tags feed directly into the explainable matching algorithm to suggest the best faculty mentors.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Technical Skills (comma-separated)"
              placeholder="e.g. TypeScript, React, Python, Docker, PostgreSQL"
              value={technicalSkills}
              onChange={(e) => setTechnicalSkills(e.target.value)}
              helperText="Separate multiple skills with commas"
            />

            <Input
              label="Career Goals & Aspirations (comma-separated)"
              placeholder="e.g. Cloud Solutions Architect, Full-Stack Engineer, AI Researcher"
              value={careerGoals}
              onChange={(e) => setCareerGoals(e.target.value)}
              helperText="Role titles or domains you wish to pursue"
            />

            <Input
              label="Areas Needing Guidance (comma-separated)"
              placeholder="e.g. Final Year Project, System Design, Resume Review, Placement Prep"
              value={guidanceNeeds}
              onChange={(e) => setGuidanceNeeds(e.target.value)}
              helperText="Topics you need faculty advice on"
            />

            <Input
              label="Preferred Mentoring Topics (comma-separated)"
              placeholder="e.g. Distributed Systems, Microservices, Open Source"
              value={preferredTopics}
              onChange={(e) => setPreferredTopics(e.target.value)}
            />

            <Input
              label="Hobbies & Personal Interests"
              placeholder="e.g. Competitive programming, hackathons, robotics, reading"
              value={hobbies}
              onChange={(e) => setHobbies(e.target.value)}
            />

            <Textarea
              label="Short Self-Introduction / Bio"
              rows={4}
              placeholder="Tell your faculty mentor about yourself, your background, and your aspirations..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="gap-2" isLoading={updateMutation.isPending}>
            <Save className="w-4 h-4" /> Save Mentoring Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
