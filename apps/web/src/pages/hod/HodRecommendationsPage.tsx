import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Compass, Sparkles, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';

export function HodRecommendationsPage() {
  const queryClient = useQueryClient();

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Fetch all students for selector
  const { data: studentsData } = useQuery<any>({
    queryKey: ['studentsForRecommendationSelector'],
    queryFn: () => api.get('/users/students?limit=100'),
  });

  // Fetch dynamic recommendations for selected student
  const { data: matchResult, isLoading: matchLoading } = useQuery<any>({
    queryKey: ['recommendationMatch', selectedStudentId],
    queryFn: () => api.get(`/recommendations/match/${selectedStudentId}`),
    enabled: !!selectedStudentId,
  });

  const assignMutation = useMutation({
    mutationFn: (body: any) => api.post('/assignments', body),
    onSuccess: (res: any) => {
      setActionSuccess(res.message || 'Mentor assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['hodOverviewReport'] });
      setTimeout(() => setActionSuccess(''), 4000);
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to complete assignment.');
    },
  });

  const students = studentsData?.students || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <Compass className="w-6 h-6 text-indigo-600" /> Explainable Mentor Matching System
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Evaluate mentor suitability for any undergraduate student using our multi-criteria matching algorithm.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-sm text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-sm text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Student Selector Card */}
      <Card>
        <CardContent className="p-5">
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Select Student to Generate Mentor Recommendations:
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <Select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setActionSuccess('');
                  setActionError('');
                }}
              >
                <option value="">-- Choose a registered student --</option>
                {students.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.usn}) — {s.department.code} Sem {s.semester}{' '}
                    {s.activeMentor ? `[Assigned: ${s.activeMentor.fullName}]` : '[UNASSIGNED]'}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matching Results */}
      {matchLoading ? (
        <LoadingSpinner message="Calculating explainable compatibility rankings across faculty pool..." />
      ) : matchResult ? (
        <div className="space-y-6">
          {/* Student Profile Snapshot */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200/60 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-900 text-sm">
                Evaluating: {matchResult.student.fullName} ({matchResult.student.usn})
              </span>
              <p className="text-slate-600 mt-0.5">
                {matchResult.student.department} • Semester {matchResult.student.semester}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {matchResult.student.careerGoals?.map((g: string) => (
                <Badge key={g} variant="primary">
                  {g}
                </Badge>
              ))}
            </div>
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matchResult.recommendations.map((rec: any, idx: number) => {
              const isTop = idx === 0 && rec.score >= 70;

              return (
                <Card
                  key={rec.mentorId}
                  className={`flex flex-col justify-between ${
                    isTop ? 'ring-2 ring-indigo-600/30' : ''
                  }`}
                >
                  <div>
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{rec.mentorName}</CardTitle>
                            {isTop && (
                              <Badge variant="primary" className="text-[10px] gap-1">
                                <Sparkles className="w-3 h-3" /> Top Pick
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {rec.designation} • {rec.departmentName}
                          </p>
                        </div>

                        <div className="flex flex-col items-center">
                          <span
                            className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm text-white ${
                              rec.score >= 80
                                ? 'bg-emerald-600'
                                : rec.score >= 60
                                ? 'bg-indigo-600'
                                : 'bg-amber-500'
                            }`}
                          >
                            {rec.score}%
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold mt-0.5">
                            Match
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4 space-y-3">
                      <div className="p-2.5 rounded-lg bg-slate-50 text-xs text-slate-700 space-y-1">
                        <span className="font-semibold text-slate-900 block">Explanation:</span>
                        <p className="leading-relaxed">{rec.explanation.summary}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                            Department
                          </span>
                          <span className="font-medium text-slate-800">
                            {rec.explanation.departmentScore} / 25 pts
                          </span>
                        </div>
                        <div className="p-2 rounded bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                            Availability
                          </span>
                          <span
                            className={`font-medium ${
                              rec.isAtCapacity ? 'text-red-600' : 'text-emerald-700'
                            }`}
                          >
                            {rec.currentMenteeCount}/{rec.maxCapacity} ({rec.availableSlots} open)
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {rec.isAtCapacity ? 'At Full Quota' : 'Quota Open'}
                    </span>
                    <Button
                      size="sm"
                      className="text-xs gap-1"
                      isLoading={assignMutation.isPending}
                      onClick={() =>
                        assignMutation.mutate({
                          studentId: selectedStudentId,
                          mentorId: rec.mentorId,
                          overrideCapacity: rec.isAtCapacity,
                          notes: `Assigned via explainable recommendation match (${rec.score}% compatibility)`,
                        })
                      }
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Accept & Pair
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Compass}
          title="Select a Student to Begin"
          description="Choose any registered student from the dropdown above to run explainable compatibility scoring."
        />
      )}
    </div>
  );
}
