import { motion } from 'framer-motion';
import { Crown, Zap, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { useSubscription } from '../../hooks/useSubscription';
import { useStripe } from '../../hooks/useStripe';
import { useAuthStore } from '../../stores/authStore';

export function SubscriptionBanner() {
  const { currentTier, features } = useSubscription();
  const { createCheckoutSession, isLoading } = useStripe();
  const { user } = useAuthStore();
  
  // Skip for demo users
  if (user?.email === 'artistdemo@truindee.com' || user?.email === 'fandemo@truindee.com') {
    return null;
  }

  // Don't show for enterprise users
  if (currentTier === 'enterprise') {
    return null;
  }

  // Get user role to determine upgrade path
  const getUserRole = () => {
    if (user?.email === 'artistdemo@truindee.com') return 'artist';
    if (user?.email === 'fandemo@truindee.com') return 'fan';
    return user?.role || 'artist';
  };

  const userRole = getUserRole();
  const isArtist = userRole === 'artist';

  // For free tier users, show upgrade options
  if (currentTier === 'free') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-4 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-primary-200 dark:border-primary-900 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Crown className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                {isArtist ? 'Upgrade Your Artist Plan' : 'Upgrade to Pro'}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {isArtist 
                  ? 'Choose Pro Artist for unlimited tracks and analytics, or Indee Label for white-label features.'
                  : 'Unlock advanced features and priority support.'
                }
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  onClick={() => createCheckoutSession('price_1Rdyc84fVYS0vpWMPcMIkqbP')}
                  loading={isLoading}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isArtist ? 'Pro Artist' : 'Upgrade Now'}
                </Button>
                {isArtist && (
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => createCheckoutSession('price_1RdyfT4fVYS0vpWMgeGm7yJQ')}
                    loading={isLoading}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Indee Label
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // For pro tier users, show confirmation and option to upgrade to enterprise (for artists)
  if (currentTier === 'pro') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-900 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                Pro {isArtist ? 'Artist' : ''} Plan Active
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                You have access to all Pro features including unlimited tracks, advanced analytics, and full AI team access.
              </p>
              {isArtist && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                  Want white-label features? Upgrade to Indee Label for custom branding and integrations.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => features.apiAccess().showUpgrade()}
              >
                <Crown className="w-4 h-4 mr-2" />
                Manage Plan
              </Button>
              {isArtist && (
                <Button 
                  size="sm"
                  onClick={() => createCheckoutSession('price_1RdyfT4fVYS0vpWMgeGm7yJQ')}
                  loading={isLoading}
                >
                  Upgrade to Indee Label
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return null;
}

export default SubscriptionBanner;