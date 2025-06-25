// Stripe product configuration
export const products = [
  {
    id: 'prod_SZ796jTcCxnGDn',
    name: 'Starter',
    description: '5 track uploads/month, Basic analytics, Community access, Standard support, Personal AI Manager (PAM)',
    priceId: 'price_1RdyvG4fVYS0vpWMUUyTvf9q',
    price: 0,
    mode: 'subscription' as const,
    features: [
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
    name: 'Indie Label',
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