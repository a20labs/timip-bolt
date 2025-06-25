#!/bin/bash

# TruIndee PWA Icon Generator
# Uses ImageMagick to generate PWA icons from SVG source

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PUBLIC_DIR="$PROJECT_ROOT/public"
SOURCE_SVG="$SCRIPT_DIR/icon-source.svg"

echo -e "${BLUE}🎨 TruIndee PWA Icon Generator${NC}"
echo -e "${BLUE}================================${NC}\n"

# Check if ImageMagick is available
if ! command -v magick &> /dev/null; then
    echo -e "${RED}❌ ImageMagick not found. Please install it first:${NC}"
    echo -e "${YELLOW}brew install imagemagick${NC}"
    exit 1
fi

# Check if source SVG exists
if [ ! -f "$SOURCE_SVG" ]; then
    echo -e "${RED}❌ Source SVG not found: $SOURCE_SVG${NC}"
    exit 1
fi

# Create public directory if it doesn't exist
mkdir -p "$PUBLIC_DIR"

echo -e "${GREEN}📁 Output directory: $PUBLIC_DIR${NC}"
echo -e "${GREEN}📄 Source SVG: $SOURCE_SVG${NC}\n"

# Icon sizes for PWA
declare -a sizes=(
    "16:favicon-16x16.png"
    "32:favicon-32x32.png"
    "72:icon-72x72.png"
    "96:icon-96x96.png"
    "128:icon-128x128.png"
    "144:icon-144x144.png"
    "152:icon-152x152.png"
    "180:apple-touch-icon.png"
    "192:icon-192x192.png"
    "384:icon-384x384.png"
    "512:icon-512x512.png"
)

echo -e "${YELLOW}🔄 Generating PNG icons...${NC}"

# Generate PNG icons
for size_file in "${sizes[@]}"; do
    IFS=':' read -r size filename <<< "$size_file"
    output_path="$PUBLIC_DIR/$filename"
    
    echo -e "  📱 Creating ${filename} (${size}×${size})"
    
    # Use ImageMagick to convert SVG to PNG
    magick "$SOURCE_SVG" \
        -resize "${size}x${size}" \
        -background transparent \
        -gravity center \
        -extent "${size}x${size}" \
        "$output_path"
    
    if [ $? -eq 0 ]; then
        file_size=$(du -h "$output_path" | cut -f1)
        echo -e "     ${GREEN}✅ Generated (${file_size})${NC}"
    else
        echo -e "     ${RED}❌ Failed${NC}"
    fi
done

echo -e "\n${YELLOW}🔄 Creating favicon.ico...${NC}"

# Create favicon.ico with multiple sizes
magick "$SOURCE_SVG" \
    \( -clone 0 -resize 16x16 \) \
    \( -clone 0 -resize 32x32 \) \
    \( -clone 0 -resize 48x48 \) \
    -delete 0 \
    "$PUBLIC_DIR/favicon.ico"

if [ $? -eq 0 ]; then
    file_size=$(du -h "$PUBLIC_DIR/favicon.ico" | cut -f1)
    echo -e "  ${GREEN}✅ favicon.ico created (${file_size})${NC}"
else
    echo -e "  ${RED}❌ Failed to create favicon.ico${NC}"
fi

echo -e "\n${YELLOW}🔄 Creating safari-pinned-tab.svg...${NC}"

# Create a monochrome version for Safari pinned tab
cat > "$PUBLIC_DIR/safari-pinned-tab.svg" << 'EOF'
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1024 1024" xml:space="preserve">
    <rect width="1024" height="1024" rx="128" fill="#000000"/>
    <text x="512" y="420" font-family="Arial, sans-serif" font-size="150" font-weight="bold" text-anchor="middle" fill="white">TruIndee</text>
    <text x="512" y="500" font-family="Arial, sans-serif" font-size="80" text-anchor="middle" fill="white">MUSIC PLATFORM</text>
    <g fill="white" transform="translate(412, 600)">
        <ellipse cx="30" cy="140" rx="30" ry="20"/>
        <rect x="36" y="0" width="12" height="140"/>
        <ellipse cx="120" cy="100" rx="30" ry="20"/>
        <rect x="126" y="-40" width="12" height="140"/>
    </g>
</svg>
EOF

echo -e "  ${GREEN}✅ safari-pinned-tab.svg created${NC}"

echo -e "\n${GREEN}✅ All PWA icons generated successfully!${NC}"
echo -e "${GREEN}📁 Icons saved to: $PUBLIC_DIR${NC}\n"

echo -e "${BLUE}📱 Generated files:${NC}"
for size_file in "${sizes[@]}"; do
    IFS=':' read -r size filename <<< "$size_file"
    if [ -f "$PUBLIC_DIR/$filename" ]; then
        file_size=$(du -h "$PUBLIC_DIR/$filename" | cut -f1)
        echo -e "   ${filename} (${file_size})"
    fi
done

# List additional files
for file in "favicon.ico" "safari-pinned-tab.svg"; do
    if [ -f "$PUBLIC_DIR/$file" ]; then
        file_size=$(du -h "$PUBLIC_DIR/$file" | cut -f1)
        echo -e "   ${file} (${file_size})"
    fi
done

echo -e "\n${GREEN}🚀 Ready for PWA deployment!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Test PWA installation on mobile devices"
echo -e "2. Verify all icons display correctly"
echo -e "3. Run 'npm run build' to test PWA functionality"
echo -e "4. Deploy and test on real devices"
