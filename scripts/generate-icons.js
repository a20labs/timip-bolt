#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { createCanvas } = require("canvas");

// Icon sizes required for PWA
const iconSizes = [
  { size: 72, name: "icon-72x72.png" },
  { size: 96, name: "icon-96x96.png" },
  { size: 128, name: "icon-128x128.png" },
  { size: 144, name: "icon-144x144.png" },
  { size: 152, name: "icon-152x152.png" },
  { size: 192, name: "icon-192x192.png" },
  { size: 384, name: "icon-384x384.png" },
  { size: 512, name: "icon-512x512.png" },
  { size: 32, name: "favicon-32x32.png" },
  { size: 16, name: "favicon-16x16.png" },
  { size: 180, name: "apple-touch-icon.png" }
];

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#8b5cf6");
  gradient.addColorStop(0.5, "#3b82f6");
  gradient.addColorStop(1, "#1d4ed8");

  // Fill background with rounded corners
  const radius = size * 0.125; // 12.5% radius for modern look
  roundRect(ctx, 0, 0, size, size, radius);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Add TruIndee text
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Main title
  const fontSize = size * 0.15;
  ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  ctx.fillText("TruIndee", size / 2, size * 0.4);

  // Subtitle (only for larger icons)
  if (size >= 128) {
    const subtitleSize = size * 0.08;
    ctx.font = `${subtitleSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText("MUSIC PLATFORM", size / 2, size * 0.6);
  }

  // Add music note icons (simplified for smaller sizes)
  if (size >= 96) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    const noteSize = size * 0.15;

    // Left note
    ctx.beginPath();
    ctx.ellipse(
      size * 0.3,
      size * 0.75,
      noteSize * 0.3,
      noteSize * 0.2,
      0,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.fillRect(
      size * 0.3 + noteSize * 0.2,
      size * 0.55,
      noteSize * 0.1,
      noteSize * 0.9
    );

    // Right note
    ctx.beginPath();
    ctx.ellipse(
      size * 0.7,
      size * 0.7,
      noteSize * 0.3,
      noteSize * 0.2,
      0,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.fillRect(
      size * 0.7 + noteSize * 0.2,
      size * 0.5,
      noteSize * 0.1,
      noteSize * 0.9
    );
  }

  return canvas;
}

// Helper function to draw rounded rectangles
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function generateFavicon() {
  // Create ICO file content (simplified - just use 32x32 PNG)
  const canvas = createIcon(32);
  return canvas.toBuffer("image/png");
}

function generateSafariPinnedTab() {
  return `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1024 1024" xml:space="preserve">
    <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
        </linearGradient>
    </defs>
    <rect width="1024" height="1024" rx="128" fill="url(#grad1)"/>
    <text x="512" y="420" font-family="Arial, sans-serif" font-size="150" font-weight="bold" text-anchor="middle" fill="white">TruIndee</text>
    <text x="512" y="500" font-family="Arial, sans-serif" font-size="80" text-anchor="middle" fill="rgba(255,255,255,0.8)">MUSIC PLATFORM</text>
    <g fill="rgba(255,255,255,0.9)" transform="translate(412, 600)">
        <ellipse cx="30" cy="140" rx="30" ry="20"/>
        <rect x="36" y="0" width="12" height="140"/>
        <ellipse cx="120" cy="100" rx="30" ry="20"/>
        <rect x="126" y="-40" width="12" height="140"/>
    </g>
</svg>`;
}

async function generateAllIcons() {
  const publicDir = path.join(__dirname, "..", "public");

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log("🎨 Generating TruIndee PWA Icons...\n");

  // Generate PNG icons
  for (const { size, name } of iconSizes) {
    console.log(`📱 Creating ${name} (${size}×${size})`);
    const canvas = createIcon(size);
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(path.join(publicDir, name), buffer);
  }

  // Generate favicon.ico (using 32x32 PNG data)
  console.log("🔖 Creating favicon.ico");
  const faviconBuffer = generateFavicon();
  fs.writeFileSync(path.join(publicDir, "favicon.ico"), faviconBuffer);

  // Generate safari-pinned-tab.svg
  console.log("🍎 Creating safari-pinned-tab.svg");
  const safariSvg = generateSafariPinnedTab();
  fs.writeFileSync(path.join(publicDir, "safari-pinned-tab.svg"), safariSvg);

  console.log("\n✅ All PWA icons generated successfully!");
  console.log(`📁 Icons saved to: ${publicDir}`);
  console.log("\n📱 Generated files:");

  // List all generated files
  const files = fs
    .readdirSync(publicDir)
    .filter(
      (file) =>
        file.startsWith("icon-") ||
        file.startsWith("favicon") ||
        file.startsWith("apple-touch-icon") ||
        file === "safari-pinned-tab.svg"
    );

  files.forEach((file) => {
    const stats = fs.statSync(path.join(publicDir, file));
    console.log(`   ${file} (${Math.round(stats.size / 1024)}KB)`);
  });

  console.log("\n🚀 Ready for PWA deployment!");
}

// Check if canvas module is available
try {
  require("canvas");
  generateAllIcons().catch(console.error);
} catch (error) {
  console.error("❌ Canvas module not found. Please install it first:");
  console.error("npm install canvas");
  console.error(
    "\nAlternatively, use the HTML-based generator in the browser:"
  );
  console.error("scripts/pwa-icon-generator.html");
  process.exit(1);
}
