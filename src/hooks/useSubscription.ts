import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useWorkspaceStore } from '../stores/workspaceStore';

type SubscriptionTier = 'free' | 'pro' | 'enterprise';

interface FeatureAccess {
  hasAccess: boolean;
  requiredTier?: SubscriptionTier;
  showUpgrade: () => void;
}

interface UpgradeState {
  isOpen: boolean;
  feature: string;
  requiredTier: SubscriptionTier;
  isDemo?: boolean;
}

export function useSubscription() {
  const { user } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();
  const [upgradeModal, setUpgradeModal] = useState<UpgradeState>({
    isOpen: false,
    feature: '',
    requiredTier: 'pro',
    isDemo: false
  });

  const getCurrentTier = (): SubscriptionTier => {
    // Superadmin has access to everything
    if (user?.role === 'superadmin') {
      return 'enterprise';
    }
    
    // For demo users, always show as 'free' to trigger upgrade prompts
    if (user?.email === 'artistdemo@truindee.com') {
      return 'free'; // Keep internal tier as 'free' even though we display as "Starter"
    }
    return currentWorkspace?.subscription_tier || 'free';
  };

  const checkFeatureAccess = (
    requiredTier: SubscriptionTier,
    featureName: string
  ): FeatureAccess => {
    let currentTier = getCurrentTier();
    
    // Superadmin bypasses all restrictions
    if (user?.role === 'superadmin') {
      return {
        hasAccess: true,
        showUpgrade: () => {}
      };
    }

    // Special handling for artist demo
    const isArtistDemo = user?.email === 'artistdemo@truindee.com';
    
    const tierHierarchy: Record<SubscriptionTier, number> = {
      free: 0,
      pro: 1,
      enterprise: 2
    };

    const hasAccess = tierHierarchy[currentTier] >= tierHierarchy[requiredTier];

    // Display names for tiers (for UI only)
    const getTierDisplayName = (tier: SubscriptionTier): string => {
      if (tier === 'free') return 'Starter';
      if (tier === 'pro') return 'Pro Artist';
      if (tier === 'enterprise') return 'Indie Label';
      return tier;
    };
    
    return {
      hasAccess,
      requiredTier: hasAccess ? undefined : requiredTier,
      showUpgrade: () => {
        if (!hasAccess) {
          setUpgradeModal({
            isOpen: true,
            feature: featureName,
            requiredTier,
            // Change the title if it's the artist demo
            isDemo: isArtistDemo
          });
        }
      }
    };
  };

  const closeUpgradeModal = () => {
    setUpgradeModal(prev => ({ ...prev, isOpen: false }));
  };

  // Feature-specific access checks
  const features = {
    // Pro features
    advancedAnalytics: () => checkFeatureAccess('pro', 'Advanced Analytics'),
    releaseScheduling: () => checkFeatureAccess('pro', 'Release Scheduling'),
    membershipTiers: () => checkFeatureAccess('pro', 'Fan Membership Tiers'),
    revenueTracking: () => checkFeatureAccess('pro', 'Revenue Tracking'),
    customBranding: () => checkFeatureAccess('pro', 'Custom Branding'),
    apiAccess: () => checkFeatureAccess('pro', 'API Access'),
    prioritySupport: () => checkFeatureAccess('pro', 'Priority Support'),
    stemAccess: () => checkFeatureAccess('pro', 'Stems & Assets'),
    campaignAnalytics: () => checkFeatureAccess('pro', 'Campaign Analytics'),
    pricingCoupons: () => checkFeatureAccess('pro', 'Pricing & Coupons'),
    payoutSplits: () => checkFeatureAccess('pro', 'Payout & Splits'),

    // Enterprise features
    whiteLabel: () => checkFeatureAccess('enterprise', 'White-label Platform'),
    advancedRBAC: () => checkFeatureAccess('enterprise', 'Advanced RBAC'),
    customIntegrations: () => checkFeatureAccess('enterprise', 'Custom Integrations'),
    dedicatedSupport: () => checkFeatureAccess('enterprise', 'Dedicated Account Manager'),
    slaGuarantees: () => checkFeatureAccess('enterprise', 'SLA Guarantees'),
    taxManagement: () => checkFeatureAccess('enterprise', 'Tax Management'),
    multiWorkspace: () => checkFeatureAccess('enterprise', 'Multi-workspace Management'),

    // Admin features (superadmin only)
    systemManagement: () => checkFeatureAccess('enterprise', 'System Management'),
    userManagement: () => checkFeatureAccess('enterprise', 'User Management'),
    platformAnalytics: () => checkFeatureAccess('enterprise', 'Platform Analytics')
  };

  return {
    currentTier: getCurrentTier(),
    features,
    upgradeModal,
    closeUpgradeModal,
    checkFeatureAccess
  };
}