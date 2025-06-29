import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useStripe() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessful, setIsSuccessful] = useState(false);

  const createCheckoutSession = async (
    priceId: string, 
    mode: 'subscription' | 'payment' = 'subscription',
    redirectPath = '/settings?checkout=success'
  ) => {
    setIsLoading(true);
    setError(null);

    // Get the current URL for success and cancel URLs
    const origin = window.location.origin;
    const successUrl = `${origin}${redirectPath}`;
    const cancelUrl = `${origin}/subscription?checkout=canceled`;
      
    try {
      // Get the current session from Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const session = sessionData?.session;
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw new Error('Failed to get authentication session. Please log in again.');
      }
      
      if (!session || !session.access_token) {
        console.error('No active session found');
        throw new Error('No active session found. Please log in to continue.');
      }

      // Call the Supabase Edge Function to create a checkout session
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;
      console.log(`Creating checkout session with ${mode} mode for price ${priceId}`);
      console.log('Using access token:', session.access_token.substring(0, 10) + '...');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: successUrl,
          cancel_url: cancelUrl,
          mode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData?.error || 'Failed to create checkout session';
        console.error('Checkout error response:', errorData);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const { url } = data;

      // Redirect to Stripe Checkout
      if (url) {
        setIsSuccessful(true);
        console.log('Redirecting to Stripe checkout:', url);
        window.location.href = url;
      } else {
        console.error('No checkout URL in response:', data);
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      const errorMessage = err instanceof Error && err.message 
        ? err.message 
        : 'An unexpected error occurred while creating the checkout session';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
    
    return true;
  };

  return {
    createCheckoutSession,
    isLoading,
    isSuccessful,
    error,
  };
}