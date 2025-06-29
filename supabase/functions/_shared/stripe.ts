import Stripe from 'https://esm.sh/stripe@17.7.0';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');

if (!stripeSecret) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

export const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'TIMIP - TruIndee Music Platform',
    version: '1.0.0',
    url: 'https://truindee.org',
  },
  apiVersion: '2024-06-20',
  // Configure for Deno environment
  httpClient: Stripe.createFetchHttpClient(),
});
