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
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  PlusCircle,
  GraduationCap,
} from 'lucide-react';
import { formatDateTime, formatDate } from '../../lib/utils';

export function MentorDashboard() {
  const { data, isLoading, error } = useQuery<any>({
    queryKey: ['mentorDashboard'],
    queryFn: () => api.get('/mentors/dashboard'),
  });

  if (isLoading) return <LoadingSpinner message="Loading mentor dashboard..." />;
  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
        Failed to load mentor dashboard.
      </div>
    );
  }

  const { mentor, upcomingSessions, completedSessions, pendingActionItems } = data;
  const capacityPercent = Math.round((mentor.currentMenteeCount / mentor.maxCapacity) * 100);

  return (
    <div className="space-y-6">
      {/* Mentor Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-900/80 text-indigo-200 text-xs font-medium mb-3">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{mentor.designation} • {mentor.departmentName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome, {mentor.fullName}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Faculty Mentoring Portal • Active Workload & Student Progress Overview
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/mentor/sessions">
              <Button className="gap-2 shrink-0">
                <Calendar className="w-4 h-4" /> Schedule Mentoring Session
              </Button>
            </Link>
          </div>
        </div>

        {/* Mentee Capacity Progress Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-medium">Mentee Capacity Utilization</span>
            <span className="font-bold text-white">
              {mentor.currentMenteeCount} / {mentor.maxCapacity} Mentees ({capacityPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                capacityPercent >= 100
                  ? 'bg-red-500'
                  : capacityPercent >= 75
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, capacityPercent)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
            <span>{mentor.availableSlots} open mentoring slots remaining</span>
            {mentor.availableSlots === 0 && (
              <span className="text-red-400 font-semibold">Maximum capacity reached</span>
            )}
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Assigned Mentees
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{mentor.currentMenteeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Upcoming Sessions
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{upcomingSessions.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Completed Reviews
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{completedSessions}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Follow-Ups
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{pendingActionItems.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Upcoming Sessions and Action Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Mentoring Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upcoming Mentoring Sessions</CardTitle>
              <Link to="/mentor/sessions" className="text-xs font-semibold text-indigo-600 hover:underline">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingSessions && upcomingSessions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {upcomingSessions.map((session: any) => (
                  <div key={session.id} className="py-3 space-y-1.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">
                        {session.title}
                      </span>
                      <Badge variant="primary">Upcoming</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Mentee: {session.student.fullName} ({session.student.usn})</span>
                      <span>•</span>
                      <span>{formatDateTime(session.scheduledAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                No upcoming sessions scheduled.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Action Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Mentee Follow-Up Actions</CardTitle>
              <Link to="/mentor/mentees" className="text-xs font-semibold text-indigo-600 hover:underline">
                My Mentees
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingActionItems && pendingActionItems.length > 0 ? (
              <div className="space-y-2.5">
                {pendingActionItems.map((ai: any) => (
                  <div
                    key={ai.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{ai.student.fullName}</span>
                      {ai.dueDate && (
                        <span className="text-[10px] text-amber-700 font-semibold">
                          Due: {formatDate(ai.dueDate)}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600">{ai.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                No pending action items across mentees.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
