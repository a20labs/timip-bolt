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
    roles: ['admin', 'artist', 'manager', 'label_admin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true
  },
  {
    id: 'catalog',
    label: 'Catalog',
    href: '/catalog',
    icon: 'Music',
    roles: ['admin', 'artist', 'manager', 'label_admin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true,
    children: [
      {
        id: 'tracks',
        label: 'Tracks',
        href: '/catalog/tracks',
        icon: 'Music',
        roles: ['admin', 'artist', 'manager', 'label_admin'],
        subscription_tiers: ['free', 'pro', 'enterprise'],
        enabled: true
      },
      {
        id: 'albums',
        label: 'Albums / EPs',
        href: '/catalog/albums',
        icon: 'Disc3',
        roles: ['admin', 'artist', 'manager', 'label_admin'],
        subscription_tiers: ['free', 'pro', 'enterprise'],
        enabled: true
      },
      {
        id: 'assets',
        label: 'Assets & Stems',
        href: '/catalog/assets',
        icon: 'Music',
        roles: ['admin', 'artist', 'manager', 'label_admin'],
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
    roles: ['admin', 'artist', 'manager', 'label_admin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true,
    children: [
      {
        id: 'planner',
        label: 'Planner',
        href: '/releases/planner',
        icon: 'Calendar',
        roles: ['admin', 'artist', 'manager', 'label_admin'],
        subscription_tiers: ['pro', 'enterprise'],
        enabled: true,
        requiresUpgrade: true
      },
      {
        id: 'compliance',
        label: 'Compliance',
        href: '/releases/compliance',
        icon: 'CheckCircle',
        roles: ['admin', 'artist', 'manager', 'label_admin'],
        subscription_tiers: ['free', 'pro', 'enterprise'],
        enabled: true
      },
      {
        id: 'milestones',
        label: 'Milestones',
        href: '/releases/milestones',
        icon: 'Target',
        roles: ['admin', 'artist', 'manager', 'label_admin'],
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
    roles: ['admin', 'artist', 'manager', 'label_admin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true,
    children: [
      {
        id: 'storefront',
        label: 'Storefront',
        href: '/commerce/storefront',
        icon: 'Store',
        roles: ['admin', 'artist', 'manager', 'label_admin'],
        subscription_tiers: ['free', 'pro', 'enterprise'],
        enabled: true
      },
      {
        id: 'orders',
        label: 'Orders & Fulfillment',
        href: '/commerce/orders',
        icon: 'ShoppingBag',
        roles: ['admin', 'artist', 'manager', 'label_admin'],
        subscription_tiers: ['free', 'pro', 'enterprise'],
        enabled: true
      },
      {
        id: 'pricing',
        label: 'Pricing / Coupons',
        href: '/commerce/pricing',
        icon: 'DollarSign',
        roles: ['admin', 'artist', 'manager', 'label_admin'],
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
    roles: ['admin', 'artist', 'manager', 'label_admin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true,
    children: [
      {
        id: 'fan-hub',
        label: 'Fan Hub',
        href: '/community/fan-hub',
        icon: 'Users',
        roles: ['admin', 'artist', 'manager', 'label_admin'],
        subscription_tiers: ['free', 'pro', 'enterprise'],
        enabled: true
      },
      {
        id: 'membership-tiers',
        label: 'Membership Tiers',
        href: '/community/tiers',
        icon: 'Heart',
        roles: ['admin', 'artist', 'manager', 'label_admin'],
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
    roles: ['admin', 'artist', 'manager', 'label_admin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true,
    children: [
      {
        id: 'audience',
        label: 'Audience',
        href: '/analytics/audience',
        icon: 'Users',
        roles: ['admin', 'artist', 'manager', 'label_admin'],
        subscription_tiers: ['free', 'pro', 'enterprise'],
        enabled: true
      },
      {
        id: 'revenue',
        label: 'Revenue',
        href: '/analytics/revenue',
        icon: 'DollarSign',
        roles: ['admin', 'artist', 'manager', 'label_admin'],
        subscription_tiers: ['pro', 'enterprise'],
        enabled: true,
        requiresUpgrade: true
      },
      {
        id: 'campaigns',
        label: 'Campaigns',
        href: '/analytics/campaigns',
        icon: 'BarChart3',
        roles: ['admin', 'artist', 'manager', 'label_admin'],
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
    roles: ['admin', 'artist', 'manager', 'label_admin'],
    subscription_tiers: ['pro', 'enterprise'],
    enabled: true,
    requiresUpgrade: true,
    children: [
      {
        id: 'payouts',
        label: 'Payouts & Splits',
        href: '/finances/payouts',
        icon: 'CreditCard',
        roles: ['admin', 'artist', 'manager', 'label_admin'],
        subscription_tiers: ['pro', 'enterprise'],
        enabled: true,
        requiresUpgrade: true
      },
      {
        id: 'taxes',
        label: 'Taxes',
        href: '/finances/taxes',
        icon: 'FileText',
        roles: ['admin', 'artist', 'manager', 'label_admin'],
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
    roles: ['admin', 'artist', 'manager', 'label_admin'],
    subscription_tiers: ['free', 'pro', 'enterprise'],
    enabled: true
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: 'Settings',
    roles: ['admin', 'artist', 'manager', 'label_admin'],
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
    console.log('🧭 Navigation recalculating - User details:', {
      hasUser: !!user,
      email: user?.email,
      role: user?.role,
      userMetadataRole: user?.user_metadata?.role,
      timestamp: Date.now()
    });
    
    if (!user) {
      console.log('🧭 Navigation: No user, returning empty array');
      return [];
    }

    // Get user role with priority: user.role > user_metadata.role > default
    const userRole = user.role || (user.user_metadata?.role as string) || 'fan';
    console.log('🧭 Navigation: Determined user role:', userRole);

    // Superadmin gets special navigation
    if (userRole === 'superadmin') {
      console.log('🧭 Navigation: Superadmin navigation');
      return [...SUPERADMIN_NAVIGATION, ...CREATOR_NAVIGATION];
    }

    // Determine which navigation set to use
    const baseNavigation = ['admin', 'artist', 'manager', 'label_admin'].includes(userRole) 
      ? CREATOR_NAVIGATION 
      : FAN_NAVIGATION;

    console.log('🧭 Navigation: Using base navigation set:', 
      baseNavigation === CREATOR_NAVIGATION ? 'CREATOR' : 'FAN', 
      'with', baseNavigation.length, 'items'
    );

    // For demo users, show ALL navigation items regardless of subscription tier
    // This allows them to see the full platform and get upgrade prompts

    const filteredNavigation = baseNavigation.filter(item => {
      const hasRole = item.roles.includes(userRole);
      if (!hasRole) {
        console.log('🧭 Navigation: Filtering out', item.label, 'for role', userRole);
      }
      return hasRole && item.enabled;
    }).map(item => ({
      ...item,
      children: item.children?.filter(child => {
        const hasRole = child.roles.includes(userRole);
        return hasRole && child.enabled;
      })
    }));

    console.log('🧭 Navigation calculated:', {
      totalItems: filteredNavigation.length,
      userRole: userRole,
      items: filteredNavigation.map(item => ({ id: item.id, label: item.label, roles: item.roles }))
    });
    
    return filteredNavigation;
  }, [user]); // Use full user object to trigger re-render on any user change

  return { navigation };
}