import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { userRegistrationService } from '../../services/userRegistrationService';
import { Card } from '../ui/Card';
import type { User } from '@supabase/supabase-js';

// Define ExtendedUser type locally to avoid imports
interface ExtendedUserMetadata {
  full_name?: string;
  is_account_owner?: boolean;
  workspace_id?: string | null;
  provider?: string;
  [key: string]: unknown;
}

interface ExtendedUser extends Omit<User, 'user_metadata'> {
  user_metadata: ExtendedUserMetadata;
}

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('🔐 OAuth Callback - Starting authentication flow');
        
        // Check if this is a mock OAuth callback
        const provider = searchParams.get('provider');
        const isMockAuth = searchParams.get('mock_auth') === 'true';
        const accessToken = searchParams.get('access_token');
        
        console.log('🔐 OAuth Callback - Params:', { provider, isMockAuth, hasAccessToken: !!accessToken });
        
        if (isMockAuth && provider) {
          console.log('🔐 OAuth Callback - Handling mock OAuth');
          
          // Handle mock social authentication
          const mockEmail = `demo@${provider}.com`;
          
          // Create user account with artist role
          const userProfile = await userRegistrationService.createDemoAccount(mockEmail, 'artist');
          
          console.log('🔐 OAuth Callback - Mock user profile created:', userProfile);
          
          // Create mock user object for auth store
          const mockUser = {
            id: userProfile.id,
            email: userProfile.email,
            role: userProfile.role,
            user_metadata: {
              full_name: userProfile.full_name,
              is_account_owner: userProfile.is_account_owner,
              workspace_id: userProfile.workspace_id,
              provider: provider,
            },
            app_metadata: {
              provider,
              providers: [provider]
            },
            created_at: userProfile.created_at,
            updated_at: userProfile.updated_at,
            aud: 'authenticated',
          };

          console.log('🔐 OAuth Callback - Setting user in auth store');
          setUser(mockUser as unknown as User);
          
          // Small delay to ensure state is set
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Check for pending subscription after authentication
          const pendingSubscription = localStorage.getItem('pendingSubscription');
          if (pendingSubscription) {
            console.log('🔐 OAuth Callback - Found pending subscription:', pendingSubscription);
            localStorage.removeItem('pendingSubscription');
            navigate(`/subscription?plan=${encodeURIComponent(pendingSubscription)}`);
            return;
          }
          
          console.log('🔐 OAuth Callback - Navigating to dashboard');
          navigate('/');
          return;
        }

        // Handle real OAuth callback if using real Supabase
        console.log('🔐 OAuth Callback - Handling real OAuth');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('OAuth callback error:', error);
          navigate('/auth?error=' + encodeURIComponent(error.message));
          return;
        }

        if (data?.session?.user) {
          const user = data.session.user as ExtendedUser;
          console.log('🔐 OAuth Callback - Real user found:', user.email);
          
          // Check if this is a new user (first time OAuth)
          try {
            await userRegistrationService.createUserAccount({
              email: user.email!,
              fullName: user.user_metadata?.full_name || user.email!.split('@')[0],
              accountType: 'artist',
            });
          } catch (registrationError) {
            // User might already exist, which is fine
            console.log('User might already exist:', registrationError);
          }
          
          setUser(user);
          
          // Check for pending subscription after authentication
          const pendingSubscription = localStorage.getItem('pendingSubscription');
          if (pendingSubscription) {
            console.log('🔐 OAuth Callback - Found pending subscription:', pendingSubscription);
            localStorage.removeItem('pendingSubscription');
            navigate(`/subscription?plan=${encodeURIComponent(pendingSubscription)}`);
            return;
          }
          
          navigate('/');
        } else {
          console.log('🔐 OAuth Callback - No session found');
          navigate('/auth?error=' + encodeURIComponent('No user session found'));
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/auth?error=' + encodeURIComponent('Authentication failed'));
      }
    };

    handleOAuthCallback();
  }, [searchParams, setUser, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">Completing Authentication</h2>
        <p className="text-gray-400">Please wait while we set up your account...</p>
      </Card>
    </div>
  );
}

export default AuthCallback;
