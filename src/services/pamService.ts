import { 
  Permission, 
  AccessRequest, 
  AccessSession, 
  AuditLog, 
  RiskAssessment,
  AccessResult,
  PermissionCheck,
  RoleAssignment,
  PAMConfiguration
} from '../types/pam';

/**
 * PAM (Privileged Access Management) Service
 * Provides comprehensive access control, role management, and security auditing
 */
export class PAMService {
  private static instance: PAMService;
  private config: PAMConfiguration | null = null;
  private mockData = {
    permissions: new Map<string, Permission[]>(),
    auditLogs: [] as AuditLog[],
    sessions: new Map<string, AccessSession>(),
    users: new Map<string, { 
      id: string; 
      email: string; 
      role: string; 
      isPaidSubscriber: boolean; 
      subscriptionTier: 'free' | 'pro' | 'enterprise';
    }>()
  };

  private constructor() {
    this.initializeMockData();
    this.initializeAyeTwentyUser();
  }

  public static getInstance(): PAMService {
    if (!PAMService.instance) {
      PAMService.instance = new PAMService();
    }
    return PAMService.instance;
  }

  /**
   * Initialize mock data for PAM system
   */
  private initializeMockData(): void {
    // Initialize with default permissions for different roles
    const adminPermissions: Permission[] = [
      {
        id: 'perm_admin_user_management',
        name: 'User Management',
        description: 'Full user management capabilities',
        resource: 'users',
        action: '*',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'perm_admin_system_config',
        name: 'System Configuration',
        description: 'System configuration access',
        resource: 'system',
        action: '*',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'perm_admin_audit_logs',
        name: 'Audit Logs',
        description: 'Access to audit logs',
        resource: 'audit',
        action: 'read',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'perm_admin_pam_access',
        name: 'PAM Access',
        description: 'Access to PAM dashboard',
        resource: 'pam',
        action: '*',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const superAdminPermissions: Permission[] = [
      ...adminPermissions,
      {
        id: 'perm_superadmin_platform_config',
        name: 'Platform Configuration',
        description: 'Full platform configuration access',
        resource: 'platform',
        action: '*',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'perm_superadmin_white_label',
        name: 'White Label Access',
        description: 'White label platform management',
        resource: 'white-label',
        action: '*',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'perm_superadmin_billing',
        name: 'Billing Management',
        description: 'Full billing and subscription management',
        resource: 'billing',
        action: '*',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const indieLabelPermissions: Permission[] = [
      {
        id: 'perm_label_catalog',
        name: 'Label Catalog Management',
        description: 'Manage label music catalog',
        resource: 'catalog',
        action: '*',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'perm_label_artists',
        name: 'Artist Management',
        description: 'Manage label artists',
        resource: 'artists',
        action: '*',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'perm_label_releases',
        name: 'Release Management',
        description: 'Manage releases for label',
        resource: 'releases',
        action: '*',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'perm_label_analytics',
        name: 'Label Analytics',
        description: 'View label analytics data',
        resource: 'analytics',
        action: 'read',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'perm_label_white_label',
        name: 'White Label Platform',
        description: 'Access to white label features',
        resource: 'white-label',
        action: 'read',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'perm_label_distribution',
        name: 'Distribution Management',
        description: 'Manage music distribution',
        resource: 'distribution',
        action: '*',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const artistPermissions: Permission[] = [
      {
        id: 'perm_artist_catalog',
        name: 'Catalog Management',
        description: 'Manage music catalog',
        resource: 'catalog',
        action: '*',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'perm_artist_releases',
        name: 'Release Management',
        description: 'Manage releases',
        resource: 'releases',
        action: '*',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'perm_artist_analytics',
        name: 'Analytics Access',
        description: 'View analytics data',
        resource: 'analytics',
        action: 'read',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const fanPermissions: Permission[] = [
      {
        id: 'perm_fan_library',
        name: 'Library Access',
        description: 'Access personal library',
        resource: 'library',
        action: 'read',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'perm_fan_community',
        name: 'Community Access',
        description: 'Participate in community',
        resource: 'community',
        action: 'read',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Store permissions by role
    this.mockData.permissions.set('admin', adminPermissions);
    this.mockData.permissions.set('superadmin', superAdminPermissions);
    this.mockData.permissions.set('indielabel', indieLabelPermissions);
    this.mockData.permissions.set('artist', artistPermissions);
    this.mockData.permissions.set('fan', fanPermissions);

    // Initialize mock users with roles and subscription status
    this.mockData.users.set('ayetwenty@example.com', {
      id: 'user_ayetwenty',
      email: 'ayetwenty@example.com',
      role: 'superadmin',
      isPaidSubscriber: true,
      subscriptionTier: 'enterprise'
    });

    this.mockData.users.set('demo@example.com', {
      id: 'user_demo',
      email: 'demo@example.com', 
      role: 'fan',
      isPaidSubscriber: false,
      subscriptionTier: 'free'
    });

    this.mockData.users.set('artist@example.com', {
      id: 'user_artist',
      email: 'artist@example.com',
      role: 'artist',
      isPaidSubscriber: true,
      subscriptionTier: 'pro'
    });

    // Artists with starter plan (free tier)
    this.mockData.users.set('artist.starter@example.com', {
      id: 'user_artist_starter',
      email: 'artist.starter@example.com',
      role: 'artist',
      isPaidSubscriber: false,
      subscriptionTier: 'free'
    });

    // Artists with pro plan
    this.mockData.users.set('artist.pro@example.com', {
      id: 'user_artist_pro',
      email: 'artist.pro@example.com',
      role: 'artist',
      isPaidSubscriber: true,
      subscriptionTier: 'pro'
    });

    // Indie Label users
    this.mockData.users.set('label@example.com', {
      id: 'user_label',
      email: 'label@example.com',
      role: 'indielabel',
      isPaidSubscriber: true,
      subscriptionTier: 'enterprise'
    });

    // Demo users for the platform
    this.mockData.users.set('artistdemo@truindee.com', {
      id: 'user_artist_demo',
      email: 'artistdemo@truindee.com',
      role: 'artist',
      isPaidSubscriber: false,
      subscriptionTier: 'free'
    });

    this.mockData.users.set('fandemo@truindee.com', {
      id: 'user_fan_demo',
      email: 'fandemo@truindee.com',
      role: 'fan',
      isPaidSubscriber: false,
      subscriptionTier: 'free'
    });
  }

  /**
   * Initialize PAM service with configuration
   */
  async initialize(organizationId: string): Promise<void> {
    // Create default configuration
    this.config = {
      id: `config_${organizationId}`,
      organization_id: organizationId,
      settings: {
        password_policy: {
          min_length: 12,
          require_uppercase: true,
          require_lowercase: true,
          require_numbers: true,
          require_special_chars: true,
          max_age_days: 90,
          prevent_reuse_count: 5
        },
        session_timeout: 480, // 8 hours
        max_concurrent_sessions: 3,
        require_mfa_for_privileged: true,
        auto_revoke_inactive_sessions: true,
        risk_threshold_for_blocking: 80,
        audit_retention_days: 2555, // 7 years
        enable_just_in_time_access: true,
        default_access_duration: 240 // 4 hours
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Check if user has permission to perform an action on a resource
   */
  async checkPermission(
    userId: string, 
    permissionCheck: PermissionCheck,
    userRole?: string
  ): Promise<AccessResult> {
    try {
      // Get or create session
      let session = this.mockData.sessions.get(userId);
      if (!session) {
        session = await this.createSession(userId);
      }

      // Calculate risk score
      const riskAssessment = await this.assessRisk(userId, session.id);
      
      // Check if risk score exceeds threshold
      if (riskAssessment.overall_score > (this.config?.settings.risk_threshold_for_blocking || 80)) {
        await this.logAccess(userId, permissionCheck.action, permissionCheck.resource, 'BLOCKED', {
          reason: 'Risk score too high',
          risk_score: riskAssessment.overall_score
        });

        return {
          allowed: false,
          reason: 'Access blocked due to high risk score',
          risk_score: riskAssessment.overall_score
        };
      }

      // Get user's effective permissions
      const userPermissions = await this.getUserEffectivePermissions(userId, userRole);
      
      // Check if user has the required permission
      const hasPermission = userPermissions.some(permission => 
        (permission.resource === permissionCheck.resource || permission.resource === '*') && 
        (permission.action === permissionCheck.action || permission.action === '*')
      );

      if (!hasPermission) {
        await this.logAccess(userId, permissionCheck.action, permissionCheck.resource, 'FAILURE', {
          reason: 'Insufficient permissions'
        });

        return {
          allowed: false,
          reason: 'Insufficient permissions',
          risk_score: riskAssessment.overall_score
        };
      }

      // Log successful access
      await this.logAccess(userId, permissionCheck.action, permissionCheck.resource, 'SUCCESS', {
        session_id: session.id
      });

      return {
        allowed: true,
        risk_score: riskAssessment.overall_score,
        session_id: session.id
      };

    } catch (error) {
      console.error('🔐 PAM: Permission check failed:', error);
      return {
        allowed: false,
        reason: 'System error during permission check',
        risk_score: 100
      };
    }
  }

  /**
   * Get user's effective permissions
   */
  async getUserEffectivePermissions(userId: string, userRole?: string): Promise<Permission[]> {
    if (!userRole) {
      // Try to get role from mock users or default to 'fan'
      const mockUser = Array.from(this.mockData.users.values()).find(u => u.id === userId || u.email === userId);
      userRole = mockUser?.role || 'fan';
    }

    const permissions = this.mockData.permissions.get(userRole) || [];
    return permissions;
  }

  /**
   * Create a new session for user
   */
  async createSession(userId: string): Promise<AccessSession> {
    const session: AccessSession = {
      id: `session_${userId}_${Date.now()}`,
      user_id: userId,
      session_token: `token_${Date.now()}`,
      elevated_permissions: [],
      granted_roles: [],
      start_time: new Date().toISOString(),
      is_active: true,
      risk_score: 20,
      last_activity: new Date().toISOString(),
      device_info: {
        device_id: 'unknown',
        device_type: 'DESKTOP',
        os: 'unknown',
        browser: 'unknown',
        is_trusted: true,
        fingerprint: 'unknown'
      },
      location_info: {
        ip_address: 'unknown',
        country: 'unknown',
        city: 'unknown',
        is_vpn: false,
        is_trusted_location: true
      }
    };

    this.mockData.sessions.set(userId, session);
    return session;
  }

  /**
   * Assess risk for user and session
   */
  async assessRisk(userId: string, sessionId: string): Promise<RiskAssessment> {
    return {
      id: `risk_${Date.now()}`,
      user_id: userId,
      session_id: sessionId,
      overall_score: 20, // Low risk by default
      factors: [],
      recommendations: [],
      requires_additional_auth: false,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Log access attempt
   */
  async logAccess(
    userId: string,
    action: string,
    resource: string,
    result: 'SUCCESS' | 'FAILURE' | 'BLOCKED',
    details: Record<string, unknown> = {}
  ): Promise<void> {
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}`,
      user_id: userId,
      action,
      resource,
      result,
      risk_score: (details.risk_score as number) || 0,
      timestamp: new Date().toISOString(),
      details,
      session_id: details.session_id as string,
      ip_address: 'unknown',
      user_agent: 'unknown'
    };

    this.mockData.auditLogs.push(auditLog);
  }

  /**
   * Request elevated access
   */
  async requestAccess(request: Omit<AccessRequest, 'id' | 'status' | 'requested_at'>): Promise<AccessRequest> {
    const accessRequest: AccessRequest = {
      id: `request_${Date.now()}`,
      ...request,
      status: 'PENDING',
      requested_at: new Date().toISOString()
    };

    return accessRequest;
  }

  /**
   * Assign role to user
   */
  async assignRole(assignment: Omit<RoleAssignment, 'assigned_at'>): Promise<void> {
    // For now, just log the assignment
    await this.logAccess(
      assignment.assigned_by,
      'ASSIGN_ROLE',
      `user:${assignment.user_id}`,
      'SUCCESS',
      { role_id: assignment.role_id, target_user: assignment.user_id }
    );
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(
    filters: {
      user_id?: string;
      resource?: string;
      action?: string;
      result?: string;
      start_date?: string;
      end_date?: string;
      limit?: number;
    } = {}
  ): Promise<AuditLog[]> {
    let logs = [...this.mockData.auditLogs];

    // Apply filters
    if (filters.user_id) {
      logs = logs.filter(log => log.user_id === filters.user_id);
    }
    if (filters.resource) {
      logs = logs.filter(log => log.resource === filters.resource);
    }
    if (filters.action) {
      logs = logs.filter(log => log.action === filters.action);
    }
    if (filters.result) {
      logs = logs.filter(log => log.result === filters.result);
    }
    if (filters.start_date) {
      logs = logs.filter(log => log.timestamp >= filters.start_date!);
    }
    if (filters.end_date) {
      logs = logs.filter(log => log.timestamp <= filters.end_date!);
    }

    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply limit
    if (filters.limit) {
      logs = logs.slice(0, filters.limit);
    }

    return logs;
  }

  /**
   * Get PAM configuration
   */
  getConfiguration(): PAMConfiguration | null {
    return this.config;
  }

  /**
   * Get current sessions
   */
  getCurrentSessions(): AccessSession[] {
    return Array.from(this.mockData.sessions.values());
  }

  /**
   * Get available permissions by role
   */
  getPermissionsByRole(role: string): Permission[] {
    return this.mockData.permissions.get(role) || [];
  }

  /**
   * Get user information by email or ID
   */
  getUserInfo(emailOrId: string) {
    return Array.from(this.mockData.users.values()).find(
      user => user.email === emailOrId || user.id === emailOrId
    );
  }

  /**
   * Update user role and subscription status
   */
  updateUser(emailOrId: string, updates: { 
    role?: string; 
    isPaidSubscriber?: boolean; 
    subscriptionTier?: 'free' | 'pro' | 'enterprise';
  }) {
    const user = this.getUserInfo(emailOrId);
    if (user) {
      if (updates.role) user.role = updates.role;
      if (updates.isPaidSubscriber !== undefined) user.isPaidSubscriber = updates.isPaidSubscriber;
      if (updates.subscriptionTier) user.subscriptionTier = updates.subscriptionTier;
      this.mockData.users.set(user.email, user);
      return user;
    }
    return null;
  }

  /**
   * Get all users
   */
  getAllUsers() {
    return Array.from(this.mockData.users.values());
  }

  /**
   * Initialize "Aye Twenty" user as superadmin with paid subscription
   */
  initializeAyeTwentyUser() {
    this.mockData.users.set('ayetwenty@truindee.com', {
      id: 'user_aye_twenty',
      email: 'ayetwenty@truindee.com',
      role: 'superadmin',
      isPaidSubscriber: true,
      subscriptionTier: 'enterprise'
    });
    
    // Also add alternative common emails that might be used
    this.mockData.users.set('aye.twenty@truindee.com', {
      id: 'user_aye_twenty_alt',
      email: 'aye.twenty@truindee.com',
      role: 'superadmin',
      isPaidSubscriber: true,
      subscriptionTier: 'enterprise'
    });
  }

  /**
   * Get user subscription tier
   */
  getUserSubscriptionTier(emailOrId: string): 'free' | 'pro' | 'enterprise' {
    const user = this.getUserInfo(emailOrId);
    return user?.subscriptionTier || 'free';
  }

  /**
   * Check if user can upgrade to specific subscription tier
   */
  canUpgradeTo(emailOrId: string, targetTier: 'pro' | 'enterprise'): boolean {
    const currentTier = this.getUserSubscriptionTier(emailOrId);
    const tierHierarchy = { free: 0, pro: 1, enterprise: 2 };
    return tierHierarchy[currentTier] < tierHierarchy[targetTier];
  }

  /**
   * Get available upgrade options for user
   */
  getUpgradeOptions(emailOrId: string): Array<{ tier: 'pro' | 'enterprise'; name: string; description: string }> {
    const user = this.getUserInfo(emailOrId);
    if (!user) return [];

    const options = [];
    
    // Artists can upgrade to Pro Artist or Indie Label
    if (user.role === 'artist') {
      if (this.canUpgradeTo(emailOrId, 'pro')) {
        options.push({
          tier: 'pro' as const,
          name: 'Pro Artist',
          description: 'Unlimited tracks, advanced analytics, full AI team access'
        });
      }
      
      if (this.canUpgradeTo(emailOrId, 'enterprise')) {
        options.push({
          tier: 'enterprise' as const,
          name: 'Indie Label',
          description: 'White-label platform, custom integrations, dedicated support'
        });
      }
    }
    
    // Other roles can also upgrade
    if (user.role === 'fan' || user.role === 'manager') {
      if (this.canUpgradeTo(emailOrId, 'pro')) {
        options.push({
          tier: 'pro' as const,
          name: 'Pro',
          description: 'Enhanced features and priority support'
        });
      }
    }

    return options;
  }
}

// Export singleton instance
export const pamService = PAMService.getInstance();
