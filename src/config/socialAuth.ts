// Social authentication provider configuration
// This file defines which OAuth providers are available and how they should be handled

export interface SocialProvider {
  id: string;
  name: string;
  displayName: string;
  color: string;
  icon: string;
  enabled: boolean;
  requiresSetup: boolean;
  description: string;
}

export const socialProviders: Record<string, SocialProvider> = {
  google: {
    id: 'google',
    name: 'google',
    displayName: 'Google',
    color: 'text-blue-500',
    icon: 'google',
    enabled: true,
    requiresSetup: false,
    description: 'Sign in with your Google account'
  },
  facebook: {
    id: 'facebook',
    name: 'facebook', 
    displayName: 'Facebook',
    color: 'text-blue-600',
    icon: 'facebook',
    enabled: true,
    requiresSetup: false,
    description: 'Sign in with your Facebook account'
  },
  linkedin_oidc: {
    id: 'linkedin_oidc',
    name: 'linkedin_oidc',
    displayName: 'LinkedIn',
    color: 'text-blue-700',
    icon: 'linkedin',
    enabled: true,
    requiresSetup: true,
    description: 'Sign in with your LinkedIn account'
  },
  spotify: {
    id: 'spotify',
    name: 'spotify',
    displayName: 'Spotify',
    color: 'text-green-500',
    icon: 'spotify',
    enabled: true,
    requiresSetup: true,
    description: 'Sign in with your Spotify account'
  }
};

// List of providers that typically require manual setup in Supabase
export const providersRequiringSetup = ['linkedin_oidc', 'spotify'];

// Check if a provider should use mock authentication
export function shouldUseMockAuth(provider: string): boolean {
  const hasSupabaseCredentials = !!(
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co'
  );

  // Always use mock if no real Supabase credentials
  if (!hasSupabaseCredentials) {
    return true;
  }

  // Use mock for providers that typically require setup
  // This can be overridden by setting environment variables
  const forceRealAuth = import.meta.env.VITE_FORCE_REAL_OAUTH === 'true';
  if (forceRealAuth) {
    return false;
  }

  return providersRequiringSetup.includes(provider);
}

// Get user-friendly error message for OAuth failures
export function getOAuthErrorMessage(provider: string, error: string): string {
  if (error.includes('not enabled') || error.includes('Unsupported provider')) {
    return `${socialProviders[provider]?.displayName || provider} authentication is not configured. Using demo authentication instead.`;
  }
  
  if (error.includes('cancelled') || error.includes('denied')) {
    return `${socialProviders[provider]?.displayName || provider} authentication was cancelled.`;
  }
  
  return `Failed to authenticate with ${socialProviders[provider]?.displayName || provider}. Please try again.`;
}
