# Stripe 30-Day Trial Setup Instructions

## Overview
This document outlines how to set up the 30-day trial for the Starter plan in Stripe Dashboard.

## Current Configuration
- **Plan Name**: Starter
- **Trial Period**: 30 days
- **Post-Trial Price**: $19.99/month
- **Price ID**: `price_1RdyvG4fVYS0vpWMUUyTvf9q`

## Steps to Configure in Stripe Dashboard

### 1. Update Existing Price Object
1. Log into your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** → **Pricing**
3. Find the price with ID `price_1RdyvG4fVYS0vpWMUUyTvf9q`
4. Click **Edit** on this price

### 2. Configure Trial Settings
1. In the price configuration:
   - **Billing model**: Recurring
   - **Amount**: $19.99
   - **Billing period**: Monthly
   - **Free trial**: Enable
   - **Trial period**: 30 days

### 3. Update Product Description
Update the product description to: 
```
30-day trial then $19.99/month. 5 track uploads/month, Basic analytics, Community access, Standard support, Personal AI Manager (PAM)
```

### 4. Webhook Configuration
Ensure your webhook endpoints handle these events:
- `customer.subscription.trial_will_end` - 3 days before trial ends
- `customer.subscription.updated` - When trial converts to paid
- `invoice.payment_failed` - If payment fails after trial

### 5. Test the Configuration
1. Use Stripe's test mode to verify:
   - Trial period starts correctly
   - Trial end notifications work
   - Conversion to paid subscription works
   - Payment failure handling works

## Code Integration

The application code has been updated to handle:
- **Trial tier recognition**: `subscription_status === 'trialing'`
- **Trial expiration**: Checking for `past_due` or `canceled` status
- **Feature access**: Trial users get access level between free and pro
- **UI updates**: Display "30-day trial" instead of "Free for 14 days"

## Subscription States
- **trialing**: User is in 30-day trial
- **active**: User is paying subscriber (post-trial)
- **past_due**: Trial ended, payment failed
- **canceled**: User canceled during or after trial

## Testing Checklist
- [ ] Trial subscription created successfully
- [ ] Trial period displays correctly in UI
- [ ] Feature access works during trial
- [ ] Trial expiration handled properly
- [ ] Payment collection works after trial
- [ ] Cancellation during trial works
- [ ] Webhooks fire correctly for trial events

## Notes
- Trial subscriptions in Stripe automatically convert to paid after trial period
- No payment method is required to start trial, but will be required before trial ends
- Use Stripe's test clock feature to simulate trial periods during development
