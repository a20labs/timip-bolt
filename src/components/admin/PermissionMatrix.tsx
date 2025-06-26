import { useState, useEffect } from 'react';
import { Check, X, Shield, Users, Settings, Search, Save, RefreshCw } from 'lucide-react';
import { Role } from '../../types/pam';
import { pamService } from '../../services/pamService';

interface PermissionMatrixProps {
  className?: string;
}

interface MatrixData {
  roles: Role[];
  resources: string[];
  actions: string[];
  permissions: Record<string, Record<string, Record<string, boolean>>>;
}

export function PermissionMatrix({ className = '' }: PermissionMatrixProps) {
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPermissionMatrix();
  }, []);

  const loadPermissionMatrix = async () => {
    try {
      setLoading(true);
      
      // Load permissions from PAM service
      const adminPerms = await pamService.getUserEffectivePermissions('admin-user', 'admin');
      const artistPerms = await pamService.getUserEffectivePermissions('artist-user', 'artist');
      const fanPerms = await pamService.getUserEffectivePermissions('fan-user', 'fan');
      
      // Create mock roles
      const roles: Role[] = [
        {
          id: 'admin',
          name: 'Administrator',
          description: 'Full system access',
          level: 90,
          permissions: adminPerms,
          is_system_role: true,
          is_temporary: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'artist',
          name: 'Artist',
          description: 'Content creator access',
          level: 60,
          permissions: artistPerms,
          is_system_role: false,
          is_temporary: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'fan',
          name: 'Fan',
          description: 'Consumer access',
          level: 30,
          permissions: fanPerms,
          is_system_role: false,
          is_temporary: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'moderator',
          name: 'Moderator',
          description: 'Content moderation',
          level: 70,
          permissions: [
            ...fanPerms,
            {
              id: 'perm_mod_content',
              name: 'Content Moderation',
              description: 'Moderate user content',
              resource: 'community',
              action: 'moderate',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ],
          is_system_role: false,
          is_temporary: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      // Extract unique resources and actions
      const allPermissions = [...adminPerms, ...artistPerms, ...fanPerms];
      const resources = [...new Set(allPermissions.map(p => p.resource))];
      const actions = [...new Set(allPermissions.map(p => p.action))];

      // Build permission matrix
      const permissions: Record<string, Record<string, Record<string, boolean>>> = {};
      
      roles.forEach(role => {
        permissions[role.id] = {};
        resources.forEach(resource => {
          permissions[role.id][resource] = {};
          actions.forEach(action => {
            const hasPermission = role.permissions.some(p => 
              (p.resource === resource && (p.action === action || p.action === '*'))
            );
            permissions[role.id][resource][action] = hasPermission;
          });
        });
      });

      setMatrixData({
        roles,
        resources,
        actions,
        permissions
      });

    } catch (error) {
      console.error('🔐 PermissionMatrix: Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (roleId: string, resource: string, action: string) => {
    if (!matrixData) return;

    const newPermissions = { ...matrixData.permissions };
    newPermissions[roleId][resource][action] = !newPermissions[roleId][resource][action];

    setMatrixData({
      ...matrixData,
      permissions: newPermissions
    });
    setHasChanges(true);
  };

  const saveChanges = async () => {
    if (!matrixData || !hasChanges) return;

    setSaving(true);
    try {
      // In a real implementation, this would save to the backend
      console.log('🔐 PermissionMatrix: Saving permission changes:', matrixData.permissions);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      console.log('🔐 PermissionMatrix: Changes saved successfully');
    } catch (error) {
      console.error('🔐 PermissionMatrix: Failed to save changes:', error);
    } finally {
      setSaving(false);
    }
  };

  const getPermissionColor = (hasPermission: boolean) => {
    return hasPermission 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const filteredRoles = matrixData?.roles.filter(role => 
    !selectedRole || role.id === selectedRole
  ) || [];

  const filteredResources = matrixData?.resources.filter(resource => 
    (!selectedResource || resource === selectedResource) &&
    (!searchTerm || resource.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  if (loading) {
    return (
      <div className={`${className} p-6`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!matrixData) {
    return (
      <div className={`${className} p-6`}>
        <div className="text-center text-gray-500">
          <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Failed to load permission matrix</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} space-y-6`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Permission Matrix</h2>
          <p className="text-gray-600">Visual permission management across roles and resources</p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <button
              onClick={saveChanges}
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={loadPermissionMatrix}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            {matrixData.roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          <select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Resources</option>
            {matrixData.resources.map(resource => (
              <option key={resource} value={resource}>
                {resource.charAt(0).toUpperCase() + resource.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  Role / Resource
                </th>
                {filteredResources.map(resource => (
                  <th key={resource} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex flex-col items-center space-y-1">
                      <span>{resource}</span>
                      <div className="flex space-x-1">
                        {matrixData.actions.map(action => (
                          <span key={action} className="text-xs bg-gray-200 px-1 rounded">
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoles.map(role => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{role.name}</div>
                        <div className="text-sm text-gray-500">Level {role.level}</div>
                      </div>
                    </div>
                  </td>
                  {filteredResources.map(resource => (
                    <td key={resource} className="px-3 py-4 text-center">
                      <div className="flex justify-center space-x-1">
                        {matrixData.actions.map(action => {
                          const hasPermission = matrixData.permissions[role.id]?.[resource]?.[action] || false;
                          return (
                            <button
                              key={action}
                              onClick={() => togglePermission(role.id, resource, action)}
                              className={`p-1 rounded border text-xs font-medium transition-colors ${getPermissionColor(hasPermission)}`}
                              title={`${role.name} - ${action} on ${resource}`}
                            >
                              {hasPermission ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Permission Status</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-green-100 text-green-800 border border-green-200 rounded">
                  <Check className="h-3 w-3" />
                </div>
                <span className="text-sm text-gray-600">Permission granted</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-red-100 text-red-800 border border-red-200 rounded">
                  <X className="h-3 w-3" />
                </div>
                <span className="text-sm text-gray-600">Permission denied</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Actions</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>read:</strong> View/access resource</p>
              <p><strong>write:</strong> Modify/create resource</p>
              <p><strong>delete:</strong> Remove resource</p>
              <p><strong>*:</strong> All actions (full access)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900">{matrixData.roles.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Resources</p>
              <p className="text-2xl font-bold text-gray-900">{matrixData.resources.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Permissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(matrixData.permissions).reduce((total, rolePerms) => 
                  total + Object.values(rolePerms).reduce((roleTotal, resourcePerms) => 
                    roleTotal + Object.values(resourcePerms).filter(Boolean).length, 0
                  ), 0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
