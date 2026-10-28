import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Compass, CheckCircle2, UserCheck, AlertCircle, Building2, Sparkles, BookOpen } from 'lucide-react';

export function StudentRecommendationsPage() {
  const { data: recommendations, isLoading, error } = useQuery<any[]>({
    queryKey: ['studentRecommendations'],
    queryFn: () => api.get('/students/recommendations'),
  });

  if (isLoading) return <LoadingSpinner message="Calculating explainable mentor recommendations..." />;
  if (error || !recommendations) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
        Failed to load mentor recommendations.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-indigo-600" /> Explainable Mentor Recommendations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Mentors ranked by multi-factor compatibility: Department alignment, expertise overlap, skills match, and capacity availability.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/60 text-xs text-indigo-900 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Explainability Note:</strong> Recommendations calculate an algorithmic compatibility score (0–100%) based on your profile tags. Recommendations are advisory and do not automatically alter assignments; assignments are authorized by the HOD.
        </p>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec: any, idx: number) => {
          const isTopMatch = idx === 0 && rec.score >= 70;

          return (
            <Card
              key={rec.mentorId}
              className={`flex flex-col justify-between transition-all hover:shadow-md ${
                isTopMatch ? 'ring-2 ring-indigo-600/30' : ''
              }`}
            >
              <div>
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{rec.mentorName}</CardTitle>
                        {isTopMatch && (
                          <Badge variant="primary" className="gap-1">
                            <Sparkles className="w-3 h-3" /> Top Match
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-medium">
                        {rec.designation} • {rec.departmentName}
                      </p>
                    </div>

                    {/* Compatibility Score Circle */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shadow-sm ${
                          rec.score >= 80
                            ? 'bg-emerald-600 text-white'
                            : rec.score >= 60
                            ? 'bg-indigo-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {rec.score}%
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 font-semibold uppercase">
                        Match
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-5 space-y-4">
                  {/* Algorithmic Explanation Summary */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                    <span className="font-semibold text-slate-900 block">Matching Criteria:</span>
                    <p className="leading-relaxed">{rec.explanation.summary}</p>
                  </div>

                  {/* Criteria Breakdown Badges */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-md bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        Department
                      </span>
                      <span className="font-medium text-slate-800">
                        {rec.explanation.departmentMatch ? 'Exact Match (25 pts)' : 'Cross-Dept (5 pts)'}
                      </span>
                    </div>

                    <div className="p-2 rounded-md bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        Workload / Capacity
                      </span>
                      <span
                        className={`font-medium ${
                          rec.isAtCapacity ? 'text-red-600' : 'text-emerald-700'
                        }`}
                      >
                        {rec.isAtCapacity
                          ? 'At Full Capacity (0/0)'
                          : `${rec.availableSlots} Open Slots`}
                      </span>
                    </div>
                  </div>

                  {/* Areas of Expertise */}
                  {rec.expertise && rec.expertise.length > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Domain Expertise
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {rec.expertise.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-[11px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Faculty Capacity: {rec.currentMenteeCount}/{rec.maxCapacity} Mentees</span>
                <span className="font-medium text-indigo-600">Advisory Recommendation</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
