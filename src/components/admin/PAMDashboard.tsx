import { useState, useEffect } from 'react';
import { Shield, Users, Key, Activity, Settings, AlertTriangle, Search, Filter } from 'lucide-react';
import { pamService } from '../../services/pamService';
import { AuditLog, Permission, AccessSession, PAMConfiguration } from '../../types/pam';
import { useAuthStore } from '../../stores/authStore';
import { RoleBuilder } from './RoleBuilder';
import { RiskDashboard } from './RiskDashboard';
import { JITAccess } from './JITAccess';
import { PermissionMatrix } from './PermissionMatrix';

interface PAMDashboardProps {
  className?: string;
}

export function PAMDashboard({ className = '' }: PAMDashboardProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sessions, setSessions] = useState<AccessSession[]>([]);
  const [config, setConfig] = useState<PAMConfiguration | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<string>('');

  useEffect(() => {
    const initializePAM = async () => {
      try {
        setLoading(true);
        await pamService.initialize('default-org');
        
        // Load initial data
        const logs = await pamService.getAuditLogs({ limit: 50 });
        const currentSessions = pamService.getCurrentSessions();
        const configuration = pamService.getConfiguration();
        const userPermissions = await pamService.getUserEffectivePermissions(user?.id || '', 'admin');
        
        setAuditLogs(logs);
        setSessions(currentSessions);
        setConfig(configuration);
        setPermissions(userPermissions);
        
        console.log('🔐 PAM Dashboard: Initialized with', logs.length, 'audit logs');
      } catch (error) {
        console.error('🔐 PAM Dashboard: Failed to initialize:', error);
      } finally {
        setLoading(false);
      }
    };

    initializePAM();
  }, [user?.id]);

  const testPermissionCheck = async () => {
    if (!user) return;
    
    try {
      const result = await pamService.checkPermission(
        user.id,
        { resource: 'users', action: 'read' },
        'admin'
      );
      
      console.log('🔐 Permission check result:', result);
      
      // Refresh logs to show the new entry
      const updatedLogs = await pamService.getAuditLogs({ limit: 50 });
      setAuditLogs(updatedLogs);
    } catch (error) {
      console.error('🔐 Permission check failed:', error);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterResult || log.result === filterResult;
    return matchesSearch && matchesFilter;
  });

  const getResultBadgeColor = (result: string) => {
    switch (result) {
      case 'SUCCESS': return 'bg-green-100 text-green-800';
      case 'FAILURE': return 'bg-red-100 text-red-800';
      case 'BLOCKED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'roles', label: 'Role Builder', icon: Key },
    { id: 'permissions', label: 'Permissions', icon: Key },
    { id: 'jit-access', label: 'JIT Access', icon: Users },
    { id: 'risk', label: 'Risk Assessment', icon: AlertTriangle },
    { id: 'sessions', label: 'Sessions', icon: Users },
    { id: 'audit', label: 'Audit Logs', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className={`${className} p-6`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} p-6 space-y-6`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PAM Dashboard</h1>
          <p className="text-gray-600">Privileged Access Management & Security Controls</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={testPermissionCheck}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Test Permission Check
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Key className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Permissions</p>
              <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Activity className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Audit Events</p>
              <p className="text-2xl font-bold text-gray-900">{auditLogs.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed Attempts</p>
              <p className="text-2xl font-bold text-gray-900">
                {auditLogs.filter(log => log.result === 'FAILURE' || log.result === 'BLOCKED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Security Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-2">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center justify-between text-sm">
                        <span>{log.action} on {log.resource}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getResultBadgeColor(log.result)}`}>
                          {log.result}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Risk Assessment</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Risk Score</span>
                      <span className="font-medium text-green-600">Low (20/100)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Failed Login Attempts</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Suspicious Activity</span>
                      <span className="font-medium">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <PermissionMatrix className="w-full" />
        )}

        {activeTab === 'sessions' && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Session {session.id.slice(-8)}</h4>
                    <p className="text-sm text-gray-600">
                      User: {session.user_id} | Started: {new Date(session.start_time).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      session.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {session.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-sm font-mono">Risk: {session.risk_score}</span>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="text-gray-500 text-center py-8">No active sessions</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Audit Logs</h3>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={filterResult}
                    onChange={(e) => setFilterResult(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Results</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILURE">Failure</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.user_id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.resource}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getResultBadgeColor(log.result)}`}>
                          {log.result}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.risk_score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLogs.length === 0 && (
                <p className="text-gray-500 text-center py-8">No audit logs found</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <RoleBuilder className="w-full" />
        )}

        {activeTab === 'jit-access' && (
          <JITAccess className="w-full" />
        )}

        {activeTab === 'risk' && (
          <RiskDashboard className="w-full" />
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4">PAM Configuration</h3>
            {config && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Security Settings</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Session Timeout:</span>
                      <span className="ml-2 font-medium">{config.settings.session_timeout} minutes</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Max Concurrent Sessions:</span>
                      <span className="ml-2 font-medium">{config.settings.max_concurrent_sessions}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Risk Threshold:</span>
                      <span className="ml-2 font-medium">{config.settings.risk_threshold_for_blocking}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Audit Retention:</span>
                      <span className="ml-2 font-medium">{config.settings.audit_retention_days} days</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Password Policy</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Minimum Length:</span>
                      <span className="ml-2 font-medium">{config.settings.password_policy.min_length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Max Age:</span>
                      <span className="ml-2 font-medium">{config.settings.password_policy.max_age_days} days</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Require Uppercase:</span>
                      <span className="ml-2 font-medium">{config.settings.password_policy.require_uppercase ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Require Numbers:</span>
                      <span className="ml-2 font-medium">{config.settings.password_policy.require_numbers ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
