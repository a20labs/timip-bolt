// PAM (Privileged Access Management) Types and Interfaces

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: AccessCondition[];
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number; // Hierarchy level (0 = lowest, 100 = highest)
  permissions: Permission[];
  parent_role_id?: string;
  is_system_role: boolean;
  is_temporary: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  rules: PolicyRule[];
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface PolicyRule {
  id: string;
  condition: string; // JSON string of conditions
  action: 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL';
  resource_pattern: string;
  time_restrictions?: TimeRestriction[];
  location_restrictions?: LocationRestriction[];
}

export interface AccessCondition {
  type: 'TIME' | 'LOCATION' | 'DEVICE' | 'RISK_SCORE' | 'MFA_REQUIRED';
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS';
  value: string;
}

export interface TimeRestriction {
  days_of_week: number[]; // 0-6 (Sunday-Saturday)
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  timezone: string;
}

export interface LocationRestriction {
  type: 'IP_RANGE' | 'COUNTRY' | 'CITY' | 'GEOFENCE';
  value: string;
  allowed: boolean;
}

export interface AccessRequest {
  id: string;
  user_id: string;
  requested_role_id?: string;
  requested_permissions: string[];
  resource: string;
  justification: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED';
  requested_at: string;
  expires_at?: string;
  approved_by?: string;
  approved_at?: string;
  denied_reason?: string;
}

export interface AccessSession {
  id: string;
  user_id: string;
  session_token: string;
  elevated_permissions: Permission[];
  granted_roles: Role[];
  start_time: string;
  end_time?: string;
  is_active: boolean;
  risk_score: number;
  last_activity: string;
  device_info: DeviceInfo;
  location_info: LocationInfo;
}

export interface DeviceInfo {
  device_id: string;
  device_type: 'DESKTOP' | 'MOBILE' | 'TABLET';
  os: string;
  browser: string;
  is_trusted: boolean;
  fingerprint: string;
}

export interface LocationInfo {
  ip_address: string;
  country: string;
  city: string;
  latitude?: number;
  longitude?: number;
  is_vpn: boolean;
  is_trusted_location: boolean;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id?: string;
  result: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  risk_score: number;
  timestamp: string;
  details: Record<string, unknown>;
  session_id?: string;
  ip_address: string;
  user_agent: string;
}

export interface RiskAssessment {
  id: string;
  user_id: string;
  session_id: string;
  overall_score: number; // 0-100
  factors: RiskFactor[];
  recommendations: string[];
  requires_additional_auth: boolean;
  timestamp: string;
}

export interface RiskFactor {
  type: 'LOCATION' | 'DEVICE' | 'BEHAVIOR' | 'TIME' | 'VELOCITY';
  score: number; // 0-100
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface PAMConfiguration {
  id: string;
  organization_id: string;
  settings: {
    password_policy: PasswordPolicy;
    session_timeout: number; // minutes
    max_concurrent_sessions: number;
    require_mfa_for_privileged: boolean;
    auto_revoke_inactive_sessions: boolean;
    risk_threshold_for_blocking: number; // 0-100
    audit_retention_days: number;
    enable_just_in_time_access: boolean;
    default_access_duration: number; // minutes
  };
  created_at: string;
  updated_at: string;
}

export interface PasswordPolicy {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  max_age_days: number;
  prevent_reuse_count: number;
}

// Utility types for PAM operations
export type AccessResult = {
  allowed: boolean;
  reason?: string;
  required_conditions?: AccessCondition[];
  risk_score: number;
  session_id?: string;
};

export type PermissionCheck = {
  resource: string;
  action: string;
  context?: Record<string, unknown>;
};

export type RoleAssignment = {
  user_id: string;
  role_id: string;
  assigned_by: string;
  assigned_at: string;
  expires_at?: string;
  is_temporary: boolean;
};
