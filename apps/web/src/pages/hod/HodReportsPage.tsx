import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { FileSpreadsheet, Download, ShieldCheck, BarChart3 } from 'lucide-react';

export function HodReportsPage() {
  const { data: reportData, isLoading } = useQuery<any>({
    queryKey: ['hodOverviewReport'],
    queryFn: () => api.get('/reports/overview'),
  });

  const downloadAssignments = () => {
    api.downloadCsv('/reports/export-assignments-csv', 'mentor_assignments_report.csv');
  };

  const downloadSessions = () => {
    api.downloadCsv('/reports/export-sessions-csv', 'mentoring_sessions_report.csv');
  };

  const downloadMentors = () => {
    api.downloadCsv('/reports/export-mentors-csv', 'faculty_workloads_report.csv');
  };

  if (isLoading) return <LoadingSpinner message="Generating report data..." />;

  const { summary } = reportData || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Institutional Reports & Data Exports</h1>
        <p className="text-sm text-slate-500 mt-1">
          Export official CSV spreadsheets for university administration, academic audits, and accreditation compliance.
        </p>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <CardTitle className="text-base">Mentor Assignments CSV</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Complete student-faculty pairings, assignment dates, status, and department codes.
            </p>
          </CardHeader>
          <CardContent>
            <Button onClick={downloadAssignments} className="w-full gap-2 text-xs">
              <Download className="w-4 h-4" /> Download Assignments (.csv)
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <CardTitle className="text-base">Mentoring Sessions CSV</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Historical log of conducted meetings, agendas, action item counts, and student ratings.
            </p>
          </CardHeader>
          <CardContent>
            <Button onClick={downloadSessions} className="w-full gap-2 text-xs">
              <Download className="w-4 h-4" /> Download Sessions (.csv)
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <CardTitle className="text-base">Faculty Workloads CSV</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Faculty mentor list with allocated mentees, max quotas, and workload percentages.
            </p>
          </CardHeader>
          <CardContent>
            <Button onClick={downloadMentors} className="w-full gap-2 text-xs">
              <Download className="w-4 h-4" /> Download Workloads (.csv)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Aggregate Report Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accreditation Summary Metrics (Fall 2026)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                Total Enrolled Students
              </span>
              <span className="text-lg font-bold text-slate-900">{summary?.totalStudents}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                Active Mentor Pairings
              </span>
              <span className="text-lg font-bold text-emerald-600">
                {summary?.activeAssignments} ({summary?.coveragePercentage}%)
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                Mentoring Sessions Held
              </span>
              <span className="text-lg font-bold text-slate-900">{summary?.completedSessions}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                Average Mentee Rating
              </span>
              <span className="text-lg font-bold text-amber-600">
                {summary?.averageFeedbackRating} / 5.0
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
