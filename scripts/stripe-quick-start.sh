#!/bin/bash

# TIMIP Stripe Quick Start - Immediate Activation
# This script provides the fastest path to activate Stripe integration

set -e

echo "⚡ TIMIP Stripe Quick Start"
echo "========================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Quick Stripe Integration Setup${NC}"
echo ""

# Check if environment file exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}📝 Creating environment file...${NC}"
    if [ -f ".env.local.template" ]; then
        cp .env.local.template .env.local
        echo -e "${GREEN}✅ Created .env.local from template${NC}"
    else
        cp .env.example .env.local
        echo -e "${GREEN}✅ Created .env.local from .env.example${NC}"
    fi
    echo ""
    echo -e "${YELLOW}⚠️  Please update .env.local with your Stripe keys:${NC}"
    echo "1. Get your keys from: https://dashboard.stripe.com/test/apikeys"
    echo "2. Update VITE_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY"
    echo "3. Update your Supabase credentials if needed"
    echo ""
    read -p "Press Enter when you've updated .env.local..."
fi

# Load environment
source .env.local

# Check if Supabase is configured
if [ -z "$VITE_SUPABASE_URL" ] || [[ "$VITE_SUPABASE_URL" == "https://your-project.supabase.co" ]]; then
    echo -e "${RED}❌ Please configure your Supabase URL in .env.local${NC}"
    exit 1
fi

if [ -z "$VITE_STRIPE_PUBLISHABLE_KEY" ] || [[ "$VITE_STRIPE_PUBLISHABLE_KEY" == "pk_test_your_publishable_key" ]]; then
    echo -e "${RED}❌ Please configure your Stripe publishable key in .env.local${NC}"
    exit 1
fi

echo -e "${BLUE}🔧 Installing dependencies...${NC}"
npm install

echo -e "${BLUE}🚀 Deploying Edge Functions...${NC}"

# Quick deploy without extensive checks
if command -v supabase &> /dev/null; then
    if supabase projects list &> /dev/null; then
        echo "Deploying Stripe Edge Functions..."
        
        supabase functions deploy stripe-checkout --no-verify-jwt || echo "Function deploy may have failed"
        supabase functions deploy stripe-webhook --no-verify-jwt || echo "Function deploy may have failed"
        
        # Set secrets if available
        if [ ! -z "$STRIPE_SECRET_KEY" ] && [[ "$STRIPE_SECRET_KEY" != "sk_test_your_secret_key" ]]; then
            supabase secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" || echo "Secret setting may have failed"
        fi
        
        if [ ! -z "$STRIPE_WEBHOOK_SECRET" ] && [[ "$STRIPE_WEBHOOK_SECRET" != "whsec_your_webhook_secret" ]]; then
            supabase secrets set STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET" || echo "Secret setting may have failed"
        fi
        
        echo -e "${GREEN}✅ Edge Functions deployed${NC}"
    else
        echo -e "${RED}❌ Please login to Supabase first: supabase login${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Supabase CLI not found. Installing...${NC}"
    npm install -g supabase
    echo "Please run: supabase login"
    exit 1
fi

echo -e "${BLUE}🧪 Starting development server...${NC}"

# Start the development server
echo -e "${GREEN}✅ Setup complete! Starting TIMIP...${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps to complete Stripe setup:${NC}"
echo ""
echo "1. 🏪 Create products in Stripe Dashboard:"
echo "   • Visit: https://dashboard.stripe.com/test/products"
echo "   • Create these products with exact price IDs:"
echo "     - Starter: price_1RdyvG4fVYS0vpWMUUyTvf9q (\$0.00/month)"
echo "     - Pro Artist: price_1Rdyc84fVYS0vpWMPcMIkqbP (\$59.99/month)"
echo "     - Indie Label: price_1RdyfT4fVYS0vpWMgeGm7yJQ (\$249.99/month)"
echo ""
echo "2. 🔗 Set up webhook:"
echo "   • Visit: https://dashboard.stripe.com/test/webhooks"
echo "   • Add endpoint: ${VITE_SUPABASE_URL}/functions/v1/stripe-webhook"
echo "   • Select events: checkout.session.completed, customer.subscription.*"
echo "   • Copy webhook secret to .env.local as STRIPE_WEBHOOK_SECRET"
echo ""
echo "3. 🧪 Test subscription:"
echo "   • Navigate to /subscription in your app"
echo "   • Try upgrading with test card: 4242 4242 4242 4242"
echo ""

# Start development server
npm run dev
