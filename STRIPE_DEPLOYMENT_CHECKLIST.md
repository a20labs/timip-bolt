# Stripe Integration Deployment Checklist

## Pre-Deployment Setup ✅

### 1. Stripe Account Configuration
- [ ] Create Stripe account (test and live modes)
- [ ] Create products and prices in Stripe Dashboard
  - [ ] Starter Plan: $0/month (price_1RdyvG4fVYS0vpWMUUyTvf9q)
  - [ ] Pro Artist: $59.99/month (price_1Rdyc84fVYS0vpWMPcMIkqbP)  
  - [ ] Indie Label: $249.99/month (price_1RdyfT4fVYS0vpWMgeGm7yJQ)
- [ ] Get API keys (publishable and secret)
- [ ] Set up webhook endpoint

### 2. Environment Variables
- [ ] VITE_STRIPE_PUBLISHABLE_KEY (frontend)
- [ ] STRIPE_SECRET_KEY (backend/edge functions)
- [ ] STRIPE_WEBHOOK_SECRET (webhook verification)
- [ ] SUPABASE_SERVICE_ROLE_KEY (database access)

### 3. Database Setup
- [ ] Run Supabase migrations to create Stripe tables
- [ ] Verify `stripe_customers` table exists
- [ ] Verify `stripe_subscriptions` table exists  
- [ ] Verify `stripe_orders` table exists
- [ ] Verify `stripe_user_subscriptions` view exists

### 4. Edge Functions Deployment
- [ ] Deploy `stripe-checkout` function
- [ ] Deploy `stripe-webhook` function
- [ ] Set function secrets in Supabase
- [ ] Test function accessibility

## Development Testing ✅

### 1. Checkout Flow
- [ ] Test Pro Artist upgrade ($59.99)
- [ ] Test Indie Label upgrade ($249.99)
- [ ] Test checkout cancellation
- [ ] Verify success/failure redirects work
- [ ] Check error handling for failed payments

### 2. Webhook Processing
- [ ] Use Stripe CLI to test webhook locally
- [ ] Verify subscription status updates in database
- [ ] Test webhook signature verification
- [ ] Check subscription synchronization

### 3. User Experience
- [ ] Subscription banners show correctly
- [ ] Feature access controls work
- [ ] Upgrade modals display properly
- [ ] Navigation reflects subscription tier
- [ ] Settings page shows billing status

## Production Deployment ✅

### 1. Live Environment Setup
- [ ] Switch to live Stripe keys
- [ ] Create live webhook endpoint
- [ ] Update production environment variables
- [ ] Deploy edge functions to production

### 2. Webhook Configuration
- [ ] Create webhook in Stripe Dashboard (live mode)
- [ ] Point to production Supabase URL
- [ ] Select required events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Copy webhook secret to production environment

### 3. Production Testing
- [ ] Test with real credit card (small amount)
- [ ] Verify webhook delivery in Stripe Dashboard
- [ ] Check subscription updates in production database
- [ ] Test user experience end-to-end

## Security Checklist ✅

### 1. API Key Security
- [ ] Secret keys never exposed in frontend code
- [ ] Environment variables properly configured
- [ ] No hardcoded credentials in codebase
- [ ] Production and development keys separated

### 2. Webhook Security
- [ ] Webhook signature verification enabled
- [ ] HTTPS enforced for webhook endpoints
- [ ] Idempotency keys used for critical operations
- [ ] Error handling prevents sensitive data leaks

### 3. Database Security
- [ ] Row Level Security (RLS) enabled
- [ ] Proper user permissions configured
- [ ] Audit logging enabled
- [ ] Backup strategy in place

## Monitoring & Maintenance ✅

### 1. Monitoring Setup
- [ ] Stripe Dashboard alerts configured
- [ ] Supabase function monitoring enabled
- [ ] Database performance monitoring
- [ ] Error logging and alerting

### 2. Backup & Recovery
- [ ] Database backup strategy
- [ ] Webhook event replay capability
- [ ] Customer data recovery procedures
- [ ] Incident response plan

## Documentation ✅

- [ ] Environment setup documented
- [ ] Webhook configuration documented  
- [ ] Troubleshooting guide created
- [ ] API usage examples provided
- [ ] User flow diagrams created

## Support & Maintenance ✅

### 1. Customer Support
- [ ] Billing support procedures
- [ ] Subscription management tools
- [ ] Refund and cancellation processes
- [ ] Customer communication templates

### 2. Technical Maintenance
- [ ] Regular webhook health checks
- [ ] Subscription status auditing
- [ ] Performance optimization
- [ ] Security updates

## Quick Reference

### Key URLs
- **Checkout Function**: `https://your-project.supabase.co/functions/v1/stripe-checkout`
- **Webhook Endpoint**: `https://your-project.supabase.co/functions/v1/stripe-webhook`
- **Success URL**: `https://your-domain.com/settings?checkout=success`
- **Cancel URL**: `https://your-domain.com/settings?checkout=canceled`

### Test Cards
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires 3D Secure**: 4000 0025 0000 3155

### Important Commands
```bash
# Deploy functions
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# Test webhook locally
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

---

**Deployment Status**: ⚠️ PENDING - Complete checklist before production deployment
**Last Updated**: June 27, 2025
**Version**: 1.0.0
