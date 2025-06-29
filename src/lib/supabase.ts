import { createClient } from '@supabase/supabase-js';

// For demo purposes, we'll use a mock client when no real credentials are provided
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have real Supabase credentials
const hasRealCredentials = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key';

// Create either a real Supabase client or a mock one
export const supabase = hasRealCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabaseClient();

// Mock Supabase client for demo purposes
function createMockSupabaseClient() {
  // Mock data for lexicon schema tables
  const mockCategories = [
    { id: '1', name: 'Electronic', active: true, sort_order: 1 },
    { id: '2', name: 'Rock', active: true, sort_order: 2 },
    { id: '3', name: 'Pop', active: true, sort_order: 3 },
    { id: '4', name: 'Hip Hop', active: true, sort_order: 4 },
    { id: '5', name: 'Jazz', active: true, sort_order: 5 }
  ];

  // Mock data for Stripe subscriptions (for testing subscription logic)
  const mockStripeSubscriptions = [
    {
      customer_id: 'cus_demo123',
      subscription_id: 'sub_demo123',
      subscription_status: 'active',
      price_id: 'price_1Rdyc84fVYS0vpWMPcMIkqbP', // Pro Artist plan
      current_period_start: Math.floor(Date.now() / 1000) - 86400 * 15, // 15 days ago
      current_period_end: Math.floor(Date.now() / 1000) + 86400 * 15, // 15 days from now
      cancel_at_period_end: false,
      payment_method_brand: 'visa',
      payment_method_last4: '4242'
    }
  ];

  const mockGenres = [
    { id: '1', category_id: '1', name: 'House', active: true, sort_order: 1 },
    { id: '2', category_id: '1', name: 'Techno', active: true, sort_order: 2 },
    { id: '3', category_id: '2', name: 'Alternative Rock', active: true, sort_order: 1 },
    { id: '4', category_id: '3', name: 'Pop Rock', active: true, sort_order: 1 }
  ];

  const mockMoods = [
    { id: '1', name: 'Energetic', active: true, sort_order: 1 },
    { id: '2', name: 'Relaxed', active: true, sort_order: 2 },
    { id: '3', name: 'Melancholic', active: true, sort_order: 3 },
    { id: '4', name: 'Uplifting', active: true, sort_order: 4 }
  ];

  // Mock data for feature flags
  const mockFeatureFlags = [
    {
      id: 'phone-feature-flag',
      workspace_id: null,
      name: 'PHONE_DIALER',
      description: 'Enable phone calling features with AI agents',
      enabled: true,
      rollout_percentage: 100,
      target_roles: ['artist', 'manager', 'label_admin'],
      target_users: [],
      metadata: {},
      created_by: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'ai-chat-feature',
      workspace_id: null,
      name: 'AI_CHAT_ENHANCED',
      description: 'Enhanced AI chat capabilities with advanced models',
      enabled: false,
      rollout_percentage: 50,
      target_roles: ['manager', 'label_admin'],
      target_users: [],
      metadata: {},
      created_by: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Type for mock data items
  type MockDataItem = Record<string, unknown>;

  const createMockQueryBuilder = (data: MockDataItem[]) => {
    const builder = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      select: (_columns?: string) => builder,
      insert: (values: MockDataItem | MockDataItem[]) => ({ 
        data: Array.isArray(values) ? values : [values], 
        error: null,
        eq: builder.eq
      }),
      update: (values: Partial<MockDataItem>) => ({
        data: data.map(item => ({ ...item, ...values })), 
        error: null,
        eq: builder.eq
      }),
      delete: () => ({ 
        data: [], 
        error: null,
        eq: builder.eq
      }),
      eq: (column: string, value: unknown) => ({
        select: () => ({
          data: data.filter((item) => item[column] === value),
          error: null
        }),
        update: (updateValues: Partial<MockDataItem>) => ({
          data: data.filter((item) => item[column] === value).map(item => ({ ...item, ...updateValues })),
          error: null
        }),
        delete: () => ({
          data: data.filter((item) => item[column] !== value),
          error: null
        }),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        order: (_orderColumn?: string) => ({
          data: data.filter((item) => item[column] === value),
          error: null
        }),
        data: data.filter((item) => item[column] === value),
        error: null
      }),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      order: (_orderColumn?: string) => ({
        data: data,
        error: null
      }),
      data: data,
      error: null
    };

    return builder;
  };

  return {
    auth: {
      signInWithOtp: async () => ({ 
        data: { user: null, session: null }, 
        error: null 
      }),
      signInWithPassword: async ({ email }: { email: string; password?: string }) => {
        // For demo purposes, mock a successful sign in
        const mockUser = {
          id: `user-${Date.now()}`,
          email,
          role: email === 'artistdemo@truindee.com' ? 'artist' : 
                email === 'fandemo@truindee.com' ? 'fan' : 
                'artist',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_metadata: {
            full_name: email.split('@')[0].replace(/([a-z])([A-Z])/g, '$1 $2'),
            is_account_owner: true
          },
          app_metadata: {},
        };
        
        return { data: { user: mockUser, session: { user: mockUser } }, error: null };
      },
      signInWithOAuth: async ({ provider, options }: { provider: string; options?: { redirectTo?: string; queryParams?: Record<string, unknown> } }) => {
        // For demo purposes, simulate OAuth flow
        console.log(`🔐 Mock OAuth - Provider: ${provider}, RedirectTo: ${options?.redirectTo}`);
        
        // Create mock user data
        const mockUser = {
          id: `user-${provider}-${Date.now()}`,
          email: `demo@${provider}.com`,
          role: 'artist',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_metadata: {
            full_name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
            is_account_owner: true,
            provider
          },
          app_metadata: {
            provider,
            providers: [provider]
          },
        };
        
        // Instead of redirecting, store the mock session and return a success URL
        // This simulates the OAuth provider redirecting back to our callback
        const redirectUrl = options?.redirectTo || `${window.location.origin}/auth/callback`;
        const callbackUrl = `${redirectUrl}?provider=${provider}&access_token=mock_token_${Date.now()}&refresh_token=mock_refresh_${Date.now()}`;
        
        // Store mock session data temporarily
        sessionStorage.setItem('mock_oauth_user', JSON.stringify(mockUser));
        sessionStorage.setItem('mock_oauth_session', JSON.stringify({
          access_token: `mock_token_${Date.now()}`,
          refresh_token: `mock_refresh_${Date.now()}`,
          user: mockUser,
          expires_in: 3600,
          token_type: 'bearer'
        }));
        
        return { 
          data: { 
            url: callbackUrl,
            provider: provider
          }, 
          error: null 
        };
      },
      signUp: async ({ email, options }: { email: string; password?: string; options?: { data?: Record<string, unknown> } }) => {
        // For demo purposes, mock a successful sign up
        const mockUser = {
          id: `user-${Date.now()}`,
          email,
          role: 'artist',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_metadata: options?.data || {},
          app_metadata: {},
        };
        
        return { data: { user: mockUser, session: { user: mockUser } }, error: null };
      },
      signOut: async () => ({ error: null }),
      getSession: async () => {
        // Check for mock OAuth session first
        const mockSession = sessionStorage.getItem('mock_oauth_session');
        if (mockSession) {
          const session = JSON.parse(mockSession);
          // Clear the temporary session after retrieving it
          sessionStorage.removeItem('mock_oauth_session');
          sessionStorage.removeItem('mock_oauth_user');
          return { 
            data: { session },
            error: null 
          };
        }
        
        return { 
          data: { session: null },
          error: null 
        };
      },
      onAuthStateChange: () => ({ 
        data: { subscription: null } 
      }),
    },
    from: (table: string, options?: { schema?: string }) => {
      // Handle lexicon schema tables
      if (options?.schema === 'lexicon') {
        switch (table) {
          case 'categories':
            return createMockQueryBuilder(mockCategories);
          case 'genres':
            return createMockQueryBuilder(mockGenres);
          case 'moods':
            return createMockQueryBuilder(mockMoods);
          default:
            return createMockQueryBuilder([]);
        }
      }

      // Handle feature flags table
      if (table === 'feature_flags') {
        return createMockQueryBuilder(mockFeatureFlags);
      }

      // Handle Stripe subscription data
      if (table === 'stripe_user_subscriptions') {
        return createMockQueryBuilder(mockStripeSubscriptions);
      }

      // Handle public schema tables (default behavior)
      return createMockQueryBuilder([]);
    },
  };
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          compliance_status: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          compliance_status?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          compliance_status?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      tracks: {
        Row: {
          id: string;
          workspace_id: string;
          title: string;
          artist: string;
          duration: number;
          file_url: string;
          isrc: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          title: string;
          artist: string;
          duration: number;
          file_url: string;
          isrc?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          title?: string;
          artist?: string;
          duration?: number;
          file_url?: string;
          isrc?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      releases: {
        Row: {
          id: string;
          workspace_id: string;
          title: string;
          artist: string;
          release_date: string;
          upc: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          title: string;
          artist: string;
          release_date: string;
          upc?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          title?: string;
          artist?: string;
          release_date?: string;
          upc?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      feature_flags: {
        Row: {
          id: string;
          workspace_id: string | null;
          name: string;
          description: string;
          enabled: boolean;
          rollout_percentage: number;
          target_roles: string[] | null;
          target_users: string[] | null;
          metadata: Record<string, unknown>;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id?: string | null;
          name: string;
          description: string;
          enabled?: boolean;
          rollout_percentage?: number;
          target_roles?: string[] | null;
          target_users?: string[] | null;
          metadata?: Record<string, unknown>;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string | null;
          name?: string;
          description?: string;
          enabled?: boolean;
          rollout_percentage?: number;
          target_roles?: string[] | null;
          target_users?: string[] | null;
          metadata?: Record<string, unknown>;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
  lexicon: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          active: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          active?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          active?: boolean;
          sort_order?: number;
        };
      };
      genres: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          active: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          active?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          active?: boolean;
          sort_order?: number;
        };
      };
      moods: {
        Row: {
          id: string;
          name: string;
          active: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          active?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          active?: boolean;
          sort_order?: number;
        };
      };
    };
  };
};