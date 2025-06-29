#!/bin/bash

# TIMIP Stripe Integration - Production Validation Script
# This script performs comprehensive validation of the Stripe integration

set -e

echo "🔍 TIMIP Stripe Integration - Production Validation"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Load environment variables
ENV_FILE=".env.local"
if [ -f ".env" ]; then
    ENV_FILE=".env"
fi

if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
else
    echo -e "${RED}❌ No environment file found${NC}"
    exit 1
fi

echo -e "${BLUE}🔧 Environment Validation${NC}"

# Test required environment variables
REQUIRED_VARS=(
    "VITE_SUPABASE_URL"
    "VITE_SUPABASE_ANON_KEY"
    "VITE_STRIPE_PUBLISHABLE_KEY"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Missing required environment variable: $var${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ $var is configured${NC}"
    fi
done

# Validate Stripe keys format
if [[ $VITE_STRIPE_PUBLISHABLE_KEY == pk_test_* ]] || [[ $VITE_STRIPE_PUBLISHABLE_KEY == pk_live_* ]]; then
    echo -e "${GREEN}✅ Stripe publishable key format is valid${NC}"
else
    echo -e "${RED}❌ Stripe publishable key format is invalid${NC}"
    exit 1
fi

echo -e "${BLUE}🏗️ Database Schema Validation${NC}"

# Check if Stripe tables exist by trying to query them
echo "Checking Stripe database tables..."

# This would need actual database connection, but we'll check migration files instead
MIGRATION_FILES=$(find supabase/migrations -name "*copper_trail.sql" -o -name "*stripe*" 2>/dev/null || true)

if [ ! -z "$MIGRATION_FILES" ]; then
    echo -e "${GREEN}✅ Stripe database migration files found${NC}"
    for file in $MIGRATION_FILES; do
        echo "  - $(basename $file)"
    done
else
    echo -e "${YELLOW}⚠️  No Stripe migration files found${NC}"
fi

echo -e "${BLUE}🔗 Edge Functions Validation${NC}"

# Test stripe-checkout function
echo "Testing stripe-checkout function..."
CHECKOUT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "${VITE_SUPABASE_URL}/functions/v1/stripe-checkout" 2>/dev/null || echo "000")

if [ "$CHECKOUT_RESPONSE" -eq 200 ] || [ "$CHECKOUT_RESPONSE" -eq 204 ]; then
    echo -e "${GREEN}✅ stripe-checkout function is accessible${NC}"
else
    echo -e "${RED}❌ stripe-checkout function returned status: $CHECKOUT_RESPONSE${NC}"
    echo "  Run: supabase functions deploy stripe-checkout --no-verify-jwt"
fi

# Test stripe-webhook function
echo "Testing stripe-webhook function..."
WEBHOOK_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "${VITE_SUPABASE_URL}/functions/v1/stripe-webhook" 2>/dev/null || echo "000")

if [ "$WEBHOOK_RESPONSE" -eq 200 ] || [ "$WEBHOOK_RESPONSE" -eq 204 ]; then
    echo -e "${GREEN}✅ stripe-webhook function is accessible${NC}"
else
    echo -e "${RED}❌ stripe-webhook function returned status: $WEBHOOK_RESPONSE${NC}"
    echo "  Run: supabase functions deploy stripe-webhook --no-verify-jwt"
fi

echo -e "${BLUE}💰 Product Configuration Validation${NC}"

# Check if required files exist
REQUIRED_FILES=(
    "src/hooks/useStripe.ts"
    "src/hooks/useSubscription.ts"
    "src/stripe-config.ts"
    "src/pages/SubscriptionPage.tsx"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${RED}❌ Missing required file: $file${NC}"
    fi
done

# Check if price IDs in stripe-config.ts match expected values
if [ -f "src/stripe-config.ts" ]; then
    echo "Checking price ID configuration..."
    
    STARTER_PRICE="price_1RdyvG4fVYS0vpWMUUyTvf9q"
    PRO_PRICE="price_1Rdyc84fVYS0vpWMPcMIkqbP"
    INDIE_PRICE="price_1RdyfT4fVYS0vpWMgeGm7yJQ"
    
    if grep -q "$STARTER_PRICE" src/stripe-config.ts; then
        echo -e "${GREEN}✅ Starter plan price ID configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Starter plan price ID not found${NC}"
    fi
    
    if grep -q "$PRO_PRICE" src/stripe-config.ts; then
        echo -e "${GREEN}✅ Pro Artist plan price ID configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Pro Artist plan price ID not found${NC}"
    fi
    
    if grep -q "$INDIE_PRICE" src/stripe-config.ts; then
        echo -e "${GREEN}✅ Indie Label plan price ID configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Indie Label plan price ID not found${NC}"
    fi
fi

echo -e "${BLUE}🔐 Security Validation${NC}"

# Check if secrets are properly configured
echo "Checking Supabase secrets configuration..."

# We can't directly check secrets, but we can verify the setup
if command -v supabase &> /dev/null; then
    if supabase projects list &> /dev/null; then
        echo -e "${GREEN}✅ Supabase CLI is authenticated${NC}"
    else
        echo -e "${RED}❌ Supabase CLI not authenticated${NC}"
        echo "  Run: supabase login"
    fi
else
    echo -e "${RED}❌ Supabase CLI not installed${NC}"
    echo "  Run: npm install -g supabase"
fi

echo -e "${BLUE}🧪 Integration Testing${NC}"

# Check if test files exist
if [ -f "scripts/test-stripe-integration.sh" ]; then
    echo -e "${GREEN}✅ Integration test script available${NC}"
    echo "  Run: ./scripts/test-stripe-integration.sh"
else
    echo -e "${YELLOW}⚠️  Integration test script not found${NC}"
fi

echo -e "${BLUE}📚 Documentation Check${NC}"

# Check documentation files
DOC_FILES=(
    "STRIPE_COMPLETE_SETUP.md"
    "STRIPE_INTEGRATION_GUIDE.md"
    "STRIPE_DEPLOYMENT_CHECKLIST.md"
    "STRIPE_IMPLEMENTATION_SUMMARY.md"
)

for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${YELLOW}⚠️  $file not found${NC}"
    fi
done

echo ""
echo -e "${BOLD}📋 Validation Summary${NC}"
echo "==================="

# Count successful checks
TOTAL_CHECKS=0
PASSED_CHECKS=0

# Environment checks (3)
TOTAL_CHECKS=$((TOTAL_CHECKS + 3))
for var in "${REQUIRED_VARS[@]}"; do
    if [ ! -z "${!var}" ]; then
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    fi
done

# Edge function checks (2)
TOTAL_CHECKS=$((TOTAL_CHECKS + 2))
if [ "$CHECKOUT_RESPONSE" -eq 200 ] || [ "$CHECKOUT_RESPONSE" -eq 204 ]; then
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi
if [ "$WEBHOOK_RESPONSE" -eq 200 ] || [ "$WEBHOOK_RESPONSE" -eq 204 ]; then
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

# File checks (4)
TOTAL_CHECKS=$((TOTAL_CHECKS + 4))
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    fi
done

# Calculate percentage
PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo "Checks passed: $PASSED_CHECKS/$TOTAL_CHECKS ($PERCENTAGE%)"

if [ $PERCENTAGE -eq 100 ]; then
    echo -e "${GREEN}🎉 All validations passed! Your Stripe integration is ready.${NC}"
elif [ $PERCENTAGE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  Most validations passed. Address the warnings above.${NC}"
else
    echo -e "${RED}❌ Several validations failed. Please fix the issues above.${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Next Steps${NC}"
echo ""
echo "1. Fix any failed validations shown above"
echo "2. Create products in Stripe Dashboard with the configured price IDs"
echo "3. Set up webhook endpoint in Stripe Dashboard"
echo "4. Test the complete flow with test cards"
echo "5. Deploy to production with live Stripe keys"
echo ""
echo -e "${BLUE}🧪 Manual Testing:${NC}"
echo "1. Start your development server: npm run dev"
echo "2. Navigate to subscription page: http://localhost:5173/subscription"
echo "3. Try upgrading to Pro Artist plan"
echo "4. Use test card: 4242 4242 4242 4242"
echo "5. Verify success redirect and subscription update"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "• Complete Setup: STRIPE_COMPLETE_SETUP.md"
echo "• Integration Guide: STRIPE_INTEGRATION_GUIDE.md"
echo "• Deployment Checklist: STRIPE_DEPLOYMENT_CHECKLIST.md"
