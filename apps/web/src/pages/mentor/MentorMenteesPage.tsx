import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Link } from 'react-router-dom';
import { Users, Search, GraduationCap, ChevronRight, Mail, Phone } from 'lucide-react';

export function MentorMenteesPage() {
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('');

  const { data: mentees, isLoading } = useQuery<any[]>({
    queryKey: ['myMentees', search, semester],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (semester) params.append('semester', semester);
      return api.get(`/mentors/mentees?${params.toString()}`);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assigned Student Mentees</h1>
          <p className="text-sm text-slate-500 mt-1">
            Undergraduates assigned to your mentoring group for academic tracking and career guidance.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search by student name or USN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <Select value={semester} onChange={(e) => setSemester(e.target.value)}>
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentees Table / Cards */}
      {isLoading ? (
        <LoadingSpinner message="Loading assigned mentees..." />
      ) : mentees && mentees.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {mentees.map(({ student, totalSessions, pendingActionItems, assignedAt }: any) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-base shrink-0">
                    {student.fullName.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{student.fullName}</h3>
                      <Badge variant="primary" className="text-[10px]">
                        Sem {student.semester}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {student.usn}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{student.department?.code} • {student.degree}</span>
                      <span>•</span>
                      <span>{student.email}</span>
                      {student.phone && (
                        <>
                          <span>•</span>
                          <span>{student.phone}</span>
                        </>
                      )}
                    </div>

                    {/* Technical Skills Preview */}
                    {student.technicalSkills && student.technicalSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {student.technicalSkills.slice(0, 4).map((skill: string) => (
                          <span
                            key={skill}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Indicators & Action Button */}
                <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <div className="text-center">
                      <span className="font-bold text-slate-900 block">{totalSessions}</span>
                      <span className="text-[10px] text-slate-400">Sessions</span>
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-amber-600 block">{pendingActionItems}</span>
                      <span className="text-[10px] text-slate-400">Actions</span>
                    </div>
                  </div>

                  <Link to={`/mentor/mentees/${student.id}`}>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      Open Profile <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No Mentees Found"
          description="No students match the selected filter criteria, or no students are currently assigned."
        />
      )}
    </div>
  );
}
