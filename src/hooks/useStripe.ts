import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useStripe() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const createCheckoutSession = async (priceId: string, mode: 'subscription' | 'payment' = 'subscription') => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the current URL for success and cancel URLs
      const origin = window.location.origin;
      const successUrl = `${origin}/settings?checkout=success`;
      const cancelUrl = `${origin}/settings?checkout=canceled`;

      // Get the JWT token from localStorage
      const token = localStorage.getItem('supabase.auth.token');

      // Call the Supabase Edge Function to create a checkout session
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckoutSession,
    isLoading,
    error,
  };
}