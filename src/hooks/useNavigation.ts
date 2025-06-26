import { useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import { NavigationItem } from '../types/database';

const SUPERADMIN_NAVIGATION: NavigationItem[] = [
  {
    id: 'admin-dashboard',
    label: 'Admin Dashboard',
    href: '/admin',
    icon: 'Shield',
    roles: ['superadmin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true
  },
  {
    id: 'system-management',
    label: 'System Management',
    href: '/admin/system',
    icon: 'Database',
    roles: ['superadmin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true,
    children: [
      {
        id: 'application-settings',
        label: 'Application Settings',
        href: '/admin/settings',
        icon: 'Settings',
        roles: ['superadmin'],
        subscription_tiers: ['free', 'pro', 'enterprise'],
        enabled: true
      },
      {
        id: 'feature-flags',
        label: 'Feature Flags',
        href: '/admin/features',
        icon: 'Flag',
        roles: ['superadmin'],
        subscription_tiers: ['free', 'pro', 'enterprise'],
        enabled: true
      },
      {
        id: 'system-notifications',
        label: 'System Notifications',
        href: '/admin/notifications',
        icon: 'Bell',
        roles: ['superadmin'],
        subscription_tiers: ['free', 'pro', 'enterprise'],
        enabled: true
      }
    ]
  },
  {
    id: 'user-management',
    label: 'User Management',
    href: '/admin/users',
    icon: 'Users',
    roles: ['superadmin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true
  },
  {
    id: 'workspace-management',
    label: 'Workspace Management',
    href: '/admin/workspaces',
    icon: 'Database',
    roles: ['superadmin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true
  },
  {
    id: 'lexicon-management',
    label: 'Lexicon',
    href: '/admin/lexicon',
    icon: 'Globe',
    roles: ['superadmin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    href: '/admin/audit',
    icon: 'Activity',
    roles: ['superadmin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true
  },
  {
    id: 'platform-analytics',
    label: 'Platform Analytics',
    href: '/admin/analytics',
    icon: 'BarChart3',
    roles: ['superadmin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true
  }
];

const CREATOR_NAVIGATION: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/',
    icon: 'Home',
    roles: ['artist', 'manager', 'label_admin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true
  },
  {
    id: 'catalog',
    label: 'Catalog',
    href: '/catalog',
    icon: 'Music',
    roles: ['artist', 'manager', 'label_admin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true,
    children: [
      {
        id: 'tracks',
        label: 'Tracks',
        href: '/catalog/tracks',
        icon: 'Music',
        roles: ['artist', 'manager', 'label_admin'],
        subscription_tiers: ['free', 'pro', 'enterprise'],
        enabled: true
      },
      {
        id: 'albums',
        label: 'Albums / EPs',
        href: '/catalog/albums',
        icon: 'Disc3',
        roles: ['artist', 'manager', 'label_admin'],
        subscription_tiers: ['free', 'pro', 'enterprise'],
        enabled: true
      },
      {
        id: 'assets',
        label: 'Assets & Stems',
        href: '/catalog/assets',
        icon: 'Music',
        roles: ['artist', 'manager', 'label_admin'],
        subscription_tiers: ['pro', 'enterprise'],
        enabled: true,
        requiresUpgrade: true
      }
    ]
  },
  {
    id: 'releases',
    label: 'Releases',
    href: '/releases',
    icon: 'Disc3',
    roles: ['artist', 'manager', 'label_admin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true,
    children: [
      {
        id: 'planner',
        label: 'Planner',
        href: '/releases/planner',
        icon: 'Calendar',
        roles: ['artist', 'manager', 'label_admin'],
        subscription_tiers: ['pro', 'enterprise'],
        enabled: true,
        requiresUpgrade: true
      },
      {
        id: 'compliance',
        label: 'Compliance',
        href: '/releases/compliance',
        icon: 'CheckCircle',
        roles: ['artist', 'manager', 'label_admin'],
        subscription_tiers: ['free', 'pro', 'enterprise'],
        enabled: true
      },
      {
        id: 'milestones',
        label: 'Milestones',
        href: '/releases/milestones',
        icon: 'Target',
        roles: ['artist', 'manager', 'label_admin'],
        subscription_tiers: ['pro', 'enterprise'],
        enabled: true,
        requiresUpgrade: true
      }
    ]
  },
  {
    id: 'commerce',
    label: 'Commerce',
    href: '/commerce',
    icon: 'ShoppingBag',
    roles: ['artist', 'manager', 'label_admin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true,
    children: [
      {
        id: 'storefront',
        label: 'Storefront',
        href: '/commerce/storefront',
        icon: 'Store',
        roles: ['artist', 'manager', 'label_admin'],
        subscription_tiers: ['free', 'pro', 'enterprise'],
        enabled: true
      },
      {
        id: 'orders',
        label: 'Orders & Fulfillment',
        href: '/commerce/orders',
        icon: 'ShoppingBag',
        roles: ['artist', 'manager', 'label_admin'],
        subscription_tiers: ['free', 'pro', 'enterprise'],
        enabled: true
      },
      {
        id: 'pricing',
        label: 'Pricing / Coupons',
        href: '/commerce/pricing',
        icon: 'DollarSign',
        roles: ['artist', 'manager', 'label_admin'],
        subscription_tiers: ['pro', 'enterprise'],
        enabled: true,
        requiresUpgrade: true
      }
    ]
  },
  {
    id: 'community',
    label: 'Community',
    href: '/community',
    icon: 'Users',
    roles: ['artist', 'manager', 'label_admin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true,
    children: [
      {
        id: 'fan-hub',
        label: 'Fan Hub',
        href: '/community/fan-hub',
        icon: 'Users',
        roles: ['artist', 'manager', 'label_admin'],
        subscription_tiers: ['free', 'pro', 'enterprise'],
        enabled: true
      },
      {
        id: 'membership-tiers',
        label: 'Membership Tiers',
        href: '/community/tiers',
        icon: 'Heart',
        roles: ['artist', 'manager', 'label_admin'],
        subscription_tiers: ['pro', 'enterprise'],
        enabled: true,
        requiresUpgrade: true
      }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/analytics',
    icon: 'BarChart3',
    roles: ['artist', 'manager', 'label_admin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true,
    children: [
      {
        id: 'audience',
        label: 'Audience',
        href: '/analytics/audience',
        icon: 'Users',
        roles: ['artist', 'manager', 'label_admin'],
        subscription_tiers: ['free', 'pro', 'enterprise'],
        enabled: true
      },
      {
        id: 'revenue',
        label: 'Revenue',
        href: '/analytics/revenue',
        icon: 'DollarSign',
        roles: ['artist', 'manager', 'label_admin'],
        subscription_tiers: ['pro', 'enterprise'],
        enabled: true,
        requiresUpgrade: true
      },
      {
        id: 'campaigns',
        label: 'Campaigns',
        href: '/analytics/campaigns',
        icon: 'BarChart3',
        roles: ['artist', 'manager', 'label_admin'],
        subscription_tiers: ['pro', 'enterprise'],
        enabled: true,
        requiresUpgrade: true
      }
    ]
  },
  {
    id: 'finances',
    label: 'Finances',
    href: '/finances',
    icon: 'DollarSign',
    roles: ['artist', 'manager', 'label_admin'],
    subscription_tiers: ['pro', 'enterprise'],
    enabled: true,
    requiresUpgrade: true,
    children: [
      {
        id: 'payouts',
        label: 'Payouts & Splits',
        href: '/finances/payouts',
        icon: 'CreditCard',
        roles: ['artist', 'manager', 'label_admin'],
        subscription_tiers: ['pro', 'enterprise'],
        enabled: true,
        requiresUpgrade: true
      },
      {
        id: 'taxes',
        label: 'Taxes',
        href: '/finances/taxes',
        icon: 'FileText',
        roles: ['artist', 'manager', 'label_admin'],
        subscription_tiers: ['enterprise'],
        enabled: true,
        requiresUpgrade: true
      }
    ]
  },
  {
    id: 'ai-team',
    label: 'AI Team',
    href: '/ai-team',
    icon: 'Bot',
    roles: ['artist', 'manager', 'label_admin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: 'Settings',
    roles: ['artist', 'manager', 'label_admin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true
  }
];

const FAN_NAVIGATION: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: 'Home',
    roles: ['fan', 'educator', 'collector'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true
  },
  {
    id: 'discover',
    label: 'Discover',
    href: '/discover',
    icon: 'Search',
    roles: ['fan', 'educator', 'collector'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true
  },
  {
    id: 'library',
    label: 'Library',
    href: '/library',
    icon: 'Library',
    roles: ['fan', 'educator', 'collector'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true
  },
  {
    id: 'community',
    label: 'Community',
    href: '/community',
    icon: 'Users',
    roles: ['fan', 'educator', 'collector'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true
  },
  {
    id: 'store',
    label: 'Store',
    href: '/store',
    icon: 'Store',
    roles: ['fan', 'educator', 'collector'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    icon: 'User',
    roles: ['fan', 'educator', 'collector'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true
  }
];

export function useNavigation() {
  const { user } = useAuthStore();

  const navigation = useMemo(() => {
    console.log('🧭 Navigation recalculating - User:', user?.email, 'Role:', user?.role || user?.user_metadata?.role);
    
    if (!user) return [];

    // Get user role with priority: user.role > user_metadata.role > default
    const userRole = user.role || (user.user_metadata?.role as string) || 'fan';

    // Superadmin gets special navigation
    if (userRole === 'superadmin') {
      return [...SUPERADMIN_NAVIGATION, ...CREATOR_NAVIGATION];
    }

    // Determine which navigation set to use
    const baseNavigation = ['artist', 'manager', 'label_admin'].includes(userRole) 
      ? CREATOR_NAVIGATION 
      : FAN_NAVIGATION;

    // For demo users, show ALL navigation items regardless of subscription tier
    // This allows them to see the full platform and get upgrade prompts

    return baseNavigation.filter(item => {
      const hasRole = item.roles.includes(userRole);
      return hasRole && item.enabled;
    }).map(item => ({
      ...item,
      children: item.children?.filter(child => {
        const hasRole = child.roles.includes(userRole);
        return hasRole && child.enabled;
      })
    }));
  }, [user]); // Use full user object to trigger re-render on any user change

  return { navigation };
}