import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Music, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Settings,
  CheckCircle,
  Disc3,
  Search,
  Heart,
  Library,
  Store,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Crown,
  Bot
} from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuthStore } from '../../stores/authStore';
import { UpgradeModal } from '../ui/UpgradeModal';
import { NavigationItem } from '../../types/database';

const iconMap = {
  Home,
  Music,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  CheckCircle,
  Disc3,
  Search,
  Heart,
  Library,
  Store,
  DollarSign,
  Bot
};

export function Sidebar() {
  const location = useLocation();
  const { navigation } = useNavigation();
  const { user } = useAuthStore();
  const { currentTier, checkFeatureAccess, upgradeModal, closeUpgradeModal } = useSubscription();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  
  // Force re-render when user changes by resetting expanded items
  React.useEffect(() => {
    setExpandedItems([]);
  }, [user?.id, user?.email]);
  
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const isExpanded = (itemId: string) => expandedItems.includes(itemId);

  const getUserRole = () => {
    // If email is artistdemo@truindee.com, return 'artist'
    if (user?.email === 'artistdemo@truindee.com' || user?.role === 'artist') return 'artist';
    if (user?.email === 'fandemo@truindee.com') return 'fan';
    
    // Check user.role first, then try user_metadata.role, fallback to 'artist'
    return user?.role || (user?.user_metadata?.role as string) || 'artist';
  };

  const handleNavClick = (item: NavigationItem, e: React.MouseEvent) => {
    // Skip any validation for artistdemo@truindee.com
    if (user?.email === 'artistdemo@truindee.com') {
      return;
    }
    
    // For other users, check if this item requires an upgrade
    if (item.requiresUpgrade && currentTier === 'free') {
      e.preventDefault();
      
      // Determine required tier based on subscription_tiers
      const requiredTier = item.subscription_tiers.includes('pro') ? 'pro' : 'enterprise';
      const featureAccess = checkFeatureAccess(requiredTier as 'pro' | 'enterprise', item.label);
      featureAccess.showUpgrade();
    }
  };

  const getItemClassName = (item: NavigationItem, active: boolean) => {
    const baseClasses = `
      flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
      ${active
        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }
    `;

    // Add visual indicator for upgrade-required items
    if (item.requiresUpgrade && currentTier === 'free') {
      return `${baseClasses} relative`;
    }

    return baseClasses;
  };

  return (
    <>
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto">
        <div className="p-4 flex justify-center">
          <div className="w-full flex items-center justify-center">
            <img 
              src="/TruIndee-Horz-Logo.png" 
              alt="TruIndee Logo" 
              className="w-48"
            />
          </div>
        </div>
         <nav className="px-3 space-y-1">
          {navigation.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap] || Home;
            const active = isActive(item.href);
            const hasChildren = item.children && item.children.length > 0;
            const expanded = isExpanded(item.id);

            return (
              <div key={item.id}>
                <div
                  className={getItemClassName(item, active)}
                  onClick={(e) => {
                    if (hasChildren) {
                      toggleExpanded(item.id);
                    } else {
                      handleNavClick(item, e);
                    }
                  }}
                >
                  {hasChildren ? (
                    <>
                      <Icon className="w-5 h-5" />
                      <span className="flex-1">{item.label}</span>
                      {item.requiresUpgrade && currentTier === 'free' && (
                        <Crown className="w-4 h-4 text-amber-500" />
                      )}
                      {expanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </>
                  ) : (
                    <Link 
                      to={item.href} 
                      className="flex items-center gap-3 w-full"
                      onClick={(e) => handleNavClick(item, e)}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1">{item.label}</span>
                      {item.requiresUpgrade && currentTier === 'free' && (
                        <Crown className="w-4 h-4 text-amber-500" />
                      )}
                      {active && (
                        <motion.div
                          layoutId="activeTab"
                          className="w-2 h-2 bg-primary-600 rounded-full"
                        />
                      )}
                    </Link>
                  )}
                </div>

                {/* Submenu */}
                {hasChildren && expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-6 mt-1 space-y-1"
                  >
                    {item.children?.map((child) => {
                      const ChildIcon = iconMap[child.icon as keyof typeof iconMap] || Home;
                      const childActive = isActive(child.href);

                      return (
                        <Link
                          key={child.id}
                          to={child.href}
                          onClick={(e) => handleNavClick(child, e)}
                          className={`
                            flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 relative
                            ${childActive
                              ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }
                          `}
                        >
                          <ChildIcon className="w-4 h-4" />
                          <span className="flex-1">{child.label}</span>
                          {child.requiresUpgrade && currentTier === 'free' && (
                            <Crown className="w-3 h-3 text-amber-500" />
                          )}
                          {childActive && (
                            <motion.div
                              layoutId="activeSubTab"
                              className="w-1.5 h-1.5 bg-primary-600 rounded-full"
                            />
                          )}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Subscription Tier Badge */}
        <div className="p-3 mt-6">
          <div className={`rounded-lg p-3 text-white text-center ${
            currentTier === 'free' 
              ? 'bg-gradient-to-r from-gray-500 to-gray-600' 
              : 'bg-gradient-to-r from-primary-500 to-secondary-500'
          }`}>
            <p className="text-xs font-medium">
              {currentTier === 'free' ? 'STARTER' : 
               currentTier === 'pro' ? 'PRO ARTIST' :
               currentTier === 'enterprise' ? 'INDIE LABEL' : 
               String(currentTier || 'STARTER').toUpperCase()} PLAN
            </p>
            <p className="text-xs opacity-80 mt-1">
              {currentTier === 'free' 
                ? 'Upgrade for full features' 
                : getUserRole() === 'fan' 
                  ? 'Unlimited streaming' 
                  : 'Full features unlocked'
              }
            </p>
            {currentTier === 'free' && (
              <button 
                onClick={() => {
                  const featureAccess = checkFeatureAccess('pro', 'Pro Features');
                  featureAccess.showUpgrade();
                }}
                className="mt-2 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
              >
                Upgrade Now
              </button>
            )}
          </div>
        </div>
        {/* Powered by Badge */}
        <div className="p-3 mt-2 flex justify-center">
          <a href="https://bolt.new/" target="_blank" rel="noopener noreferrer">
            <img 
              src="/logotext_poweredby_360w.png" 
              alt="Powered by" 
              className="w-36 opacity-70 hover:opacity-100 transition-opacity"
            />
          </a>
        </div>

      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={closeUpgradeModal}
        feature={upgradeModal.feature}
        requiredTier={upgradeModal.requiredTier === 'free' ? 'pro' : upgradeModal.requiredTier as 'pro' | 'enterprise'}
      />
    </>
  );
}