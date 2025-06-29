import { useAuthStore } from '../stores/authStore';

export interface ConversionData {
  artistName: string;
  bio?: string;
  genres?: string[];
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    spotify?: string;
    soundcloud?: string;
  };
}

interface UserLike {
  id: string;
  email?: string;
  role?: string;
  user_metadata?: {
    role?: string;
    capabilities?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export const fanToArtistService = {
  /**
   * Convert a fan account to an artist account
   */
  async convertToArtist(conversionData: ConversionData) {
    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        throw new Error('User must be authenticated to convert account');
      }

      // Check if user is already an artist
      if (user.role === 'artist' || user.user_metadata?.role === 'artist') {
        throw new Error('User is already an artist');
      }

      console.log('🎭 Converting fan to artist:', user.email);

      // Create artist profile
      const artistProfile = {
        user_id: user.id,
        artist_name: conversionData.artistName,
        bio: conversionData.bio || '',
        genres: conversionData.genres || [],
        social_links: conversionData.socialLinks || {},
        conversion_date: new Date().toISOString(),
        is_converted_fan: true,
      };

      // Create workspace for the artist
      const workspace = {
        name: `${conversionData.artistName}'s Studio`,
        slug: conversionData.artistName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        owner_id: user.id,
        workspace_type: 'artist',
        created_at: new Date().toISOString(),
      };

      // Update user role while preserving fan capabilities
      const updatedUser = {
        ...user,
        role: 'artist',
        user_metadata: {
          ...user.user_metadata,
          role: 'artist',
          capabilities: ['fan', 'artist'], // Dual capabilities
          artist_profile_id: `artist_${Date.now()}`,
          workspace_id: `workspace_${Date.now()}`,
          converted_from_fan: true,
          conversion_date: new Date().toISOString(),
        },
      };

      // Update auth store with new user data
      useAuthStore.getState().setUser(updatedUser);

      console.log('🎭 Conversion successful:', {
        email: user.email,
        newRole: 'artist',
        capabilities: ['fan', 'artist'],
        artistName: conversionData.artistName,
      });

      return {
        success: true,
        artistProfile,
        workspace,
        updatedUser,
      };
    } catch (error) {
      console.error('🎭 Conversion error:', error);
      throw error;
    }
  },

  /**
   * Check if user can convert to artist
   */
  canConvertToArtist(user: UserLike | null): boolean {
    if (!user) return false;
    
    const currentRole = user.role || user.user_metadata?.role;
    const capabilities = user.user_metadata?.capabilities || [];
    
    // Can convert if they're a fan and don't already have artist capabilities
    return currentRole === 'fan' && !capabilities.includes('artist');
  },

  /**
   * Check if user has dual capabilities (converted artist)
   */
  isDualModeUser(user: UserLike | null): boolean {
    if (!user) return false;
    
    const capabilities = user.user_metadata?.capabilities || [];
    return capabilities.includes('fan') && capabilities.includes('artist');
  },

  /**
   * Get user's available modes
   */
  getAvailableModes(user: UserLike | null): ('fan' | 'artist')[] {
    if (!user) return [];
    
    const capabilities = user.user_metadata?.capabilities || [];
    const currentRole = user.role || user.user_metadata?.role;
    
    // If they have explicit capabilities, use those
    if (capabilities.length > 0) {
      return capabilities.filter((cap: string) => cap === 'fan' || cap === 'artist');
    }
    
    // Otherwise, use their current role
    return [currentRole === 'artist' ? 'artist' : 'fan'];
  },

  /**
   * Switch between fan and artist modes (for converted users)
   */
  switchMode(mode: 'fan' | 'artist') {
    const { user } = useAuthStore.getState();
    if (!user || !this.isDualModeUser(user)) {
      console.warn('🎭 User cannot switch modes');
      return;
    }

    // Store current mode in localStorage for UI state
    localStorage.setItem('userMode', mode);
    
    // Dispatch event for components to react to mode change
    window.dispatchEvent(new CustomEvent('userModeChanged', { 
      detail: { mode, user } 
    }));

    console.log('🎭 Switched to mode:', mode);
  },

  /**
   * Get current user mode
   */
  getCurrentMode(): 'fan' | 'artist' {
    const { user } = useAuthStore.getState();
    if (!user) return 'fan';

    // For dual-mode users, check localStorage preference
    if (this.isDualModeUser(user)) {
      const savedMode = localStorage.getItem('userMode') as 'fan' | 'artist';
      return savedMode || 'artist'; // Default to artist for converted users
    }

    // For single-mode users, use their role
    const role = user.role || user.user_metadata?.role;
    return role === 'artist' ? 'artist' : 'fan';
  },
};
