import { Crown, Shield, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Card } from '../ui/Card';

export function UserStatusDisplay() {
  const { user, isAccountOwner, getUserRole } = useAuthStore();

  if (!user) {
    return null;
  }

  const role = getUserRole();
  const isOwner = isAccountOwner();

  const getRoleIcon = () => {
    if (isOwner) return <Crown className="w-5 h-5 text-amber-400" />;
    if (role === 'admin' || role === 'superadmin') return <Shield className="w-5 h-5 text-blue-400" />;
    return <User className="w-5 h-5 text-gray-400" />;
  };

  const getRoleLabel = () => {
    if (isOwner && role === 'admin') return 'Account Owner';
    if (role === 'superadmin') return 'Super Admin';
    if (role === 'admin') return 'Administrator';
    if (role === 'artist') return 'Artist';
    if (role === 'fan') return 'Fan';
    return 'User';
  };

  const getRoleDescription = () => {
    if (isOwner) return 'Has full control over this account and all workspaces';
    if (role === 'superadmin') return 'System administrator with global access';
    if (role === 'admin') return 'Can manage workspace settings and users';
    if (role === 'artist') return 'Can create and manage music content';
    if (role === 'fan') return 'Can discover and interact with music content';
    return 'Basic user access';
  };

  return (
    <Card className="p-4 bg-white/5 border-white/10">
      <div className="flex items-start gap-3">
        {getRoleIcon()}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-medium">
              {user.user_metadata?.full_name || user.email}
            </h3>
            <span className="text-xs px-2 py-1 bg-primary-500/20 text-primary-300 rounded-full">
              {getRoleLabel()}
            </span>
          </div>
          <p className="text-sm text-gray-300 mb-2">
            {user.email}
          </p>
          <p className="text-xs text-gray-400">
            {getRoleDescription()}
          </p>
          {isOwner && (
            <div className="mt-2 flex items-center gap-1 text-xs text-amber-300">
              <Crown className="w-3 h-3" />
              First user of this account
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
