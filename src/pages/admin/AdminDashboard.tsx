import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Database, 
  Activity, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Flag,
  Settings,
  Bell,
  Target,
  Globe,
  Phone,
  Key,
  ToggleLeft as Toggle,
  Edit
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FeatureFlagManager } from '../../components/admin/FeatureFlagManager';
import { AuditLogViewer } from '../../components/admin/AuditLogViewer';
import { LexiconManager } from '../../components/admin/LexiconManager';
import { PAMDashboard } from '../../components/admin/PAMDashboard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';

const systemStats = [
  { name: 'Total Users', value: '12,847', change: '+8.2%', icon: Users, color: 'text-blue-600' },
  { name: 'Active Workspaces', value: '3,421', change: '+12.5%', icon: Database, color: 'text-green-600' },
  { name: 'System Health', value: '99.9%', change: '+0.1%', icon: Activity, color: 'text-emerald-600' },
  { name: 'Security Score', value: '98/100', change: '+2', icon: Shield, color: 'text-purple-600' },
];

const userGrowthData = [
  { name: 'Jan', users: 8420, workspaces: 2100 },
  { name: 'Feb', users: 9150, workspaces: 2340 },
  { name: 'Mar', users: 9890, workspaces: 2580 },
  { name: 'Apr', users: 10650, workspaces: 2820 },
  { name: 'May', users: 11420, workspaces: 3080 },
  { name: 'Jun', users: 12847, workspaces: 3421 },
];

const recentActivity = [
  { action: 'New user registration', user: 'artist@example.com', time: '2 minutes ago', type: 'success' },
  { action: 'Feature flag updated', user: 'admin@truindee.com', time: '15 minutes ago', type: 'info' },
  { action: 'System backup completed', user: 'system', time: '1 hour ago', type: 'success' },
  { action: 'High CPU usage detected', user: 'monitoring', time: '2 hours ago', type: 'warning' },
  { action: 'Database migration completed', user: 'admin@truindee.com', time: '3 hours ago', type: 'success' },
];

const systemAlerts = [
  { title: 'Storage Usage High', message: 'Storage is at 85% capacity', severity: 'warning', time: '1 hour ago' },
  { title: 'Backup Successful', message: 'Daily backup completed successfully', severity: 'success', time: '2 hours ago' },
  { title: 'Security Scan Complete', message: 'No vulnerabilities detected', severity: 'success', time: '6 hours ago' },
];

const adminTabs = [
  { id: 'dashboard', name: 'Dashboard', icon: Target },
  { id: 'users', name: 'User Management', icon: Users },
  { id: 'workspaces', name: 'Workspaces', icon: Database },
  { id: 'pam', name: 'PAM Security', icon: Key },
  { id: 'lexicon', name: 'Lexicon', icon: Globe },
  { id: 'features', name: 'Feature Flags', icon: Flag },
  { id: 'audit', name: 'Audit Logs', icon: Activity },
  { id: 'settings', name: 'Settings', icon: Settings },
  { id: 'notifications', name: 'Notifications', icon: Bell },
];

// Helper function to validate UUID format
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toggleFeatureFlag, useAllFeatureFlags } = useFeatureFlags();
  const { data: featureFlags } = useAllFeatureFlags();

  // Check if phone feature is enabled
  const phoneFeatureFlag = featureFlags?.find(flag => flag.name === 'PHONE_DIALER');
  const isPhoneFeatureEnabled = phoneFeatureFlag?.enabled || false;

  // Toggle phone feature
  const handleTogglePhoneFeature = () => {
    if (!phoneFeatureFlag) {
      console.error('Phone feature flag not found');
      return;
    }

    toggleFeatureFlag.mutate({
      id: phoneFeatureFlag.id,
      enabled: !phoneFeatureFlag.enabled
    });
  };

  useEffect(() => {
    // If we're on the features tab, make sure the feature flags are loaded
    if (activeTab === 'features') {
      // This would refresh the feature flags
    }
  }, [activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'lexicon':
        return <LexiconManager />;
      case 'features':
        return <FeatureFlagManager />;
      case 'audit':
        return <AuditLogViewer />;
      case 'pam':
        return <PAMDashboard />;
      case 'dashboard':
      default:
        return (
          <div className="space-y-6">
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {systemStats.map((stat, index) => (
                <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6" hover>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {stat.name}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {stat.change}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Feature Flags Quick Access */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Feature Flags
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                      <Phone className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        PHONE_DIALER
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enable phone calling features with AI agents
                      </p>
                      {phoneFeatureFlag && !isValidUUID(phoneFeatureFlag.id) && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          ⚠️ Invalid ID format - requires database fix
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isPhoneFeatureEnabled
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                    }`}>
                      {isPhoneFeatureEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleTogglePhoneFeature}
                      disabled={toggleFeatureFlag.isPending}
                    >
                      <Toggle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('features')}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('features')}
                  className="w-full"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Manage All Feature Flags
                </Button>
              </div>
            </Card>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Platform Growth
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="workspaces"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'success' ? 'bg-green-500' :
                        activity.type === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.user} • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* System Alerts */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                System Alerts
              </h2>
              <div className="space-y-4">
                {systemAlerts.map((alert, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    alert.severity === 'warning' 
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  }`}>
                    <div className="flex items-start gap-3">
                      {alert.severity === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          alert.severity === 'warning' 
                            ? 'text-yellow-800 dark:text-yellow-200'
                            : 'text-green-800 dark:text-green-200'
                        }`}>
                          {alert.title}
                        </h3>
                        <p className={`text-sm ${
                          alert.severity === 'warning' 
                            ? 'text-yellow-700 dark:text-yellow-300'
                            : 'text-green-700 dark:text-green-300'
                        }`}>
                          {alert.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {alert.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button 
                  className="justify-start h-auto p-4 flex-col gap-2"
                  onClick={() => setActiveTab('users')}
                >
                  <Users className="w-6 h-6" />
                  <span>Manage Users</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4 flex-col gap-2"
                  onClick={() => setActiveTab('lexicon')}
                >
                  <Globe className="w-6 h-6" />
                  <span>Manage Lexicon</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4 flex-col gap-2"
                  onClick={() => setActiveTab('settings')}
                >
                  <Database className="w-6 h-6" />
                  <span>System Settings</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4 flex-col gap-2"
                  onClick={() => setActiveTab('audit')}
                >
                  <TrendingUp className="w-6 h-6" />
                  <span>View Analytics</span>
                </Button>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            System overview and platform management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            System Status
          </Button>
          <Button>
            <Shield className="w-4 h-4 mr-2" />
            Security Center
          </Button>
        </div>
      </motion.div>

      {/* Admin Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">
        {adminTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  );
}