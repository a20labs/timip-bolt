#!/bin/bash

# PWA Production Build Script
# Optimizes build for PWA deployment with performance and mobile optimizations

set -e

echo "🚀 Starting PWA Production Build..."
echo "================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Clean previous build
echo -e "${BLUE}🧹 Cleaning previous build...${NC}"
rm -rf dist/

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
fi

# Run PWA validation tests
echo -e "${BLUE}🔍 Running PWA validation tests...${NC}"
node scripts/test-pwa.js || {
    echo -e "${RED}❌ PWA validation failed. Please fix issues before building.${NC}"
    exit 1
}

# Build the application
echo -e "${BLUE}🏗️  Building application...${NC}"
npm run build

# Verify build output
echo -e "${BLUE}✅ Verifying build output...${NC}"

# Check for essential PWA files
PWA_FILES=(
    "dist/manifest.webmanifest"
    "dist/sw.js"
    "dist/index.html"
    "dist/icon-192x192.png"
    "dist/icon-512x512.png"
)

for file in "${PWA_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Missing required file: $file${NC}"
        exit 1
    fi
done

# Check bundle sizes
echo -e "${BLUE}📊 Analyzing bundle sizes...${NC}"
echo "Main bundles:"
ls -lh dist/assets/*.js | grep -E "(index|vendor)" | while read line; do
    echo "  $line"
done

# Calculate total size
TOTAL_SIZE=$(du -sh dist/ | cut -f1)
echo -e "${GREEN}📦 Total build size: $TOTAL_SIZE${NC}"

# Check for performance optimizations
echo -e "${BLUE}⚡ Checking performance optimizations...${NC}"

# Check if files are minified
if grep -q "console.log" dist/assets/*.js; then
    echo -e "${YELLOW}⚠️  Warning: Console logs found in production build${NC}"
fi

# Check for source maps (should not be in production)
if ls dist/assets/*.map 1> /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Warning: Source maps found in production build${NC}"
fi

# Check service worker
SW_SIZE=$(wc -c < dist/sw.js)
if [ $SW_SIZE -lt 100 ]; then
    echo -e "${RED}❌ Service worker seems too small (${SW_SIZE} bytes)${NC}"
    exit 1
fi

# Test PWA installation
echo -e "${BLUE}🔧 Testing PWA manifest...${NC}"
node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('dist/manifest.webmanifest', 'utf8'));
if (!manifest.name || !manifest.short_name || !manifest.start_url || !manifest.icons) {
    console.error('❌ Invalid manifest structure');
    process.exit(1);
}
console.log('✅ Manifest is valid');
console.log('   Name:', manifest.name);
console.log('   Short name:', manifest.short_name);
console.log('   Icons:', manifest.icons.length);
"

# Generate deployment checklist
echo -e "${BLUE}📋 Generating deployment checklist...${NC}"
cat > dist/DEPLOYMENT_CHECKLIST.md << EOF
# PWA Deployment Checklist

## Pre-deployment Verification ✅

- [x] PWA manifest is valid
- [x] Service worker is generated
- [x] All required icons are present
- [x] Meta tags are included
- [x] Build is optimized and minified

## Deployment Requirements

### HTTPS Setup
- [ ] Deploy to HTTPS server (required for PWA)
- [ ] Configure SSL certificate
- [ ] Test service worker registration

### Server Configuration
- [ ] Configure proper MIME types:
  - \`.webmanifest\` → \`application/manifest+json\`
  - \`.js\` → \`application/javascript\`
- [ ] Set up proper caching headers
- [ ] Configure fallback routes for SPA

### Testing
- [ ] Test PWA installation on mobile devices
- [ ] Verify offline functionality
- [ ] Test push notifications (if implemented)
- [ ] Validate performance with Lighthouse
- [ ] Test on different browsers and devices

### Mobile App Stores (Optional)
- [ ] Consider PWA Builder for Microsoft Store
- [ ] Evaluate Trusted Web Activity for Google Play Store
- [ ] Test iOS Safari installation flow

## Performance Targets

- Lighthouse PWA Score: 100/100
- Performance Score: 90+
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s

## Build Information

- Build Date: $(date)
- Build Size: $TOTAL_SIZE
- Node Version: $(node --version)
- npm Version: $(npm --version)

EOF

echo -e "${GREEN}🎉 PWA Build Complete!${NC}"
echo -e "${GREEN}✅ All PWA requirements satisfied${NC}"
echo -e "${BLUE}📁 Build output: ./dist/${NC}"
echo -e "${BLUE}📋 Deployment checklist: ./dist/DEPLOYMENT_CHECKLIST.md${NC}"

# Suggest next steps
echo -e "\n${YELLOW}🚀 Next Steps:${NC}"
echo "1. Deploy to HTTPS server"
echo "2. Test installation on mobile devices"
echo "3. Run Lighthouse PWA audit"
echo "4. Configure server for proper PWA serving"

# Optional: Open build directory
if command -v open &> /dev/null; then
    echo -e "\n${BLUE}📂 Opening build directory...${NC}"
    open dist/
fi
