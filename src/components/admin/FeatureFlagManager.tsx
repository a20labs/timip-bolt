import { useState } from 'react';
import { Flag, ToggleLeft as Toggle, Users, Globe, Plus, Edit, Trash2, Phone, Bot, Save, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';
import { useAuthStore } from '../../stores/authStore';

interface FeatureFlag {
  id: string;
  workspace_id?: string;
  name: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number;
  target_roles?: string[];
  target_users?: string[];
  metadata: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Permission helper functions
const getUserPermissions = (userRole: string | undefined) => {
  const isSuperadmin = userRole === 'superadmin';
  const isAdmin = userRole === 'admin' || userRole === 'label_admin' || userRole === 'manager';
  
  return {
    canToggle: isSuperadmin, // Only superadmins can toggle flags
    canEdit: isSuperadmin || isAdmin, // Admins can edit descriptions and target roles
    canCreate: isSuperadmin, // Only superadmins can create new flags  
    canDelete: isSuperadmin, // Only superadmins can delete flags
    canEditKeyAndRollout: isSuperadmin, // Only superadmins can change feature key and rollout percentage
    canEditTargetRoles: isSuperadmin, // Only superadmins can change target roles
    viewOnly: !isSuperadmin && !isAdmin // Regular users have view-only access
  };
};

// Check if a feature flag is available to the current user
const isFeatureFlagAvailable = (flag: Partial<FeatureFlag>, userRole: string | undefined): boolean => {
  if (!flag.enabled) return false;
  if (!userRole) return false;
  
  // If no target roles specified, it's available to everyone
  if (!flag.target_roles || flag.target_roles.length === 0) return true;
  
  // Check if user's role is in target roles
  return flag.target_roles.includes(userRole);
};

export function FeatureFlagManager() {
  const { user } = useAuthStore();
  const permissions = getUserPermissions(user?.role);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled: true,
    rollout_percentage: 100,
    target_roles: ['artist', 'manager', 'label_admin'],
    metadata: {} as Record<string, unknown>,
    created_by: 'admin'
  });
  
  // Use the feature flags hook
  const { 
    useAllFeatureFlags, 
    toggleFeatureFlag, 
    deleteFeatureFlag, 
    createFeatureFlag,
    updateFeatureFlag 
  } = useFeatureFlags();

  const { data: flags, isLoading } = useAllFeatureFlags();

  const getScopeIcon = (flag: Partial<FeatureFlag>) => {
    return flag.workspace_id ? <Users className="w-4 h-4" /> : <Globe className="w-4 h-4" />;
  };

  const getScopeLabel = (flag: Partial<FeatureFlag>) => {
    return flag.workspace_id ? 'Workspace' : 'Global';
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled 
      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  };

  const getFeatureIcon = (name: string) => {
    if (name.includes('PHONE') || name.includes('CALL')) return Phone;
    if (name.includes('AI') || name.includes('AGENT')) return Bot;
    return Flag;
  };

  const handleDeleteFlag = (id: string) => {
    if (confirm('Are you sure you want to delete this feature flag? This action cannot be undone.')) {
      deleteFeatureFlag.mutate(id);
    }
  };

  const handleCreateOrUpdateFlag = () => {
    if (editingFlag) {
      updateFeatureFlag.mutate({
        ...editingFlag,
        ...formData
      }, {
        onSuccess: () => {
          setShowCreateModal(false);
          setEditingFlag(null);
        }
      });
    } else {
      createFeatureFlag.mutate(formData, {
        onSuccess: () => {
          setShowCreateModal(false);
          setEditingFlag(null);
        }
      });
    }
  };

  const handleEditFlag = (flag: Partial<FeatureFlag> & { id: string; name: string; enabled: boolean }) => {
    setEditingFlag(flag as FeatureFlag);
    setFormData({
      name: flag.name,
      description: flag.description || '',
      enabled: flag.enabled,
      rollout_percentage: flag.rollout_percentage || 100,
      target_roles: flag.target_roles || ['artist', 'manager', 'label_admin'],
      metadata: flag.metadata || {},
      created_by: flag.created_by || 'admin'
    });
    setShowCreateModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Add the phone feature flag if it doesn't exist
  const phoneFeatureFlag = flags?.find(flag => flag.name === 'PHONE_DIALER');
  const mockPhoneFlag = {
    id: 'phone-feature-flag',
    name: 'PHONE_DIALER',
    description: 'Enable phone calling features with AI agents',
    enabled: true, // Start enabled for testing
    rollout_percentage: 100,
    target_roles: ['artist', 'manager', 'label_admin'],
    metadata: {},
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const mockFlags = [
    ...(flags || []),
    ...(!phoneFeatureFlag ? [mockPhoneFlag] : [])
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Feature Flags
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage feature rollouts and A/B testing
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter toggle for non-superadmin users */}
          {!permissions.canToggle && (
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Show only available to me
            </label>
          )}
          {permissions.canCreate && (
            <Button onClick={() => {
              setEditingFlag(null);
              setFormData({
                name: '',
                description: '',
                enabled: true,
                rollout_percentage: 100,
                target_roles: ['artist', 'manager', 'label_admin'],
                metadata: {},
                created_by: 'admin'
              });
              setShowCreateModal(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Flag
            </Button>
          )}
        </div>
      </div>

      {/* Permission Summary */}
      {!permissions.canToggle && (
        <Card className="p-4 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Flag className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                {user?.role === 'admin' || user?.role === 'label_admin' || user?.role === 'manager' 
                  ? 'Admin Access' 
                  : 'View-Only Access'
                }
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {user?.role === 'admin' || user?.role === 'label_admin' || user?.role === 'manager' 
                  ? 'You can edit feature descriptions but cannot toggle flags or modify rollout settings. Only superadmins can perform those actions.'
                  : 'You can view feature flags but cannot make changes. Contact a superadmin for modifications.'
                }
              </p>
              {mockFlags.length > 0 && (
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                  <strong>{mockFlags.filter(flag => isFeatureFlagAvailable(flag, user?.role)).length}</strong> of <strong>{mockFlags.length}</strong> feature flags are available to your role.
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Feature Flags List */}
      <div className="grid gap-4">
        {mockFlags
          .filter(flag => showOnlyAvailable ? isFeatureFlagAvailable(flag, user?.role) : true)
          .map((flag) => {
          const FeatureIcon = getFeatureIcon(flag.name);
          const isAvailable = isFeatureFlagAvailable(flag, user?.role);
          
          return (
            <Card key={flag.id} className={`p-6 ${isAvailable ? 'ring-2 ring-green-200 dark:ring-green-800' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                    <FeatureIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {flag.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {getScopeIcon(flag)}
                        <span>{getScopeLabel(flag)}</span>
                      </div>
                      {isAvailable && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Available to you
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {flag.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Rollout: {flag.rollout_percentage}%</span>
                      {flag.target_roles && (
                        <span>Roles: {flag.target_roles.join(', ')}</span>
                      )}
                      <span>Created: {new Date(flag.created_at).toLocaleDateString()}</span>
                    </div>
                    {/* Mock flag notice removed for cleaner UI */}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flag.enabled)}`}>
                    {flag.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    {permissions.canToggle && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFeatureFlag.mutate({ 
                          id: flag.id, 
                          enabled: !flag.enabled 
                        })}
                        disabled={toggleFeatureFlag.isPending}
                        title="Toggle feature flag"
                      >
                        <Toggle className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {permissions.canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditFlag(flag)}
                        title="Edit feature flag"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {permissions.canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFlag(flag.id)}
                        disabled={deleteFeatureFlag.isPending}
                        title="Delete feature flag"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {mockFlags
        .filter(flag => showOnlyAvailable ? isFeatureFlagAvailable(flag, user?.role) : true)
        .length === 0 && (
        <Card className="p-8 text-center">
          <Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {showOnlyAvailable && mockFlags.length > 0 
              ? 'No Available Feature Flags' 
              : 'No Feature Flags'
            }
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {showOnlyAvailable && mockFlags.length > 0 
              ? "No feature flags are currently available for your role. Contact an admin to enable features for your account."
              : permissions.canCreate 
                ? "Create your first feature flag to start controlling feature rollouts."
                : "No feature flags are currently configured."
            }
          </p>
          {permissions.canCreate && !showOnlyAvailable && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Flag
            </Button>
          )}
        </Card>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}
            </h3>
            
            {/* Permission Notice */}
            {editingFlag && !permissions.canEditKeyAndRollout && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> {user?.role === 'admin' || user?.role === 'label_admin' || user?.role === 'manager' 
                    ? 'As an admin, you can edit the description but cannot modify the feature key, rollout percentage, or target roles.'
                    : 'You have view-only access to this feature flag.'
                  }
                </p>
              </div>
            )}
            <div className="space-y-4">
              <Input
                label="Feature Key"
                placeholder="FEATURE_NAME"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                disabled={!!editingFlag && !permissions.canEditKeyAndRollout}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                  rows={3}
                  placeholder="Describe what this feature flag controls"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <Input
                label="Rollout Percentage"
                type="number"
                min="0"
                max="100"
                value={formData.rollout_percentage}
                onChange={(e) => setFormData({...formData, rollout_percentage: parseInt(e.target.value)})}
                disabled={!!editingFlag && !permissions.canEditKeyAndRollout}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Roles
                  {!permissions.canEditTargetRoles && (
                    <span className="text-xs text-gray-500 ml-2">(Read-only)</span>
                  )}
                </label>
                <div className="space-y-2">
                  {['artist', 'manager', 'label_admin', 'fan', 'educator'].map(role => (
                    <label key={role} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.target_roles.includes(role)}
                        onChange={(e) => {
                          if (!permissions.canEditTargetRoles) return;
                          if (e.target.checked) {
                            setFormData({
                              ...formData, 
                              target_roles: [...formData.target_roles, role]
                            });
                          } else {
                            setFormData({
                              ...formData, 
                              target_roles: formData.target_roles.filter(r => r !== role)
                            });
                          }
                        }}
                        disabled={!permissions.canEditTargetRoles}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className={`text-sm ${!permissions.canEditTargetRoles ? 'text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        {role}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingFlag(null);
                  }}
                >
                  {permissions.viewOnly ? 'Close' : 'Cancel'}
                </Button>
                {!permissions.viewOnly && (
                  <Button 
                    onClick={handleCreateOrUpdateFlag} 
                    loading={editingFlag ? updateFeatureFlag.isPending : createFeatureFlag.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingFlag ? 'Update' : 'Create'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}