# Complete Stripe Integration Setup for TIMIP

## 🎯 Overview
This guide provides step-by-step instructions to fully activate your Stripe subscription billing integration with Supabase Edge Functions.

## 📋 Prerequisites

### 1. Required Accounts
- [x] Stripe account (https://stripe.com)
- [x] Supabase project (already configured)
- [x] TIMIP application (this repository)

### 2. Required Tools
- [x] Supabase CLI (`npm install -g supabase`)
- [x] Node.js and npm/yarn
- [x] Git

## 🚀 Setup Process

### Step 1: Environment Configuration

1. **Copy environment template:**
```bash
cp .env.example .env.local
```

2. **Configure your `.env.local` file:**
```bash
# Supabase Configuration (already configured)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key  # From Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_your_secret_key                 # From Stripe Dashboard  
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret           # Will be generated in Step 3
```

### Step 2: Stripe Dashboard Setup

1. **Login to Stripe Dashboard** → https://dashboard.stripe.com

2. **Create Products** (go to Products → Add Product):

   **Product 1: Starter Plan**
   - Name: `Starter`
   - Description: `5 track uploads/month, Basic analytics, Community access`
   - Pricing: `$0.00 USD` - Recurring monthly
   - Product ID: `prod_SZ796jTcCxnGDn`
   - Price ID: `price_1RdyvG4fVYS0vpWMUUyTvf9q`

   **Product 2: Pro Artist**
   - Name: `Pro Artist`
   - Description: `Unlimited tracks, Advanced analytics, API access, Priority support`
   - Pricing: `$59.99 USD` - Recurring monthly
   - Product ID: `prod_SZ6pc9df1O3nDQ`
   - Price ID: `price_1Rdyc84fVYS0vpWMPcMIkqbP`

   **Product 3: Indie Label**
   - Name: `Indie Label`
   - Description: `Everything in Pro + White-labeling, Custom integrations, Dedicated support`
   - Pricing: `$249.99 USD` - Recurring monthly
   - Product ID: `prod_SZ6tri1Y9Ubik5`
   - Price ID: `price_1RdyfT4fVYS0vpWMgeGm7yJQ`

3. **Get API Keys** (go to Developers → API Keys):
   - Copy **Publishable key** → Add to `VITE_STRIPE_PUBLISHABLE_KEY`
   - Copy **Secret key** → Add to `STRIPE_SECRET_KEY`

### Step 3: Deploy Edge Functions

1. **Login to Supabase:**
```bash
supabase login
```

2. **Link your project:**
```bash
supabase link --project-ref your-project-ref
```

3. **Deploy Edge Functions:**
```bash
chmod +x scripts/setup-stripe.sh
./scripts/setup-stripe.sh
```

Or manually:
```bash
# Deploy functions
supabase functions deploy stripe-checkout --no-verify-jwt
supabase functions deploy stripe-webhook --no-verify-jwt

# Set secrets
supabase secrets set STRIPE_SECRET_KEY="sk_test_your_secret_key"
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
```

### Step 4: Webhook Configuration

1. **Go to Stripe Dashboard** → Developers → Webhooks

2. **Add Endpoint:**
   - Endpoint URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Events to send:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. **Copy Webhook Secret:**
   - After creating the webhook, click on it
   - Copy the signing secret (starts with `whsec_`)
   - Add to `STRIPE_WEBHOOK_SECRET` in `.env.local`
   - Update Supabase secrets: `supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_your_secret"`

### Step 5: Database Migration

Ensure Stripe tables are created:
```bash
supabase db push
```

### Step 6: Test the Integration

1. **Run test script:**
```bash
chmod +x scripts/test-stripe-integration.sh
./scripts/test-stripe-integration.sh
```

2. **Start development server:**
```bash
npm run dev
```

3. **Test checkout flow:**
   - Navigate to `/subscription`
   - Try upgrading to Pro Artist plan
   - Use test card: `4242 4242 4242 4242`
   - Any CVC, future expiry date

## 🧪 Testing Cards

### Successful Payments
- **Basic success**: `4242 4242 4242 4242`
- **Visa**: `4000 0000 0000 0002`
- **Mastercard**: `5555 5555 5555 4444`

### Failed Payments
- **Generic decline**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`
- **Lost card**: `4000 0000 0000 9987`

### Authentication Required
- **3D Secure**: `4000 0025 0000 3155`

## 🔧 Troubleshooting

### Common Issues

1. **"Stripe is not configured" error**
   - Check `VITE_STRIPE_PUBLISHABLE_KEY` in `.env.local`
   - Restart development server after adding

2. **Checkout session not created**
   - Verify Supabase Edge Functions are deployed
   - Check browser console for errors
   - Ensure user is logged in

3. **Webhook not received**
   - Test webhook endpoint manually
   - Check Stripe webhook delivery logs
   - Verify webhook secret is correct

4. **Subscription not updating**
   - Check Supabase function logs: `supabase functions logs stripe-webhook`
   - Verify webhook events are configured correctly

### Debug Commands

```bash
# Check function logs
supabase functions logs stripe-checkout
supabase functions logs stripe-webhook

# Test webhook endpoint
curl -X OPTIONS https://your-project.supabase.co/functions/v1/stripe-webhook

# Check environment variables
echo $VITE_STRIPE_PUBLISHABLE_KEY
```

## 🚢 Production Deployment

### Switch to Live Mode

1. **Update environment variables:**
```bash
# Use live keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_live_key
```

2. **Create live webhook:**
   - Switch Stripe dashboard to Live mode
   - Create new webhook endpoint pointing to production URL
   - Update `STRIPE_WEBHOOK_SECRET` with live webhook secret

3. **Update Supabase secrets:**
```bash
supabase secrets set STRIPE_SECRET_KEY="sk_live_your_live_key"
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_your_live_secret"
```

4. **Test with real payment:**
   - Use actual credit card (small amount)
   - Verify full flow works in production

## 📚 Additional Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Integration Guide**: `STRIPE_INTEGRATION_GUIDE.md`
- **Deployment Checklist**: `STRIPE_DEPLOYMENT_CHECKLIST.md`

## ✅ Success Checklist

- [ ] Environment variables configured
- [ ] Stripe products created with correct IDs
- [ ] Edge functions deployed successfully
- [ ] Webhook endpoint configured and receiving events
- [ ] Database tables created
- [ ] Test checkout completed successfully
- [ ] Subscription status updates in real-time
- [ ] User can access new features after upgrade

---

**Need help?** Check the troubleshooting section or review the detailed guides in this repository.
