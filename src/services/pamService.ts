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
    sessions: new Map<string, AccessSession>()
  };

  private constructor() {
    this.initializeMockData();
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
    this.mockData.permissions.set('artist', artistPermissions);
    this.mockData.permissions.set('fan', fanPermissions);
    this.mockData.permissions.set('superadmin', [...adminPermissions, ...artistPermissions]);
  }

  /**
   * Initialize PAM service with configuration
   */
  async initialize(organizationId: string): Promise<void> {
    console.log('🔐 PAM: Initializing PAM service for organization:', organizationId);
    
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

    console.log('🔐 PAM: Service initialized successfully');
  }

  /**
   * Check if user has permission to perform an action on a resource
   */
  async checkPermission(
    userId: string, 
    permissionCheck: PermissionCheck,
    userRole?: string
  ): Promise<AccessResult> {
    console.log('🔐 PAM: Checking permission for user:', userId, 'Check:', permissionCheck);

    try {
      // Get or create session
      let session = this.mockData.sessions.get(userId);
      if (!session) {
        session = await this.createSession(userId, userRole || 'fan');
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
    console.log('🔐 PAM: Getting permissions for user:', userId, 'role:', userRole);
    
    if (!userRole) {
      // Try to get role from auth store or default to 'fan'
      userRole = 'fan';
    }

    const permissions = this.mockData.permissions.get(userRole) || [];
    console.log('🔐 PAM: Found permissions:', permissions.length, 'for role:', userRole);
    
    return permissions;
  }

  /**
   * Create a new session for user
   */
  async createSession(userId: string, _userRole: string): Promise<AccessSession> {
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
    console.log('🔐 PAM: Created session for user:', userId);
    
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
    console.log('🔐 PAM: Logged access:', result, 'for user:', userId, 'action:', action, 'resource:', resource);
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

    console.log('🔐 PAM: Access request created:', accessRequest.id);
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

    console.log('🔐 PAM: Role assigned successfully');
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
}

// Export singleton instance
export const pamService = PAMService.getInstance();
