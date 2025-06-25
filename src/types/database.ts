interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'artist' | 'manager' | 'label_admin' | 'fan' | 'educator' | 'collector' | 'support_agent' | 'platform_admin' | 'superadmin';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  workspace_type: 'artist' | 'label' | 'manager';
  compliance_status: Record<string, any>;
  settings: Record<string, any>;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'collaborator' | 'viewer' | 'superadmin';
  permissions: string[];
  invited_by: string;
  created_at: string;
}

interface Track {
  id: string;
  workspace_id: string;
  title: string;
  artist: string;
  duration: number;
  file_url?: string;
  file_size: number;
  format: string;
  isrc?: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  metadata: {
    genre?: string[];
    mood?: string[];
    instruments?: string[];
    languages?: string[];
    bpm?: number;
    key?: string;
    cc_license?: string;
    edu_safe?: boolean;
  };
  visibility: 'private' | 'workspace' | 'public';
  created_at: string;
  updated_at: string;
}

interface Release {
  id: string;
  workspace_id: string;
  title: string;
  artist: string;
  release_type: 'single' | 'ep' | 'album' | 'compilation';
  release_date?: string;
  upc?: string;
  artwork_url?: string;
  description?: string;
  metadata: {
    campaign_tags?: string[];
    pre_order_window?: string;
    territory_rights?: string[];
  };
  visibility: 'private' | 'workspace' | 'public';
  created_at: string;
  updated_at: string;
}

interface Product {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  price: number;
  inventory: number;
  digital: boolean;
  product_type: 'physical' | 'digital' | 'nft' | 'experience';
  images: string[];
  metadata: Record<string, any>;
  active: boolean;
  visibility: 'private' | 'workspace' | 'public';
  created_at: string;
  updated_at: string;
}

interface SearchResult {
  id: string;
  type: 'track' | 'artist' | 'release' | 'product' | 'post';
  title: string;
  subtitle?: string;
  thumbnail?: string;
  workspace_id: string;
  visibility: 'private' | 'workspace' | 'public';
  metadata: Record<string, any>;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  roles: string[];
  subscription_tiers: string[];
  enabled: boolean;
  requiresUpgrade?: boolean;
  children?: NavigationItem[];
}

interface ApplicationSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  category: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  workspace_id?: string;
  created_at: string;
}

interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  target_roles: string[];
  target_workspaces?: string[];
  active: boolean;
  expires_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  rollout_percentage: number;
  target_roles?: string[];
  target_workspaces?: string[];
  metadata: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}