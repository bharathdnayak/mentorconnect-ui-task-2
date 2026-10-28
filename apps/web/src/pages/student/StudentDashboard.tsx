import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  AlertCircle,
  Mail,
  Phone,
  GraduationCap,
} from 'lucide-react';
import { formatDate, formatDateTime } from '../../lib/utils';

export function StudentDashboard() {
  const { data, isLoading, error } = useQuery<any>({
    queryKey: ['studentDashboard'],
    queryFn: () => api.get('/students/dashboard'),
  });

  if (isLoading) return <LoadingSpinner message="Loading student dashboard..." />;
  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
        Failed to load dashboard data. Please refresh.
      </div>
    );
  }

  const { profile, assignedMentor, upcomingSession, pendingActionItems, completedSessionsCount } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-800/80 text-indigo-200 text-xs font-medium mb-3">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>USN: {profile.usn} • Semester {profile.semester}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome, {profile.fullName}
            </h1>
            <p className="mt-1 text-sm text-indigo-200">
              Department of {profile.departmentName} • Academic Mentoring Dashboard
            </p>
          </div>

          <Link to="/student/recommendations">
            <Button variant="secondary" className="gap-2 shrink-0">
              <Compass className="w-4 h-4 text-indigo-600" />
              Find Recommended Mentors
            </Button>
          </Link>
        </div>

        {/* Profile Completion Bar */}
        <div className="mt-6 pt-6 border-t border-indigo-700/60">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-indigo-200 font-medium">Mentoring Profile Readiness</span>
            <span className="font-bold text-white">{profile.completionPercentage}%</span>
          </div>
          <div className="w-full bg-indigo-950/60 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${profile.completionPercentage}%` }}
            />
          </div>
          {profile.completionPercentage < 100 && (
            <p className="text-xs text-indigo-300 mt-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              Add your technical skills and career goals in{' '}
              <Link to="/student/profile" className="underline font-semibold text-white">
                Edit Profile
              </Link>{' '}
              to improve matching accuracy.
            </p>
          )}
        </div>
      </div>

      {/* Grid of Key Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Assigned Mentor Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Assigned Mentor
              </span>
              <Badge variant={assignedMentor ? 'success' : 'warning'}>
                {assignedMentor ? 'Active Mentor' : 'Unassigned'}
              </Badge>
            </div>
            <CardTitle className="mt-2">
              {assignedMentor ? assignedMentor.fullName : 'No Mentor Assigned'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignedMentor ? (
              <>
                <p className="text-xs text-slate-600 font-medium">{assignedMentor.designation}</p>
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{assignedMentor.user?.email}</span>
                  </div>
                  {assignedMentor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{assignedMentor.phone}</span>
                    </div>
                  )}
                </div>
                <div className="pt-3">
                  <Link to="/student/mentor">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <UserCheck className="w-4 h-4 text-indigo-600" /> View Mentor Details
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-500 py-3">
                <p>You have not been assigned a faculty mentor yet.</p>
                <Link to="/student/recommendations" className="block mt-3">
                  <Button size="sm" className="w-full">
                    Explore Mentor Matches
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Session Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Next Mentoring Session
              </span>
              <Badge variant={upcomingSession ? 'primary' : 'secondary'}>
                {upcomingSession ? 'Upcoming' : 'None Scheduled'}
              </Badge>
            </div>
            <CardTitle className="mt-2 text-base">
              {upcomingSession ? upcomingSession.title : 'No Upcoming Sessions'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingSession ? (
              <>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-medium">{formatDateTime(upcomingSession.scheduledAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{upcomingSession.durationMinutes} Minutes ({upcomingSession.meetingType})</span>
                  </div>
                </div>
                {upcomingSession.location && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                    📍 {upcomingSession.location}
                  </p>
                )}
                <div className="pt-3">
                  <Link to="/student/sessions">
                    <Button variant="outline" size="sm" className="w-full">
                      View Session Details
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-500 py-3">
                <p>No upcoming meetings. Completed meetings: {completedSessionsCount}.</p>
                <Link to="/student/sessions" className="block mt-3">
                  <Button variant="outline" size="sm" className="w-full">
                    View Meeting History
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Action Items Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Action Items
              </span>
              <Badge variant={pendingActionItems.length > 0 ? 'warning' : 'secondary'}>
                {pendingActionItems.length} Pending
              </Badge>
            </div>
            <CardTitle className="mt-2 text-base">Mentoring Action Items</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingActionItems.length > 0 ? (
              <div className="space-y-2.5">
                {pendingActionItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1"
                  >
                    <p className="font-medium text-slate-800 line-clamp-2">{item.description}</p>
                    {item.dueDate && (
                      <span className="text-[10px] text-amber-600 font-semibold block">
                        Due: {formatDate(item.dueDate)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                All action items are up to date!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
