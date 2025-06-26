// Service for handling user registration and first-time setup
import { useWorkspaceStore } from '../stores/workspaceStore';

export interface SignUpData {
  email: string;
  fullName: string;
  accountType: 'artist' | 'fan';
  workspaceName?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_account_owner: boolean;
  workspace_id: string | null;
  created_at: string;
  updated_at: string;
}

export const userRegistrationService = {
  /**
   * Check if this is the first user for the given email domain or workspace
   */
  async isFirstUser(_email: string): Promise<boolean> {
    try {
      // For demo purposes, we'll use a simple mock check
      // In a real implementation, you'd query the database
      
      // Check if we've already created any demo users in this session
      // You can extend this logic to check localStorage or sessionStorage
      const demoUsersCreated = sessionStorage.getItem('demoUsersCreated');
      const isFirst = !demoUsersCreated;
      
      console.log(`First user check for ${_email}:`, isFirst);
      return isFirst;
    } catch (err) {
      console.warn('Error in isFirstUser check:', err);
      return true; // Default to first user on error
    }
  },

  /**
   * Create a new user account with appropriate role and workspace
   */
  async createUserAccount(userData: SignUpData): Promise<UserProfile> {
    console.log('🔐 UserRegistrationService.createUserAccount called:', userData);
    
    const isFirst = await this.isFirstUser(userData.email);
    console.log('🔐 UserRegistrationService: Is first user?', isFirst);
    
    // Determine role based on account type and whether this is the first user
    let role: string;
    if (isFirst) {
      // First user becomes admin regardless of account type
      role = userData.accountType === 'artist' ? 'admin' : 'admin';
    } else {
      // Subsequent users get the basic role for their account type
      role = userData.accountType;
    }

    console.log('🔐 UserRegistrationService: Determined role:', role);
    const workspaceName = userData.workspaceName || 
      (userData.accountType === 'artist' ? `${userData.fullName}'s Studio` : `${userData.fullName}'s Collection`);

    try {
      // Create user profile
      const userProfile: UserProfile = {
        id: `user-${Date.now()}`, // In real app, this would come from Supabase Auth
        email: userData.email,
        full_name: userData.fullName,
        role: role,
        is_account_owner: isFirst,
        workspace_id: null, // Will be set after workspace creation
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Create workspace if this is an artist or the first user
      if (userData.accountType === 'artist' || isFirst) {
        const workspace = await this.createWorkspace({
          name: workspaceName,
          type: userData.accountType === 'artist' ? 'artist' : 'label',
          ownerId: userProfile.id,
        });

        userProfile.workspace_id = workspace.id;

        // Set workspace in store
        useWorkspaceStore.getState().setCurrentWorkspace(workspace);
      }

      console.log('Created user account:', {
        email: userData.email,
        role: role,
        isAccountOwner: isFirst,
        hasWorkspace: !!userProfile.workspace_id,
      });

      // Mark that we've created a demo user (for first-user logic)
      if (isFirst) {
        sessionStorage.setItem('demoUsersCreated', 'true');
      }

      return userProfile;
    } catch (error) {
      console.error('Error creating user account:', error);
      throw new Error('Failed to create user account');
    }
  },

  /**
   * Create a new workspace
   */
  async createWorkspace(workspaceData: {
    name: string;
    type: 'artist' | 'label' | 'manager';
    ownerId: string;
  }) {
    const workspace = {
      id: `workspace-${Date.now()}`,
      name: workspaceData.name,
      slug: workspaceData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      owner_id: workspaceData.ownerId,
      workspace_type: workspaceData.type,
      compliance_status: {},
      settings: {
        default_currency: 'USD',
        timezone: 'UTC',
        notifications_enabled: true,
      },
      subscription_tier: 'free' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // For demo purposes, we'll use mock data instead of real Supabase calls
      // In a real app, this would insert into Supabase
      console.log('Creating workspace (mock):', workspace.name);
      
      // Simulate the database insert with mock success
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      
      console.log('Created workspace:', workspace.name);
      return workspace;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw new Error('Failed to create workspace');
    }
  },

  /**
   * Handle demo account creation with first-user logic
   */
  async createDemoAccount(email: string, accountType: 'artist' | 'fan'): Promise<UserProfile> {
    console.log('🔐 UserRegistrationService.createDemoAccount called:', { email, accountType });
    
    const fullName = email === 'artistdemo@truindee.com' 
      ? 'Demo Artist' 
      : email === 'fandemo@truindee.com'
      ? 'Demo Fan'
      : 'Demo User';

    console.log('🔐 UserRegistrationService: Full name determined:', fullName);

    const result = await this.createUserAccount({
      email,
      fullName,
      accountType,
      workspaceName: accountType === 'artist' ? 'Demo Studio' : 'Demo Collection',
    });
    
    console.log('🔐 UserRegistrationService: createUserAccount result:', result);
    return result;
  },

  /**
   * Update user role (admin function)
   */
  async updateUserRole(userId: string, newRole: string): Promise<void> {
    try {
      // For demo purposes, we'll use mock data instead of real Supabase calls
      // In a real app, this would update the user in Supabase
      console.log(`Updating user ${userId} role to ${newRole} (mock)`);
      
      // Simulate the database update with mock success
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      
      console.log(`Updated user ${userId} role to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  },

  /**
   * Check if current user is account owner
   */
  isAccountOwner(user: unknown): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userObj = user as any;
    return userObj?.role === 'admin' && userObj?.is_account_owner === true;
  },

  /**
   * Get user permissions based on role and ownership status
   */
  getUserPermissions(user: unknown) {
    const isOwner = this.isAccountOwner(user);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userObj = user as any;
    const isAdmin = userObj?.role === 'admin' || userObj?.role === 'superadmin';
    
    return {
      canManageUsers: isOwner || isAdmin,
      canManageWorkspace: isOwner || isAdmin,
      canManageBilling: isOwner,
      canDeleteAccount: isOwner,
      canInviteUsers: isOwner || isAdmin,
      canManageRoles: isOwner,
      canViewAnalytics: isOwner || isAdmin,
      canManageIntegrations: isOwner || isAdmin,
    };
  },
};
