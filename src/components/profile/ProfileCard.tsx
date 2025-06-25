import { Link } from 'react-router-dom';
import { User, Heart, Music, Shield } from 'lucide-react';
import { Card } from '../ui/Card';
import { FollowButton } from './FollowButton';

interface ProfileCardProps {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  role: 'ARTIST' | 'FAN' | 'EDU' | 'ADMIN';
  isFollowing: boolean;
  followersCount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProfileCard({
  id,
  handle,
  displayName,
  avatarUrl,
  bio,
  role,
  isFollowing,
  followersCount,
  className = '',
  size = 'md'
}: ProfileCardProps) {
  const sizeClasses = {
    sm: {
      card: 'p-3',
      avatar: 'w-10 h-10',
      name: 'text-sm',
      bio: 'text-xs line-clamp-2',
    },
    md: {
      card: 'p-4',
      avatar: 'w-14 h-14',
      name: 'text-base',
      bio: 'text-sm line-clamp-2',
    },
    lg: {
      card: 'p-6',
      avatar: 'w-20 h-20',
      name: 'text-lg',
      bio: 'text-base line-clamp-3',
    },
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'ARTIST':
        return (
          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        );
      case 'ADMIN':
        return (
          <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield className="w-2 h-2 text-white" />
          </div>
        );
      default:
        return null;
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'ARTIST':
        return <Music className="w-3 h-3" />;
      case 'ADMIN':
        return <Shield className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  return (
    <Card className={`${sizeClasses[size].card} ${className}`} hover>
      <div className="flex gap-3">
        <Link to={`/u/${handle}`} className={`${sizeClasses[size].avatar} rounded-full overflow-hidden flex-shrink-0`}>
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
              <User className="w-1/2 h-1/2 text-primary-500" />
            </div>
          )}
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link 
              to={`/u/${handle}`} 
              className={`${sizeClasses[size].name} font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 truncate`}
            >
              {displayName}
            </Link>
            {getRoleBadge()}
          </div>
          
          <Link to={`/u/${handle}`} className="text-gray-500 dark:text-gray-400 text-sm block mb-2">
            @{handle}
          </Link>
          
          {bio && (
            <p className={`${sizeClasses[size].bio} text-gray-600 dark:text-gray-400 mb-3`}>
              {bio}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{followersCount}</span>
              </div>
              <div className="flex items-center gap-1">
                {getRoleIcon()}
                <span>{role}</span>
              </div>
            </div>
            
            <FollowButton 
              profileId={id}
              isFollowing={isFollowing}
              size="sm"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}