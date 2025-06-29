# Stripe Integration Guide

## Overview
TIMIP integrates with Stripe for subscription billing and payment processing. This guide covers the complete setup process for linking subscriptions to Stripe in both development and production environments.

## Features
- ✅ **Subscription Management**: Pro Artist ($59.99/month) and Indie Label ($249.99/month) plans
- ✅ **Secure Checkout**: Stripe Checkout integration with redirect flow
- ✅ **Webhook Processing**: Real-time subscription status updates
- ✅ **Database Sync**: Automatic sync between Stripe and Supabase
- ✅ **User Experience**: Success/failure handling with user feedback

## Architecture

```
Frontend (React) → Supabase Edge Functions → Stripe API → Webhooks → Database Update
```

### Components
1. **Frontend**: Subscription UI, checkout initiation
2. **Edge Functions**: Secure server-side Stripe operations
3. **Webhooks**: Real-time subscription status synchronization
4. **Database**: User subscription tracking and billing history

## Setup Guide

### 1. Stripe Account Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard:
   - **Publishable key**: `pk_test_...` (for development) or `pk_live_...` (for production)
   - **Secret key**: `sk_test_...` (for development) or `sk_live_...` (for production)

### 2. Create Products and Prices

In your Stripe Dashboard, create the following products:

#### Starter Plan (Free)
- **Product ID**: `prod_SZ796jTcCxnGDn`
- **Price ID**: `price_1RdyvG4fVYS0vpWMUUyTvf9q`
- **Amount**: $0/month
- **Features**: 5 track uploads, Basic analytics, Community access

#### Pro Artist Plan
- **Product ID**: `prod_SZ6pc9df1O3nDQ`
- **Price ID**: `price_1Rdyc84fVYS0vpWMPcMIkqbP`
- **Amount**: $59.99/month
- **Features**: Unlimited tracks, Advanced analytics, API access, Priority support

#### Indie Label Plan
- **Product ID**: `prod_SZ6tri1Y9Ubik5`
- **Price ID**: `price_1RdyfT4fVYS0vpWMgeGm7yJQ`
- **Amount**: $249.99/month
- **Features**: Everything in Pro + White-labeling, Custom integrations, Dedicated support

### 3. Environment Configuration

Update your environment variables:

```bash
# Frontend (Client-side)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# Backend (Server-side - Supabase Edge Functions)
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Webhook Configuration

1. In Stripe Dashboard, go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook secret to your environment variables

### 5. Supabase Edge Functions Deployment

Deploy the Stripe functions to Supabase:

```bash
# Deploy checkout function
supabase functions deploy stripe-checkout

# Deploy webhook function  
supabase functions deploy stripe-webhook

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Database Schema

The following tables are automatically created by migrations:

### stripe_customers
```sql
CREATE TABLE stripe_customers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

### stripe_subscriptions
```sql
CREATE TABLE stripe_subscriptions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_id TEXT NOT NULL UNIQUE,
  subscription_id TEXT,
  price_id TEXT,
  current_period_start INTEGER,
  current_period_end INTEGER,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  payment_method_brand TEXT,
  payment_method_last4 TEXT,
  status stripe_subscription_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### stripe_orders
```sql
CREATE TABLE stripe_orders (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  checkout_session_id TEXT NOT NULL UNIQUE,
  payment_intent_id TEXT,
  customer_id TEXT NOT NULL,
  amount_subtotal INTEGER,
  amount_total INTEGER,
  currency TEXT DEFAULT 'usd',
  payment_status TEXT,
  status stripe_order_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Usage

### 1. Subscription Upgrade Flow

```typescript
import { useStripe } from '../hooks/useStripe';

function UpgradeButton() {
  const { createCheckoutSession, isLoading } = useStripe();
  
  const handleUpgrade = async () => {
    await createCheckoutSession('price_1Rdyc84fVYS0vpWMPcMIkqbP'); // Pro Artist
  };
  
  return (
    <button onClick={handleUpgrade} disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Upgrade to Pro'}
    </button>
  );
}
```

### 2. Subscription Status Check

```typescript
import { useSubscription } from '../hooks/useSubscription';

function SubscriptionStatus() {
  const { currentTier, stripeSubscription } = useSubscription();
  
  return (
    <div>
      <p>Current Plan: {currentTier}</p>
      {stripeSubscription && (
        <p>Status: {stripeSubscription.subscription_status}</p>
      )}
    </div>
  );
}
```

### 3. Feature Access Control

```typescript
const { features } = useSubscription();

// Check if user has access to API features
const apiAccess = features.apiAccess();
if (!apiAccess.hasAccess) {
  apiAccess.showUpgrade(); // Shows upgrade modal
  return;
}
```

## Checkout Flow

1. **User clicks upgrade** → `createCheckoutSession()` called
2. **Session created** → Supabase Edge Function creates Stripe session
3. **Redirect to Stripe** → User completes payment on Stripe Checkout
4. **Payment success** → User redirected to `/settings?checkout=success`
5. **Webhook triggered** → Stripe notifies our webhook endpoint
6. **Database updated** → Subscription status synced in Supabase
7. **UI updates** → User sees new subscription tier immediately

## Testing

### Test Credit Cards

Stripe provides test credit cards for development:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires SCA**: `4000 0025 0000 3155`

### Webhook Testing

Use Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
# Forward webhooks to local development
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
```

## Production Deployment

### 1. Update Environment Variables

```bash
# Use live keys for production
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
```

### 2. Configure Live Webhook

1. Create new webhook endpoint in Stripe Dashboard (Live mode)
2. Point to your production Supabase URL
3. Update webhook secret in production environment

### 3. Test Live Integration

1. Use real credit card for testing (will be charged)
2. Verify webhook delivery in Stripe Dashboard
3. Check subscription status updates in database
4. Test upgrade/downgrade flows

## Troubleshooting

### Common Issues

1. **Checkout session not created**
   - Check API keys are correct
   - Verify user is authenticated
   - Check Supabase Edge Function logs

2. **Webhook not received**
   - Verify webhook URL is accessible
   - Check webhook secret matches
   - Review Stripe webhook delivery logs

3. **Subscription not updating**
   - Check webhook events are configured
   - Verify database permissions
   - Review Edge Function execution logs

### Debug Commands

```bash
# Check Supabase function logs
supabase functions logs stripe-checkout
supabase functions logs stripe-webhook

# Test webhook locally
curl -X POST http://localhost:54321/functions/v1/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

## Security Best Practices

1. **Never expose secret keys** in frontend code
2. **Validate webhook signatures** to prevent fraud
3. **Use HTTPS only** for webhook endpoints
4. **Monitor webhook delivery** for failures
5. **Implement idempotency** for webhook processing
6. **Log security events** for audit trail

## Support

- **Stripe Documentation**: https://stripe.com/docs
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **TIMIP Support**: Contact your account manager for assistance

---

**Last Updated**: June 27, 2025
**Version**: 1.0.0
