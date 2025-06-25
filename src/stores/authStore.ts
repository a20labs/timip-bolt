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
  setUser: (user) => set({ user, loading: false }),
  setCurrentWorkspace: (workspaceId) => set({ currentWorkspace: workspaceId }),
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
    set({ user: null, currentWorkspace: null });
  },
  isAccountOwner: () => {
    const { user } = get();
    return user?.user_metadata?.is_account_owner || false;
  },
  getUserRole: () => {
    const { user } = get();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (user as any)?.role || user?.user_metadata?.role || 'fan';
  },
}));

// Initialize auth state safely
const initializeAuth = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    useAuthStore.getState().setUser(session?.user as ExtendedUser ?? null);
  } catch (error) {
    console.error('Auth initialization error:', error);
    useAuthStore.getState().setUser(null);
  }
};

// Initialize auth
initializeAuth();

// Listen for auth changes
try {
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setUser(session?.user as ExtendedUser ?? null);
  });
} catch (error) {
  console.error('Auth state change listener error:', error);
}