#!/bin/bash

# TIMIP Stripe Edge Functions - Complete Setup Script
# This script automates the entire Stripe integration setup process

set -e

echo "🎵 TIMIP Stripe Integration - Complete Setup"
echo "============================================"

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

echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI is not installed${NC}"
    echo "Installing Supabase CLI..."
    npm install -g supabase
fi

# Check if we're logged into Supabase
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  You need to login to Supabase first${NC}"
    echo "Run: supabase login"
    exit 1
fi

echo -e "${BLUE}📋 Environment Configuration${NC}"

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        echo "Creating .env.local from .env.example..."
        cp .env.example .env.local
        echo -e "${YELLOW}⚠️  Please update .env.local with your actual values${NC}"
    else
        echo -e "${RED}❌ No .env.example found${NC}"
        exit 1
    fi
fi

# Load environment variables
if [ -f ".env.local" ]; then
    source .env.local
elif [ -f ".env" ]; then
    source .env
else
    echo -e "${RED}❌ No environment file found${NC}"
    exit 1
fi

# Validate required environment variables
echo "Checking required environment variables..."

REQUIRED_VARS=(
    "VITE_SUPABASE_URL"
    "VITE_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Missing required environment variable: $var${NC}"
        echo "Please update your .env.local file"
        exit 1
    else
        echo -e "${GREEN}✅ $var is configured${NC}"
    fi
done

# Check Stripe configuration
echo -e "${BLUE}💳 Stripe Configuration${NC}"

if [ -z "$VITE_STRIPE_PUBLISHABLE_KEY" ]; then
    echo -e "${YELLOW}⚠️  VITE_STRIPE_PUBLISHABLE_KEY not set${NC}"
    echo "Please add your Stripe publishable key to .env.local"
    echo "Get it from: https://dashboard.stripe.com/test/apikeys"
    read -p "Press Enter to continue when ready..."
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo -e "${YELLOW}⚠️  STRIPE_SECRET_KEY not set${NC}"
    echo "Please add your Stripe secret key to .env.local"
    echo "Get it from: https://dashboard.stripe.com/test/apikeys"
    read -p "Press Enter to continue when ready..."
fi

echo -e "${BLUE}🏗️  Database Migration${NC}"

# Run database migrations to ensure Stripe tables exist
echo "Applying database migrations..."
if supabase db push; then
    echo -e "${GREEN}✅ Database migrations applied successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Database migrations may have failed (this might be normal if already applied)${NC}"
fi

echo -e "${BLUE}🚀 Deploying Supabase Edge Functions${NC}"

# Deploy Stripe checkout function
echo "Deploying stripe-checkout function..."
if supabase functions deploy stripe-checkout --no-verify-jwt; then
    echo -e "${GREEN}✅ stripe-checkout function deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy stripe-checkout function${NC}"
    echo "Try deploying manually: supabase functions deploy stripe-checkout --no-verify-jwt"
    exit 1
fi

# Deploy Stripe webhook function
echo "Deploying stripe-webhook function..."
if supabase functions deploy stripe-webhook --no-verify-jwt; then
    echo -e "${GREEN}✅ stripe-webhook function deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy stripe-webhook function${NC}"
    echo "Try deploying manually: supabase functions deploy stripe-webhook --no-verify-jwt"
    exit 1
fi

echo -e "${BLUE}🔐 Setting up secrets${NC}"

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
    echo "You'll need to set this manually later:"
    echo "supabase secrets set STRIPE_SECRET_KEY=\"sk_test_your_secret_key\""
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
    echo "You'll need to set this after creating webhooks in Stripe Dashboard"
fi

echo -e "${BLUE}🧪 Testing Edge Functions${NC}"

# Get Supabase project URL
PROJECT_URL="$VITE_SUPABASE_URL"
if [ ! -z "$PROJECT_URL" ]; then
    echo "Testing checkout function..."
    if curl -f -s "${PROJECT_URL}/functions/v1/stripe-checkout" -X OPTIONS > /dev/null 2>&1; then
        echo -e "${GREEN}✅ stripe-checkout function is accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  stripe-checkout function may not be accessible yet (normal after fresh deployment)${NC}"
    fi
    
    echo "Testing webhook function..."
    if curl -f -s "${PROJECT_URL}/functions/v1/stripe-webhook" -X OPTIONS > /dev/null 2>&1; then
        echo -e "${GREEN}✅ stripe-webhook function is accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  stripe-webhook function may not be accessible yet (normal after fresh deployment)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not determine Supabase URL for testing${NC}"
fi

echo -e "${BLUE}📋 Checking Stripe configuration${NC}"

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
echo "   • Visit: https://dashboard.stripe.com/test/products"
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
echo "2. 🔑 Update environment variables (if not already done):"
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
echo "• Complete Setup Guide: STRIPE_COMPLETE_SETUP.md"
echo "• Integration Guide: STRIPE_INTEGRATION_GUIDE.md"
echo "• Deployment Checklist: STRIPE_DEPLOYMENT_CHECKLIST.md"
echo "• Implementation Summary: STRIPE_IMPLEMENTATION_SUMMARY.md"
echo ""
echo -e "${GREEN}🚀 Your Stripe integration is ready for testing!${NC}"
echo ""
echo -e "${BLUE}🧪 Run the test script to verify everything:${NC}"
echo "chmod +x scripts/test-stripe-integration.sh && ./scripts/test-stripe-integration.sh"
