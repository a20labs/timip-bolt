import React from 'react';
import { motion } from 'framer-motion';
import { Crown, X, Check, Zap } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  requiredTier: 'pro' | 'enterprise';
  isDemo?: boolean;
}

const TIER_FEATURES = {
  pro: [
    'Advanced analytics & reporting',
    'Unlimited track uploads',
    'Release planning tools',
    'Fan membership tiers',
    'Revenue tracking',
    'Priority support',
    'Custom branding',
    'API access'
  ],
  enterprise: [
    'Everything in Pro Plan',
    'White-label platform',
    'Advanced RBAC',
    'Custom integrations',
    'Dedicated account manager',
    'SLA guarantees',
    'Advanced compliance tools',
    'Multi-workspace management'
  ],
  'indie label': [
    'Everything in Pro Plan',
    'White-label platform',
    'Custom integrations',
    'Dedicated account manager',
    'SLA guarantees',
    'Advanced compliance tools',
    'Multi-workspace management'
  ]
};

const TIER_PRICING = {
  pro: { monthly: 59.99, yearly: 575.90 },
  enterprise: { monthly: 249.99, yearly: 2399.90 }
};

export function UpgradeModal({ isOpen, onClose, feature, requiredTier, isDemo = false }: UpgradeModalProps) {
  if (!isOpen) return null;

  // Convert requiredTier to lowercase for mapping
  const tierKey = requiredTier.toLowerCase() as keyof typeof TIER_FEATURES;
  const features = TIER_FEATURES[tierKey];
  const pricing = TIER_PRICING[requiredTier];
  
  // Get display name for tier
  let displayTier: string;
  if (requiredTier === 'enterprise') {
    displayTier = 'Indie Label';
  } else if (requiredTier === 'pro') {
    displayTier = 'Pro Artist';
  } else {
    displayTier = requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isDemo ? 'Choose Your Plan' : `Upgrade to ${displayTier}`}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isDemo ? 'Sign up for full access to all TruIndee features' : `Unlock "${feature}" and more powerful features`}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="p-4 border-2 border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Monthly</h3>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  ${pricing.monthly}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">per month</p>
              </div>
            </Card>
            
            <Card className="p-4 border-2 border-primary-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                Save 17%
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Yearly</h3>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  ${Math.round(pricing.yearly / 12)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  per month (${pricing.yearly}/year)
                </p>
              </div>
            </Card>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              What's included:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button className="w-full" size="lg">
              {isDemo ? (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  Sign Up Now
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Start {displayTier} Plan
                </>
              )}
            </Button>
            {!isDemo && (
              <Button variant="outline" className="w-full" onClick={onClose}>
                Continue with Free Plan
              </Button>
            )}
          </div>

          {/* Trust indicators */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <span>✓ 14-day free trial</span>
              <span>✓ Cancel anytime</span>
              <span>✓ No setup fees</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}