import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface ExtendedUserMetadata {
  full_name?: string;
  is_account_owner?: boolean;
  workspace_id?: string | null;
  [key: string]: unknown;
}

interface ExtendedUser extends Omit<User, 'user_metadata'> {
  user_metadata: ExtendedUserMetadata;
}

interface AuthState {
  user: ExtendedUser | null;
  loading: boolean;
  currentWorkspace: string | null;
  authTimestamp: number; // Add timestamp to force re-renders
  setUser: (user: ExtendedUser | null) => void;
  setCurrentWorkspace: (workspaceId: string) => void;
  signOut: () => Promise<void>;
  isAccountOwner: () => boolean;
  getUserRole: () => string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  currentWorkspace: null,
  authTimestamp: 0, // Initialize timestamp
  setUser: (user) => {
    set({ user, loading: false, authTimestamp: Date.now() });
  },
  setCurrentWorkspace: (workspaceId) => set({ currentWorkspace: workspaceId }),
  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
    set({ user: null, currentWorkspace: null, authTimestamp: Date.now() });
  },
  isAccountOwner: () => {
    const { user } = get();
    return user?.user_metadata?.is_account_owner || false;
  },
  getUserRole: () => {
    const { user } = get();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (user as any)?.role || user?.user_metadata?.role || 'artist';
  },
}));

// Initialize auth state safely
const initializeAuth = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const user = session.user as ExtendedUser;
      
      // If user doesn't have a role, assign default role
      if (!user.role && !user.user_metadata?.role) {
        console.log('🔐 AuthStore: Existing user without role, assigning default');
        
        const enhancedUser = {
          ...user,
          role: 'artist',
          user_metadata: {
            ...user.user_metadata,
            role: 'artist'
          }
        };
        
        useAuthStore.getState().setUser(enhancedUser);
      } else {
        useAuthStore.getState().setUser(user);
      }
    } else {
      useAuthStore.getState().setUser(null);
    }
  } catch (error) {
    console.error('🔐 AuthStore: Auth initialization error:', error);
    useAuthStore.getState().setUser(null);
  }
};

// Initialize auth
initializeAuth();

// Listen for auth changes
try {
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔐 AuthStore: Auth state change event:', event);
    
    if (session?.user) {
      const user = session.user as ExtendedUser;
      
      // If user doesn't have a role, try to assign one based on email or default to artist
      if (!user.role && !user.user_metadata?.role) {
        console.log('🔐 AuthStore: New user detected, assigning default role');
        
        // Create an enhanced user object with default role
        const enhancedUser = {
          ...user,
          role: 'artist', // Default new users to artist
          user_metadata: {
            ...user.user_metadata,
            role: 'artist'
          }
        };
        
        useAuthStore.getState().setUser(enhancedUser);
      } else {
        useAuthStore.getState().setUser(user);
      }
    } else {
      useAuthStore.getState().setUser(null);
    }
  });
} catch (error) {
  console.error('🔐 AuthStore: Auth state change listener error:', error);
}