import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { supabase } from '../lib/supabase';

type SubscriptionTier = 'free' | 'trial' | 'pro' | 'enterprise';

interface FeatureAccess {
  hasAccess: boolean;
  requiredTier?: SubscriptionTier;
  showUpgrade: () => void;
  isTrialExpired?: boolean;
}

interface UpgradeState {
  isOpen: boolean;
  feature: string;
  requiredTier: SubscriptionTier;
  isDemo?: boolean;
}

interface StripeSubscription {
  customer_id: string;
  subscription_id: string;
  subscription_status: string;
  price_id: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  payment_method_brand?: string;
  payment_method_last4?: string;
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
  const [stripeSubscription, setStripeSubscription] = useState<StripeSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Map Stripe price IDs to subscription tiers
  const PRICE_ID_TO_TIER: Record<string, SubscriptionTier> = {
    'price_1RdyvG4fVYS0vpWMUUyTvf9q': 'trial',      // Starter plan (14-day trial then $19.99/mo)
    'price_1Rdyc84fVYS0vpWMPcMIkqbP': 'pro',        // Pro Artist plan
    'price_1RdyfT4fVYS0vpWMgeGm7yJQ': 'enterprise'  // Indie Label plan
  };

  // Fetch real subscription data from Stripe
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Try to fetch from Supabase, but handle mock client gracefully
        const result = await supabase
          .from('stripe_user_subscriptions')
          .select('*');

        // Handle both real Supabase response and mock client response
        if (result.error) {
          console.log('No subscription data found:', result.error.message);
          setStripeSubscription(null);
        } else if (result.data && result.data.length > 0) {
          setStripeSubscription(result.data[0]);
        } else {
          setStripeSubscription(null);
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setStripeSubscription(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [user?.id]);

  const getCurrentTier = (): SubscriptionTier => {
    // Superadmin has access to everything
    if (user?.role === 'superadmin') {
      return 'enterprise';
    }
    
    // For demo users, always show as 'free' to trigger upgrade prompts
    if (user?.email === 'artistdemo@truindee.com') {
      return 'free';
    }

    // Check real Stripe subscription data
    if (stripeSubscription?.subscription_status === 'active' && stripeSubscription?.price_id) {
      const tier = PRICE_ID_TO_TIER[stripeSubscription.price_id];
      if (tier) {
        return tier;
      }
    }

    // Check if user is in trial period (check if subscription exists but is in trial)
    if (stripeSubscription?.subscription_status === 'trialing') {
      return 'trial';
    }

    // Fall back to workspace subscription_tier (for backwards compatibility)
    // But only use if we don't have Stripe data
    if (!stripeSubscription && currentWorkspace?.subscription_tier) {
      // Map old tier names to new ones
      if (currentWorkspace.subscription_tier === 'free') {
        return 'free';
      }
      return currentWorkspace.subscription_tier as SubscriptionTier;
    }

    // Default to free tier
    return 'free';
  };

  const isTrialExpired = (): boolean => {
    if (!stripeSubscription) return false;
    
    // Check if subscription was trialing but is now past_due or canceled
    if (stripeSubscription.subscription_status === 'past_due' || 
        stripeSubscription.subscription_status === 'canceled') {
      return true;
    }
    
    return false;
  };

  const checkFeatureAccess = (
    requiredTier: SubscriptionTier,
    featureName: string
  ): FeatureAccess => {
    const currentTier = getCurrentTier();
    const trialExpired = isTrialExpired();
    
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
      trial: 1, // Trial has more access than free but less than paid plans
      pro: 2,
      enterprise: 3
    };

    // If trial is expired, treat as free tier
    const effectiveTier = trialExpired ? 'free' : currentTier;
    const hasAccess = tierHierarchy[effectiveTier] >= tierHierarchy[requiredTier];
    
    return {
      hasAccess,
      requiredTier: hasAccess ? undefined : requiredTier,
      isTrialExpired: trialExpired,
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
    isTrialExpired: isTrialExpired(),
    features,
    upgradeModal,
    closeUpgradeModal,
    checkFeatureAccess,
    stripeSubscription,
    isLoading
  };
}