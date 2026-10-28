import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '@mentorconnect/shared';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserPlus,
  Compass,
  Calendar,
  Bell,
  Megaphone,
  FileText,
  ShieldAlert,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Fetch notifications
  const { data: notifData } = useQuery<{ notifications: any[]; unreadCount: number }>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications'),
    refetchInterval: 15000,
    enabled: !!user,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Build navigation items based on role
  let navItems: { label: string; path: string; icon: any }[] = [];

  if (user?.role === UserRole.STUDENT) {
    navItems = [
      { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { label: 'My Mentor', path: '/student/mentor', icon: UserCheck },
      { label: 'Recommended Mentors', path: '/student/recommendations', icon: Compass },
      { label: 'Mentoring Sessions', path: '/student/sessions', icon: Calendar },
      { label: 'Announcements', path: '/student/announcements', icon: Megaphone },
      { label: 'My Profile', path: '/student/profile', icon: GraduationCap },
      { label: 'Account Settings', path: '/student/settings', icon: Settings },
    ];
  } else if (user?.role === UserRole.MENTOR) {
    navItems = [
      { label: 'Dashboard', path: '/mentor/dashboard', icon: LayoutDashboard },
      { label: 'My Mentees', path: '/mentor/mentees', icon: Users },
      { label: 'Mentoring Sessions', path: '/mentor/sessions', icon: Calendar },
      { label: 'Faculty Profile', path: '/mentor/profile', icon: GraduationCap },
      { label: 'Announcements', path: '/mentor/announcements', icon: Megaphone },
      { label: 'Account Settings', path: '/mentor/settings', icon: Settings },
    ];
  } else if (user?.role === UserRole.HOD) {
    navItems = [
      { label: 'Dashboard', path: '/hod/dashboard', icon: LayoutDashboard },
      { label: 'Student Accounts', path: '/hod/students', icon: Users },
      { label: 'Faculty Mentors', path: '/hod/mentors', icon: UserPlus },
      { label: 'Mentor Assignments', path: '/hod/assignments', icon: UserCheck },
      { label: 'Change Requests', path: '/hod/change-requests', icon: Compass },
      { label: 'Match Recommendations', path: '/hod/recommendations', icon: Compass },
      { label: 'Sessions Overview', path: '/hod/sessions', icon: Calendar },
      { label: 'Department Setup', path: '/hod/departments', icon: Building2 },
      { label: 'Announcements', path: '/hod/announcements', icon: Megaphone },
      { label: 'Reports & Exports', path: '/hod/reports', icon: FileText },
      { label: 'Audit Logs', path: '/hod/audit-logs', icon: ShieldAlert },
      { label: 'System Settings', path: '/hod/settings', icon: Settings },
    ];
  }

  const roleBadgeMap: Record<UserRole, { label: string; variant: 'primary' | 'success' | 'warning' }> = {
    [UserRole.STUDENT]: { label: 'Student Mentee', variant: 'primary' },
    [UserRole.MENTOR]: { label: 'Faculty Mentor', variant: 'success' },
    [UserRole.HOD]: { label: 'Head of Department', variant: 'warning' },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              M
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">Mentor</span>
              <span className="font-semibold text-indigo-600 text-lg tracking-tight">Connect</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Banner */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
            {user?.fullName.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullName}</p>
            {user && (
              <Badge variant={roleBadgeMap[user.role].variant} className="text-[10px] mt-0.5">
                {roleBadgeMap[user.role].label}
              </Badge>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-indigo-600' : 'text-slate-400')} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Controls */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {user?.role} Portal
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {user?.department?.name || 'Academic Mentoring Program'}
              </p>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {(notifData?.unreadCount ?? 0) > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {notifData?.unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">Notifications</span>
                    {(notifData?.unreadCount ?? 0) > 0 && (
                      <button
                        onClick={() => markAllReadMutation.mutate()}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifData?.notifications && notifData.notifications.length > 0 ? (
                      notifData.notifications.map((n: any) => (
                        <div
                          key={n.id}
                          className={cn(
                            'p-3 text-xs space-y-1 transition-colors',
                            !n.isRead ? 'bg-indigo-50/40' : 'bg-white'
                          )}
                        >
                          <p className="font-semibold text-slate-800">{n.title}</p>
                          <p className="text-slate-600 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No new notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-xs">
                  {user?.fullName.charAt(0)}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 truncate">{user?.fullName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      const settingsPath = user?.role === UserRole.STUDENT
                        ? '/student/settings'
                        : user?.role === UserRole.MENTOR
                        ? '/mentor/settings'
                        : '/hod/settings';
                      navigate(settingsPath);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Account Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
