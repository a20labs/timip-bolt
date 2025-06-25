import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Filter, 
  Download, 
  Eye, 
  User,
  Calendar,
  Search
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuditLogs } from '../../hooks/useAuditLog';

export function AuditLogViewer() {
  const [filters, setFilters] = useState({
    resource_type: '',
    action: '',
    date_from: '',
    date_to: '',
    limit: 100
  });

  const { data: auditLogs, isLoading } = useAuditLogs(filters);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'UPDATE':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      case 'DELETE':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT':
        return '➕';
      case 'UPDATE':
        return '✏️';
      case 'DELETE':
        return '🗑️';
      default:
        return '📝';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const exportLogs = () => {
    if (!auditLogs) return;

    const csv = [
      ['Timestamp', 'User ID', 'Action', 'Resource Type', 'Resource ID'].join(','),
      ...auditLogs.map(log => [
        log.created_at,
        log.user_id,
        log.action,
        log.resource_type,
        log.resource_id || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Audit Logs
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track all system activities and changes
          </p>
        </div>
        <Button onClick={exportLogs} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Resource type..."
            value={filters.resource_type}
            onChange={(e) => setFilters(prev => ({ ...prev, resource_type: e.target.value }))}
          />
          <Input
            placeholder="Action..."
            value={filters.action}
            onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
          />
          <Input
            type="date"
            placeholder="From date"
            value={filters.date_from}
            onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
          />
          <Input
            type="date"
            placeholder="To date"
            value={filters.date_to}
            onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
          />
        </div>
      </Card>

      {/* Audit Logs */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : auditLogs && auditLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {auditLogs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatTimestamp(log.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {log.user_id.slice(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        <span>{getActionIcon(log.action)}</span>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {log.resource_type}
                      </div>
                      {log.resource_id && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {log.resource_id.slice(0, 8)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Audit Logs
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No audit logs found for the selected filters.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}