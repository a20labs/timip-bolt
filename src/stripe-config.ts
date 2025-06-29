// Stripe product configuration
export interface StripeProduct {
  id: string;
  name: string;
  description: string;
  priceId: string;
  price: number;
  mode: 'payment' | 'subscription';
  trialDays?: number; // Optional trial period in days
  features: string[];
  highlighted: boolean;
}

export const products: StripeProduct[] = [
  {
    id: 'prod_SZHXvMPJ1wJ6Gm',
    name: 'Free',
    description: 'Free tier with basic features',
    priceId: '', // Free tier - no price ID needed
    price: 0,
    mode: 'subscription' as const,
    features: [
      'Basic features',
      'Community access',
      'Standard support'
    ],
    highlighted: false
  },
  {
    id: 'prod_SZ6starter', // Unique ID for Starter (will need to create in Stripe)
    name: 'Starter',
    description: '30-day trial then $19.99/month. 5 track uploads/month, Basic analytics, Community access, Standard support, Personal AI Manager (PAM)',
    priceId: 'price_1RdyvG4fVYS0vpWMUUyTvf9q',
    price: 19.99,
    mode: 'subscription' as const,
    trialDays: 30, // 30-day trial
    features: [
      '30-day trial',
      '5 track uploads/month',
      'Basic analytics',
      'Community access',
      'Standard support',
      'Personal AI Manager (PAM)'
    ],
    highlighted: false
  },
  {
    id: 'prod_SZ6pc9df1O3nDQ',
    name: 'Pro Artist',
    description: 'Unlimited tracks, Advanced analytics, API access, Priority support, Full AI team access, Commerce tools, Release scheduling, Royalty splits',
    priceId: 'price_1Rdyc84fVYS0vpWMPcMIkqbP',
    price: 59.99,
    mode: 'subscription' as const,
    features: [
      'Unlimited tracks',
      'Advanced analytics',
      'API access',
      'Priority support',
      'Full AI team access',
      'Commerce tools',
      'Release scheduling',
      'Royalty splits'
    ],
    highlighted: true
  },
  {
    id: 'prod_SZ6tri1Y9Ubik5',
    name: 'Indee Label',
    description: 'Unlimited tracks, Advanced analytics, API access, Priority support, Full AI team access, Commerce tools, Release scheduling, Royalty splits, White-labeling, Custom integrations, Dedicated account manager, SLA guarantees, Multi-workspace management',
    priceId: 'price_1RdyfT4fVYS0vpWMgeGm7yJQ',
    price: 249.99,
    mode: 'subscription' as const,
    features: [
      'Everything in Pro Artist',
      'White-labeling',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantees',
      'Multi-workspace management'
    ],
    highlighted: false
  }
];

// Helper function to get product by ID
export function getProductById(id: string) {
  return products.find(product => product.id === id);
}

// Helper function to get product by price ID
export function getProductByPriceId(priceId: string) {
  return products.find(product => product.priceId === priceId);
}