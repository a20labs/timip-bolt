import { useState, useEffect } from 'react';
import { 
  Plus, 
  Save, 
  Eye, 
  Shield, 
  Copy
} from 'lucide-react';
import { Role, Permission } from '../../types/pam';
import { pamService } from '../../services/pamService';

interface RoleBuilderProps {
  className?: string;
  onRoleCreated?: (role: Role) => void;
  editingRole?: Role | null;
}

export function RoleBuilder({ className = '', onRoleCreated, editingRole }: RoleBuilderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 50,
    parentRoleId: '',
    isSystemRole: false,
    isTemporary: false,
    expiresAt: '',
    selectedPermissions: [] as string[]
  });
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [existingRoles, setExistingRoles] = useState<Role[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadRoleBuilderData();
  }, []);

  useEffect(() => {
    if (editingRole) {
      setFormData({
        name: editingRole.name,
        description: editingRole.description,
        level: editingRole.level,
        parentRoleId: editingRole.parent_role_id || '',
        isSystemRole: editingRole.is_system_role,
        isTemporary: editingRole.is_temporary,
        expiresAt: editingRole.expires_at || '',
        selectedPermissions: editingRole.permissions.map(p => p.id)
      });
      setIsOpen(true);
    }
  }, [editingRole]);

  const loadRoleBuilderData = async () => {
    try {
      // Load available permissions (from all roles for selection)
      const adminPerms = await pamService.getUserEffectivePermissions('admin-user', 'admin');
      const artistPerms = await pamService.getUserEffectivePermissions('artist-user', 'artist');
      const fanPerms = await pamService.getUserEffectivePermissions('fan-user', 'fan');
      
      const allPermissions = [...adminPerms, ...artistPerms, ...fanPerms];
      const uniquePermissions = allPermissions.filter((perm, index, self) => 
        index === self.findIndex(p => p.id === perm.id)
      );
      
      setAvailablePermissions(uniquePermissions);
      
      // Mock existing roles for hierarchy selection
      const mockRoles: Role[] = [
        {
          id: 'role_admin',
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
          id: 'role_artist',
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
          id: 'role_fan',
          name: 'Fan',
          description: 'Consumer access',
          level: 30,
          permissions: fanPerms,
          is_system_role: false,
          is_temporary: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setExistingRoles(mockRoles);
    } catch (error) {
      console.error('🔐 RoleBuilder: Failed to load data:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Role name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Role description is required';
    }

    if (formData.level < 0 || formData.level > 100) {
      newErrors.level = 'Role level must be between 0 and 100';
    }

    if (formData.isTemporary && !formData.expiresAt) {
      newErrors.expiresAt = 'Expiration date is required for temporary roles';
    }

    if (formData.selectedPermissions.length === 0) {
      newErrors.permissions = 'At least one permission must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const selectedPermissions = availablePermissions.filter(p => 
        formData.selectedPermissions.includes(p.id)
      );

      const newRole: Role = {
        id: editingRole?.id || `role_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        level: formData.level,
        permissions: selectedPermissions,
        parent_role_id: formData.parentRoleId || undefined,
        is_system_role: formData.isSystemRole,
        is_temporary: formData.isTemporary,
        expires_at: formData.expiresAt || undefined,
        created_at: editingRole?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // In a real implementation, this would save to the backend
      console.log('🔐 RoleBuilder: Saving role:', newRole);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onRoleCreated?.(newRole);
      resetForm();
      setIsOpen(false);
      
      console.log('🔐 RoleBuilder: Role saved successfully');
    } catch (error) {
      console.error('🔐 RoleBuilder: Failed to save role:', error);
      setErrors({ submit: 'Failed to save role. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      level: 50,
      parentRoleId: '',
      isSystemRole: false,
      isTemporary: false,
      expiresAt: '',
      selectedPermissions: []
    });
    setErrors({});
    setPreviewMode(false);
  };

  const duplicateRole = (role: Role) => {
    setFormData({
      name: `${role.name} (Copy)`,
      description: role.description,
      level: role.level,
      parentRoleId: role.parent_role_id || '',
      isSystemRole: false, // Never duplicate as system role
      isTemporary: role.is_temporary,
      expiresAt: role.expires_at || '',
      selectedPermissions: role.permissions.map(p => p.id)
    });
    setIsOpen(true);
  };

  const groupPermissionsByResource = (permissions: Permission[]) => {
    return permissions.reduce((groups, permission) => {
      const resource = permission.resource;
      if (!groups[resource]) {
        groups[resource] = [];
      }
      groups[resource].push(permission);
      return groups;
    }, {} as Record<string, Permission[]>);
  };

  const selectedPermissions = availablePermissions.filter(p => 
    formData.selectedPermissions.includes(p.id)
  );
  const groupedSelectedPermissions = groupPermissionsByResource(selectedPermissions);

  if (!isOpen) {
    return (
      <div className={className}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Role</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`${className} bg-white rounded-lg shadow-lg border p-6`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {editingRole ? 'Edit Role' : 'Create New Role'}
          </h3>
          <p className="text-sm text-gray-600">
            Define role permissions and access levels
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="text-gray-600 hover:text-gray-800 p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsOpen(false);
            }}
            className="text-gray-600 hover:text-gray-800 p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {previewMode ? (
        // Preview Mode
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Role Preview</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium">{formData.name || 'Untitled Role'}</span>
              </div>
              <div>
                <span className="text-gray-600">Level:</span>
                <span className="ml-2 font-medium">{formData.level}/100</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Description:</span>
                <p className="ml-2 text-gray-800">{formData.description || 'No description'}</p>
              </div>
            </div>
            
            {Object.keys(groupedSelectedPermissions).length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-gray-900 mb-2">Permissions by Resource</h5>
                <div className="space-y-2">
                  {Object.entries(groupedSelectedPermissions).map(([resource, perms]) => (
                    <div key={resource} className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-700">{resource}</span>
                      <span className="text-gray-500">({perms.length} permissions)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setPreviewMode(false)}
            className="w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Back to Edit
          </button>
        </div>
      ) : (
        // Edit Mode
        <div className="space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {errors.submit}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter role name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Level (0-100) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 0 })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.level ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.level && <p className="text-red-500 text-xs mt-1">{errors.level}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe the role's purpose and responsibilities"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Parent Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Role (Optional)
            </label>
            <select
              value={formData.parentRoleId}
              onChange={(e) => setFormData({ ...formData, parentRoleId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No parent role</option>
              {existingRoles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name} (Level {role.level})
                </option>
              ))}
            </select>
          </div>

          {/* Role Options */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isSystemRole}
                onChange={(e) => setFormData({ ...formData, isSystemRole: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">System Role</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isTemporary}
                onChange={(e) => setFormData({ ...formData, isTemporary: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Temporary Role</span>
            </label>
          </div>

          {formData.isTemporary && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date *
              </label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.expiresAt ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.expiresAt && <p className="text-red-500 text-xs mt-1">{errors.expiresAt}</p>}
            </div>
          )}

          {/* Permission Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions *
            </label>
            {errors.permissions && <p className="text-red-500 text-xs mb-2">{errors.permissions}</p>}
            
            <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto">
              {Object.entries(groupPermissionsByResource(availablePermissions)).map(([resource, permissions]) => (
                <div key={resource} className="border-b border-gray-200 last:border-b-0">
                  <div className="bg-gray-50 px-4 py-2 font-medium text-gray-700 text-sm">
                    {resource.toUpperCase()}
                  </div>
                  <div className="p-2 space-y-1">
                    {permissions.map(permission => (
                      <label key={permission.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={formData.selectedPermissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                selectedPermissions: [...formData.selectedPermissions, permission.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                selectedPermissions: formData.selectedPermissions.filter(id => id !== permission.id)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                          <div className="text-xs text-gray-600">{permission.description}</div>
                          <div className="text-xs text-gray-500">Action: {permission.action}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                resetForm();
                setIsOpen(false);
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{editingRole ? 'Update Role' : 'Create Role'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions for Existing Roles */}
      {!editingRole && existingRoles.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {existingRoles.slice(0, 3).map(role => (
              <button
                key={role.id}
                onClick={() => duplicateRole(role)}
                className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Copy className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Copy {role.name}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{role.permissions.length} permissions</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
