import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDateTime } from '../../lib/utils';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export function HodAuditLogsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<any>({
    queryKey: ['auditLogs', page],
    queryFn: () => api.get(`/audit-logs?page=${page}&limit=15`),
  });

  if (isLoading) return <LoadingSpinner message="Loading security audit trail..." />;

  const logs = data?.logs || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600" /> Security & Administrative Audit Logs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable system audit logs tracking account activations, mentor assignments, reassignments, and administrative actions.
          </p>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          {logs && logs.length > 0 ? (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor & Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Context / Metadata</th>
                  <th className="py-3 px-4">Origin IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="font-semibold text-slate-900 block">
                        {log.actor?.email || 'SYSTEM'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Role: {log.actorRole || 'SYSTEM'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="primary" className="font-mono text-[10px]">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-700">{log.entityType}</td>
                    <td className="py-3 px-4 max-w-xs text-slate-600 font-mono text-[10px] truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              icon={ShieldCheck}
              title="No Audit Records"
              description="No audit events have been logged yet."
            />
          )}
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} entries)
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export function HodSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Institutional System Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure college parameters, default mentoring quotas, and system terms.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">College System Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-800">Institution:</span>
              <span className="text-slate-900">Nitte Mahalinga Adyanthaya Memorial Institute of Technology</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-800">Active Term:</span>
              <span className="text-slate-900">Fall 2026 - Academic Cycle</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-800">Default Mentee Capacity:</span>
              <span className="text-slate-900">10 students per faculty member</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-800">Student Change Requests:</span>
              <span className="text-emerald-700 font-semibold">Enabled</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
