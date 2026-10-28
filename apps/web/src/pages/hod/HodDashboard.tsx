import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserPlus,
  Compass,
  Calendar,
  Star,
  FileSpreadsheet,
  AlertCircle,
  TrendingUp,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';

export function HodDashboard() {
  const { data: reportData, isLoading, error } = useQuery<any>({
    queryKey: ['hodOverviewReport'],
    queryFn: () => api.get('/reports/overview'),
  });

  const { data: changeRequests } = useQuery<any[]>({
    queryKey: ['pendingChangeRequests'],
    queryFn: () => api.get('/change-requests?status=PENDING'),
  });

  if (isLoading) return <LoadingSpinner message="Loading institutional overview..." />;
  if (error || !reportData) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
        Failed to load administrative analytics.
      </div>
    );
  }

  const { summary, workloadChart, departmentDistribution } = reportData;

  const handleExportAssignments = () => {
    api.downloadCsv('/reports/export-assignments-csv', 'mentor_assignments.csv');
  };

  const handleExportSessions = () => {
    api.downloadCsv('/reports/export-sessions-csv', 'mentoring_sessions.csv');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-900/80 text-indigo-200 text-xs font-medium mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>Head of Department Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Institutional Mentoring Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Department Governance • Faculty Workloads • Student Assignment Monitoring
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-1.5"
              onClick={handleExportAssignments}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export Assignments CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-1.5"
              onClick={handleExportSessions}
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-400" /> Export Sessions CSV
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Students
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{summary.totalStudents}</p>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Faculty Mentors
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{summary.totalMentors}</p>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Assigned Coverage
          </span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{summary.coveragePercentage}%</p>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Unassigned Mentees
          </span>
          <p
            className={`text-2xl font-bold mt-1 ${
              summary.unassignedStudents > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}
          >
            {summary.unassignedStudents}
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Sessions Held
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{summary.completedSessions}</p>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Avg Satisfaction
          </span>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-2xl font-bold text-slate-900">
              {summary.averageFeedbackRating}
            </span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
        </Card>
      </div>

      {/* Visualizations Grid (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mentor Workload Utilization Chart */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-base">Faculty Mentor Workload Utilization</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Active assigned students vs configured capacity per mentor
              </p>
            </div>
            <Link to="/hod/assignments" className="text-xs font-semibold text-indigo-600 hover:underline">
              Manage Workloads
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any, name: string) => [
                    val,
                    name === 'activeMentees' ? 'Active Mentees' : 'Max Capacity',
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="activeMentees" name="Active Mentees" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" name="Max Capacity" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Department Distribution Chart */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-base">Department Distribution</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Total students and faculty mentors registered by department
              </p>
            </div>
            <Link to="/hod/departments" className="text-xs font-semibold text-indigo-600 hover:underline">
              View Departments
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="students" name="Students" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mentors" name="Mentors" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Pending Change Requests Queue */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Pending Mentor Change Requests</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Student submissions awaiting administrative decision
              </p>
            </div>
            <Link to="/hod/change-requests" className="text-xs font-semibold text-indigo-600 hover:underline">
              Open Full Review Queue ({changeRequests?.length || 0})
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {changeRequests && changeRequests.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {changeRequests.slice(0, 3).map((req: any) => (
                <div key={req.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">
                      {req.student.fullName} ({req.student.usn})
                    </span>
                    <p className="text-slate-600 mt-0.5">Reason: "{req.reason}"</p>
                  </div>
                  <Link to="/hod/change-requests">
                    <Button size="sm" variant="outline" className="text-xs shrink-0">
                      Review Request
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
              All mentor change requests are resolved.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
