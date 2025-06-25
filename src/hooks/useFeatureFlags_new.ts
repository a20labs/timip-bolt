import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useWorkspaceStore } from '../stores/workspaceStore';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number;
  target_roles?: string[];
  target_users?: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export function useFeatureFlags() {
  const { user } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();
  const queryClient = useQueryClient();

  // Create initial mock data for phone dialer feature
  const getInitialMockFlags = (): FeatureFlag[] => [
    {
      id: 'phone-feature-flag',
      name: 'PHONE_DIALER',
      description: 'Enable phone calling features with AI agents',
      enabled: true, // Start enabled for testing
      rollout_percentage: 100,
      target_roles: ['artist', 'manager', 'label_admin'],
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Get all feature flags (admin only)
  const useAllFeatureFlags = () => {
    return useQuery({
      queryKey: ['feature-flags-admin'],
      queryFn: async (): Promise<FeatureFlag[]> => {
        console.log('Loading feature flags (using mock data)');
        // For now, just return mock data since database queries are having issues
        const cached = queryClient.getQueryData<FeatureFlag[]>(['feature-flags-admin']);
        return cached || getInitialMockFlags();
      },
      enabled: !!user,
      initialData: getInitialMockFlags(),
    });
  };

  // Get available feature flags for current user
  const useAvailableFeatureFlags = () => {
    return useQuery({
      queryKey: ['feature-flags-available', user?.id, currentWorkspace?.id],
      queryFn: async (): Promise<FeatureFlag[]> => {
        const adminFlags = queryClient.getQueryData<FeatureFlag[]>(['feature-flags-admin']) || getInitialMockFlags();
        
        // Filter flags based on user role and enabled state
        const filteredFlags = adminFlags.filter((flag: FeatureFlag) => {
          // Must be enabled
          if (!flag.enabled) return false;
          
          // Check if user role is targeted
          const roleMatch = !flag.target_roles || flag.target_roles.includes(user?.role || '');
          
          // Check if user is in rollout percentage
          // This would use a deterministic hash in a real implementation
          const userIdHash = parseInt(user?.id?.substring(0, 8) || '0', 16);
          const inRolloutPercentage = (userIdHash % 100) < flag.rollout_percentage;
          
          return roleMatch && inRolloutPercentage;
        });
        
        return filteredFlags;
      },
      enabled: !!user,
    });
  };

  // Check if a specific feature is enabled
  const isFeatureEnabled = (featureName: string): boolean => {
    // First check admin flags (includes mock flags)
    const adminFlags = queryClient.getQueryData<FeatureFlag[]>(['feature-flags-admin']);
    const adminFlag = adminFlags?.find(f => f.name === featureName);
    
    console.log(`Checking feature ${featureName}:`, {
      adminFlags: adminFlags?.length || 0,
      adminFlag: adminFlag ? { id: adminFlag.id, enabled: adminFlag.enabled } : null
    });
    
    // If we have an admin flag (real or mock), use its enabled state
    if (adminFlag) {
      console.log(`Feature ${featureName} result from admin flag:`, adminFlag.enabled);
      return adminFlag.enabled;
    }
    
    // Then check available flags for fallback
    const availableFlags = queryClient.getQueryData<FeatureFlag[]>([
      'feature-flags-available', 
      user?.id, 
      currentWorkspace?.id
    ]);
    const availableFlag = availableFlags?.find(f => f.name === featureName);
    
    // Special case for PHONE_DIALER fallback
    if (featureName === 'PHONE_DIALER') {
      // If no flag exists and user is superadmin, allow access
      if (!adminFlag && !availableFlag && user?.role === 'superadmin') {
        console.log('No flag found, but superadmin access granted');
        return true;
      }
    }
    
    // Return the available flag state or false if not found
    const result = availableFlag?.enabled || false;
    console.log(`Feature ${featureName} result:`, result);
    return result;
  };

  // Toggle a feature flag (admin only)
  const toggleFeatureFlag = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      console.log(`Toggle mutation called: ${id} -> ${enabled}`);
      
      // Update admin flags cache
      const currentAdminFlags = queryClient.getQueryData<FeatureFlag[]>(['feature-flags-admin']) || getInitialMockFlags();
      console.log('Current admin flags before update:', currentAdminFlags);
      
      const updatedAdminFlags = currentAdminFlags.map(flag => 
        flag.id === id ? { ...flag, enabled, updated_at: new Date().toISOString() } : flag
      );
      
      console.log('Updated admin flags:', updatedAdminFlags);
      queryClient.setQueryData(['feature-flags-admin'], updatedAdminFlags);
      
      // Update available flags cache for all users
      const availableQueryKeys = queryClient.getQueryCache().findAll({
        queryKey: ['feature-flags-available']
      });
      
      console.log('Updating available flags caches:', availableQueryKeys.length);
      
      availableQueryKeys.forEach(({ queryKey }) => {
        const currentAvailableFlags = queryClient.getQueryData<FeatureFlag[]>(queryKey) || [];
        const flagExists = currentAvailableFlags.find(flag => flag.id === id);
        
        if (flagExists) {
          const updatedAvailableFlags = currentAvailableFlags.map(flag => 
            flag.id === id ? { ...flag, enabled, updated_at: new Date().toISOString() } : flag
          );
          queryClient.setQueryData(queryKey, updatedAvailableFlags);
        } else if (enabled) {
          // Add the enabled flag to available flags
          const mockFlag = updatedAdminFlags.find(flag => flag.id === id);
          if (mockFlag) {
            queryClient.setQueryData(queryKey, [...currentAvailableFlags, mockFlag]);
          }
        }
      });
    },
    onSuccess: () => {
      console.log('Toggle mutation success, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['feature-flags-admin'] });
      queryClient.invalidateQueries({ queryKey: ['feature-flags-available'] });
    },
  });

  // Create a new feature flag (admin only)
  const createFeatureFlag = useMutation({
    mutationFn: async (flag: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating new feature flag:', flag.name);
      
      // Create a mock flag in the cache
      const newMockFlag: FeatureFlag = {
        ...flag,
        id: `mock-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const currentFlags = queryClient.getQueryData<FeatureFlag[]>(['feature-flags-admin']) || getInitialMockFlags();
      queryClient.setQueryData(['feature-flags-admin'], [...currentFlags, newMockFlag]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags-admin'] });
    },
  });

  // Update a feature flag (admin only)
  const updateFeatureFlag = useMutation({
    mutationFn: async (flag: Partial<FeatureFlag> & { id: string }) => {
      console.log(`Updating feature flag: ${flag.id}`);
      
      // Update the flag in the cache
      const currentFlags = queryClient.getQueryData<FeatureFlag[]>(['feature-flags-admin']) || getInitialMockFlags();
      const updatedFlags = currentFlags.map(f => 
        f.id === flag.id ? { ...f, ...flag, updated_at: new Date().toISOString() } : f
      );
      
      queryClient.setQueryData(['feature-flags-admin'], updatedFlags);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags-admin'] });
      queryClient.invalidateQueries({ queryKey: ['feature-flags-available'] });
    },
  });

  // Delete a feature flag (admin only)
  const deleteFeatureFlag = useMutation({
    mutationFn: async (id: string) => {
      console.log(`Deleting feature flag: ${id}`);
      
      // Remove the flag from the cache
      const currentFlags = queryClient.getQueryData<FeatureFlag[]>(['feature-flags-admin']) || getInitialMockFlags();
      const updatedFlags = currentFlags.filter(flag => flag.id !== id);
      
      queryClient.setQueryData(['feature-flags-admin'], updatedFlags);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags-admin'] });
    },
  });

  return {
    useAllFeatureFlags,
    useAvailableFeatureFlags,
    isFeatureEnabled,
    toggleFeatureFlag,
    createFeatureFlag,
    updateFeatureFlag,
    deleteFeatureFlag,
  };
}
