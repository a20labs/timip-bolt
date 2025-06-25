#!/bin/bash

# PWA Icon Generator Script
# This script creates missing PWA icon sizes from the existing 512x512 icon

echo "🎨 Generating PWA icons from existing 512x512 icon..."

# Check if source icon exists
SOURCE_ICON="public/icon-512x512.png"
if [ ! -f "$SOURCE_ICON" ]; then
    echo "❌ Source icon not found: $SOURCE_ICON"
    exit 1
fi

# Required icon sizes
declare -a sizes=("72x72" "96x96" "128x128" "144x144" "152x152" "384x384")

# Check if ImageMagick is available
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick not found. Installing via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install imagemagick
    else
        echo "❌ Homebrew not found. Please install ImageMagick manually:"
        echo "   brew install imagemagick"
        echo "   OR"
        echo "   Download from: https://imagemagick.org/script/download.php"
        exit 1
    fi
fi

# Generate missing icon sizes
for size in "${sizes[@]}"; do
    output_file="public/icon-${size}.png"
    
    if [ ! -f "$output_file" ]; then
        echo "📱 Creating $output_file..."
        convert "$SOURCE_ICON" -resize "${size}!" "$output_file"
        
        if [ $? -eq 0 ]; then
            echo "✅ Created $output_file"
        else
            echo "❌ Failed to create $output_file"
        fi
    else
        echo "⏭️  $output_file already exists"
    fi
done

# Create favicon.ico
if [ ! -f "public/favicon.ico" ]; then
    echo "🌐 Creating favicon.ico..."
    convert "$SOURCE_ICON" -resize 32x32! public/favicon.ico
    echo "✅ Created favicon.ico"
fi

# Create apple-touch-icon.png
if [ ! -f "public/apple-touch-icon.png" ]; then
    echo "🍎 Creating apple-touch-icon.png..."
    convert "$SOURCE_ICON" -resize 180x180! public/apple-touch-icon.png
    echo "✅ Created apple-touch-icon.png"
fi

# Create safari-pinned-tab.svg (placeholder - would need actual SVG conversion)
if [ ! -f "public/safari-pinned-tab.svg" ]; then
    echo "🦁 Creating safari-pinned-tab.svg placeholder..."
    cat > public/safari-pinned-tab.svg << 'EOF'
<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
<g transform="translate(0,1024) scale(0.1,-0.1)" fill="#000000" stroke="none">
<path d="M4800 10230 c-1102 -71 -2112 -515 -2930 -1290 -818 -774 -1356 -1818 -1543 -2995 -57 -358 -72 -565 -72 -945 0 -380 15 -587 72 -945 187 -1177 725 -2221 1543 -2995 818 -775 1828 -1219 2930 -1290 358 -23 727 -23 1085 0 1102 71 2112 515 2930 1290 818 774 1356 1818 1543 2995 57 358 72 565 72 945 0 380 -15 587 -72 945 -187 1177 -725 2221 -1543 2995 -818 775 -1828 1219 -2930 1290 -358 23 -727 23 -1085 0z"/>
</g>
</svg>
EOF
    echo "✅ Created safari-pinned-tab.svg"
fi

echo ""
echo "🎉 PWA icon generation complete!"
echo "📋 Generated icons:"
ls -la public/icon-*.png public/favicon.ico public/apple-touch-icon.png public/safari-pinned-tab.svg 2>/dev/null
echo ""
echo "💡 Next steps:"
echo "   1. Replace placeholder safari-pinned-tab.svg with proper SVG version"
echo "   2. Create screenshot images for app store listings"
echo "   3. Test PWA installation on mobile devices"
