# Stripe Integration Troubleshooting Guide

## 🚨 Common Issues & Solutions

### 1. "Stripe is not configured" Error

**Problem**: Frontend shows "Stripe is not configured" when trying to checkout.

**Solutions**:
```bash
# Check environment variables
echo $VITE_STRIPE_PUBLISHABLE_KEY

# Should start with pk_test_ or pk_live_
# If empty or wrong format:
# 1. Update .env.local with correct publishable key
# 2. Restart development server: npm run dev
```

### 2. Checkout Session Not Created

**Problem**: Error when clicking "Proceed to Checkout" button.

**Solutions**:
```bash
# Check if Edge Function is deployed
curl -X OPTIONS https://your-project.supabase.co/functions/v1/stripe-checkout

# If function not accessible:
supabase functions deploy stripe-checkout --no-verify-jwt

# Check Supabase secrets
supabase secrets list

# Set missing secrets:
supabase secrets set STRIPE_SECRET_KEY="sk_test_your_key"
```

### 3. Webhook Events Not Received

**Problem**: Subscriptions not updating after successful payment.

**Solutions**:
1. **Check webhook endpoint in Stripe Dashboard**:
   - URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`

2. **Verify webhook secret**:
   ```bash
   # Update webhook secret in environment
   supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_your_secret"
   ```

3. **Check webhook delivery logs** in Stripe Dashboard

### 4. Edge Function Deployment Issues

**Problem**: Functions fail to deploy or return errors.

**Solutions**:
```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy with verbose output
supabase functions deploy stripe-checkout --debug
supabase functions deploy stripe-webhook --debug

# Check function logs
supabase functions logs stripe-checkout
supabase functions logs stripe-webhook
```

### 5. Price ID Mismatch

**Problem**: "Price not found" errors during checkout.

**Solutions**:
1. **Verify price IDs in `src/stripe-config.ts`**:
   ```typescript
   // These must match exactly in Stripe Dashboard
   'price_1RdyvG4fVYS0vpWMUUyTvf9q' // Starter
   'price_1Rdyc84fVYS0vpWMPcMIkqbP' // Pro Artist
   'price_1RdyfT4fVYS0vpWMgeGm7yJQ' // Indie Label
   ```

2. **Create products in Stripe Dashboard** with exact price IDs

### 6. Database Connection Issues

**Problem**: Subscription data not saving to database.

**Solutions**:
```bash
# Run database migrations
supabase db push

# Check if Stripe tables exist
# Tables should include:
# - stripe_customers
# - stripe_subscriptions  
# - stripe_orders

# Check RLS policies are enabled
```

### 7. User Authentication Issues

**Problem**: "Please sign in to continue" error.

**Solutions**:
- Ensure user is logged in before accessing subscription features
- Check if session is valid: `supabase auth getSession()`
- Clear browser storage and login again

### 8. CORS Errors

**Problem**: Cross-origin request errors when calling Edge Functions.

**Solutions**:
- Edge Functions already include CORS headers
- Check if `VITE_SUPABASE_URL` is correct in environment
- Ensure functions are deployed to the correct project

### 9. Test Cards Not Working

**Problem**: Test credit cards fail during checkout.

**Solutions**:
- Use valid test cards: `4242 4242 4242 4242`
- Ensure you're in Test mode in Stripe Dashboard
- Check expiry date is in the future
- Use any 3-digit CVC

### 10. Production Deployment Issues

**Problem**: Integration works in development but fails in production.

**Solutions**:
1. **Switch to live keys**:
   ```bash
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
   STRIPE_SECRET_KEY=sk_live_your_live_key
   ```

2. **Create live webhook endpoint** in Stripe Dashboard

3. **Update Supabase secrets** with live keys

4. **Test with real payment** (small amount)

## 🔧 Debug Commands

### Check Environment
```bash
# Verify all required environment variables
echo "VITE_SUPABASE_URL: $VITE_SUPABASE_URL"
echo "VITE_STRIPE_PUBLISHABLE_KEY: $VITE_STRIPE_PUBLISHABLE_KEY"
echo "STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY:0:8}..." # Show first 8 chars only
```

### Test Edge Functions
```bash
# Test checkout function
curl -X OPTIONS https://your-project.supabase.co/functions/v1/stripe-checkout

# Test webhook function  
curl -X OPTIONS https://your-project.supabase.co/functions/v1/stripe-webhook

# Expected response: 204 No Content
```

### Validate Integration
```bash
# Run comprehensive validation
./scripts/validate-stripe-integration.sh

# Run integration tests
./scripts/test-stripe-integration.sh
```

### Check Function Logs
```bash
# Real-time logs for checkout function
supabase functions logs stripe-checkout --follow

# Real-time logs for webhook function
supabase functions logs stripe-webhook --follow
```

## 🆘 Getting Help

### Self-Diagnosis
1. Run `./scripts/validate-stripe-integration.sh`
2. Check the validation summary and fix failed items
3. Test again with `./scripts/test-stripe-integration.sh`

### Documentation
- **Setup Guide**: `STRIPE_COMPLETE_SETUP.md`
- **Integration Guide**: `STRIPE_INTEGRATION_GUIDE.md`
- **Deployment Checklist**: `STRIPE_DEPLOYMENT_CHECKLIST.md`

### External Resources
- **Stripe Documentation**: https://stripe.com/docs
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Stripe Test Cards**: https://stripe.com/docs/testing#cards

### Manual Testing Checklist
- [ ] Environment variables configured correctly
- [ ] Edge Functions deployed and accessible
- [ ] Stripe products created with correct price IDs
- [ ] Webhook endpoint configured with correct events
- [ ] Database migrations applied
- [ ] User can login successfully
- [ ] Checkout flow works with test card
- [ ] Webhook events are received and processed
- [ ] Subscription status updates in UI
- [ ] User can access new features after upgrade

## 🔄 Reset and Start Over

If all else fails, reset the integration:

```bash
# 1. Clear environment
rm .env.local

# 2. Recreate from template
cp .env.local.template .env.local
# Update with correct values

# 3. Redeploy functions
supabase functions deploy stripe-checkout --no-verify-jwt
supabase functions deploy stripe-webhook --no-verify-jwt

# 4. Reset secrets
supabase secrets set STRIPE_SECRET_KEY="sk_test_your_key"
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_your_secret"

# 5. Run quick start
./scripts/stripe-quick-start.sh
```
