#!/bin/bash

# TIMIP Stripe Edge Functions Setup Script
# This script deploys and configures Stripe integration with Supabase Edge Functions

set -e

echo "🎵 TIMIP Stripe Integration Setup"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: This script must be run from the project root directory${NC}"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI is not installed${NC}"
    echo "Please install it with: npm install -g supabase"
    exit 1
fi

# Check if we're logged into Supabase
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  You need to login to Supabase first${NC}"
    echo "Run: supabase login"
    exit 1
fi

echo -e "${BLUE}🔍 Checking environment configuration...${NC}"

# Check for required environment variables
ENV_FILE=".env"
if [ -f ".env.local" ]; then
    ENV_FILE=".env.local"
fi

if [ -f "$ENV_FILE" ]; then
    echo "Found environment file: $ENV_FILE"
    source "$ENV_FILE"
else
    echo -e "${YELLOW}⚠️  No .env file found. Make sure to set your environment variables.${NC}"
fi

# Validate environment variables
if [ -z "$VITE_STRIPE_PUBLISHABLE_KEY" ]; then
    echo -e "${YELLOW}⚠️  VITE_STRIPE_PUBLISHABLE_KEY not set${NC}"
    echo "Please add your Stripe publishable key to $ENV_FILE"
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo -e "${YELLOW}⚠️  STRIPE_SECRET_KEY not set${NC}"
    echo "This will be needed for Supabase Edge Functions"
fi

if [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
    echo -e "${YELLOW}⚠️  STRIPE_WEBHOOK_SECRET not set${NC}"
    echo "This will be needed for webhook verification"
fi

if [ -z "$VITE_SUPABASE_URL" ]; then
    echo -e "${RED}❌ VITE_SUPABASE_URL not set${NC}"
    echo "Please configure your Supabase project URL"
    exit 1
fi

echo -e "${BLUE}🏗️  Running database migrations...${NC}"

# Run database migrations to ensure Stripe tables exist
if supabase db push; then
    echo -e "${GREEN}✅ Database migrations applied successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Database migrations may have failed (this might be normal if already applied)${NC}"
fi

echo -e "${BLUE}🚀 Deploying Supabase Edge Functions...${NC}"

# Deploy Stripe checkout function
echo "Deploying stripe-checkout function..."
if supabase functions deploy stripe-checkout --no-verify-jwt; then
    echo -e "${GREEN}✅ stripe-checkout function deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy stripe-checkout function${NC}"
    exit 1
fi

# Deploy Stripe webhook function
echo "Deploying stripe-webhook function..."
if supabase functions deploy stripe-webhook --no-verify-jwt; then
    echo -e "${GREEN}✅ stripe-webhook function deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy stripe-webhook function${NC}"
    exit 1
fi

echo -e "${BLUE}🔐 Setting up secrets...${NC}"

# Set Stripe secret key if provided
if [ ! -z "$STRIPE_SECRET_KEY" ]; then
    echo "Setting STRIPE_SECRET_KEY..."
    if supabase secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"; then
        echo -e "${GREEN}✅ STRIPE_SECRET_KEY set successfully${NC}"
    else
        echo -e "${RED}❌ Failed to set STRIPE_SECRET_KEY${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping STRIPE_SECRET_KEY (not provided)${NC}"
fi

# Set Stripe webhook secret if provided
if [ ! -z "$STRIPE_WEBHOOK_SECRET" ]; then
    echo "Setting STRIPE_WEBHOOK_SECRET..."
    if supabase secrets set STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET"; then
        echo -e "${GREEN}✅ STRIPE_WEBHOOK_SECRET set successfully${NC}"
    else
        echo -e "${RED}❌ Failed to set STRIPE_WEBHOOK_SECRET${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping STRIPE_WEBHOOK_SECRET (not provided)${NC}"
fi

echo -e "${BLUE}🧪 Testing Edge Functions...${NC}"

# Get Supabase project URL
PROJECT_URL="$VITE_SUPABASE_URL"
if [ ! -z "$PROJECT_URL" ]; then
    echo "Testing checkout function..."
    if curl -f -s "${PROJECT_URL}/functions/v1/stripe-checkout" -X OPTIONS > /dev/null 2>&1; then
        echo -e "${GREEN}✅ stripe-checkout function is accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  stripe-checkout function may not be accessible yet (this is normal right after deployment)${NC}"
    fi
    
    echo "Testing webhook function..."
    if curl -f -s "${PROJECT_URL}/functions/v1/stripe-webhook" -X OPTIONS > /dev/null 2>&1; then
        echo -e "${GREEN}✅ stripe-webhook function is accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  stripe-webhook function may not be accessible yet (this is normal right after deployment)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not determine Supabase URL for testing${NC}"
fi

echo -e "${BLUE}📋 Checking Stripe configuration...${NC}"

# Check if price IDs match the ones in the app
if [ -f "src/stripe-config.ts" ]; then
    echo "Verifying price IDs in stripe-config.ts..."
    if grep -q "price_1RdyvG4fVYS0vpWMUUyTvf9q" src/stripe-config.ts; then
        echo -e "${GREEN}✅ Starter plan price ID found${NC}"
    else
        echo -e "${YELLOW}⚠️  Starter plan price ID not found in config${NC}"
    fi
    
    if grep -q "price_1Rdyc84fVYS0vpWMPcMIkqbP" src/stripe-config.ts; then
        echo -e "${GREEN}✅ Pro Artist plan price ID found${NC}"
    else
        echo -e "${YELLOW}⚠️  Pro Artist plan price ID not found in config${NC}"
    fi
    
    if grep -q "price_1RdyfT4fVYS0vpWMgeGm7yJQ" src/stripe-config.ts; then
        echo -e "${GREEN}✅ Indie Label plan price ID found${NC}"
    else
        echo -e "${YELLOW}⚠️  Indie Label plan price ID not found in config${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  stripe-config.ts not found${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Stripe Edge Functions setup complete!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo ""
echo "1. 🏪 Configure your Stripe Dashboard:"
echo "   • Create products with the exact price IDs from stripe-config.ts"
echo "   • Set up webhook endpoint: ${PROJECT_URL}/functions/v1/stripe-webhook"
echo "   • Select these webhook events:"
echo "     - checkout.session.completed"
echo "     - customer.subscription.created" 
echo "     - customer.subscription.updated"
echo "     - customer.subscription.deleted"
echo "     - invoice.payment_succeeded"
echo "     - invoice.payment_failed"
echo ""
echo "2. 🔑 Environment Variables (add to $ENV_FILE):"
echo "   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key"
echo "   STRIPE_SECRET_KEY=sk_test_your_key"
echo "   STRIPE_WEBHOOK_SECRET=whsec_your_secret"
echo ""
echo "3. 🧪 Test the integration:"
echo "   • Start your dev server: npm run dev"
echo "   • Try upgrading to Pro Artist plan"
echo "   • Check webhook delivery in Stripe Dashboard"
echo "   • Verify subscription status updates in your app"
echo ""
echo "4. 📱 Production deployment:"
echo "   • Switch to live Stripe keys"
echo "   • Create live webhook endpoint"
echo "   • Test with real payment"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "• Setup Guide: STRIPE_INTEGRATION_GUIDE.md"
echo "• Deployment Checklist: STRIPE_DEPLOYMENT_CHECKLIST.md"
echo "• Implementation Summary: STRIPE_IMPLEMENTATION_SUMMARY.md"
echo ""
echo -e "${GREEN}🚀 Your Stripe integration is ready for testing!${NC}"
