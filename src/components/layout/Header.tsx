import { useState } from 'react';
import { Bell, User, Shield, LogOut, Settings, Heart, Phone, Crown } from 'lucide-react';
import { Button } from '../ui/Button';
import { GlobalSearch } from '../search/GlobalSearch';
import { UserModeToggle } from '../ui/UserModeToggle';
import { useAuthStore } from '../../stores/authStore';
import { useDialerStore } from '../../stores/dialerStore';
import { Link, useNavigate } from 'react-router-dom';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';

export function Header() {
  const { user, signOut, isAccountOwner, getUserRole: getStoreUserRole } = useAuthStore();
  const { openDialer } = useDialerStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isFeatureEnabled, useAllFeatureFlags } = useFeatureFlags();
  
  // Subscribe to admin flags to ensure re-render when flags change
  useAllFeatureFlags();
  const phoneFeatureEnabled = isFeatureEnabled('PHONE_DIALER');
  
  const navigate = useNavigate();

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      if (user.email === 'artistdemo@truindee.com') return 'Demo Artist';
      if (user.email === 'fandemo@truindee.com') return 'Demo Fan';
      if (user.email === 'admin@truindee.com') return 'Super Admin';
      return user.email;
    }
    return 'Demo User';
  };

  const getUserRole = () => {
    const storeRole = getStoreUserRole();
    const isOwner = isAccountOwner();
    
    if (isOwner && storeRole === 'admin') return 'Account Owner';
    if (storeRole === 'superadmin') return 'Super Admin';
    if (storeRole === 'admin') return 'Administrator';
    if (storeRole === 'artist') return 'Artist';
    if (storeRole === 'fan') return 'Fan';
    
    // Fallback for legacy logic
    if (user?.role === 'superadmin') return 'Super Admin';
    if (user?.email === 'artistdemo@truindee.com') return 'Artist';
    if (user?.email === 'fandemo@truindee.com') return 'Fan';
    return 'Artist';
  };

  const getUserHandle = () => {
    if (user?.email === 'artistdemo@truindee.com') return 'artist';
    if (user?.email === 'fandemo@truindee.com') return 'fan';
    if (user?.email === 'admin@truindee.com') return 'admin';
    return user?.email?.split('@')[0].toLowerCase() || 'user';
  };

  const isAdmin = user?.role === 'superadmin';

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    // Explicitly navigate to landing page after sign out
    navigate('/', { replace: true });
  };
  
  const handleViewProfile = () => {
    const handle = getUserHandle();
    navigate(`/u/${handle}`);
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <GlobalSearch />
        
        <div className="flex items-center gap-4">
          <UserModeToggle />
          {phoneFeatureEnabled && (
            <Button variant="ghost" size="sm" onClick={() => openDialer()}>
              <Phone className="w-5 h-5" />
            </Button>
          )}
          <Button variant="ghost" size="sm">
            <Bell className="w-5 h-5" />
          </Button>
          
          <div className="relative">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center relative ${
                isAdmin 
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
                  : isAccountOwner()
                  ? 'bg-gradient-to-br from-amber-600 to-amber-700'
                  : 'bg-primary-600'
              }`}>
                {isAdmin ? (
                  <Shield className="w-4 h-4 text-white" />
                ) : isAccountOwner() ? (
                  <Crown className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  {getUserDisplayName()}
                  {isAdmin && (
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs rounded-full">
                      ADMIN
                    </span>
                  )}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {getUserRole()}
                </p>
              </div>
            </div>
            
            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white">{getUserDisplayName()}</p>
                    {isAccountOwner() && (
                      <Crown className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{getUserHandle()}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{getUserRole()}</p>
                </div>
                
                <button 
                  onClick={handleViewProfile}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  View Profile
                </button>
                
                <Link 
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                
                <Link 
                  to="/community"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  Following
                </Link>
                
                <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
            
            {/* Overlay to close dropdown when clicking outside */}
            {showUserMenu && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}