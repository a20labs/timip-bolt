#!/usr/bin/env node

/**
 * Icon Generator Script for TIMIP - Using canvas approach
 * Converts truindee-icon-7.svg to all required icon formats
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 Starting icon generation from truindee-icon-7.svg...");

const publicDir = path.join(process.cwd(), "public");
const svgPath = path.join(publicDir, "truindee-icon-7.svg");

// Check if we have ImageMagick available
try {
  execSync("which convert", { stdio: "ignore" });
  console.log("✅ ImageMagick found - using high quality conversion");
  useImageMagick();
} catch (error) {
  console.log("⚠️  ImageMagick not found - trying alternative approach");
  try {
    const sharp = require("sharp");
    console.log("✅ Sharp found - using Sharp for conversion");
    useSharp();
  } catch (error) {
    console.log("⚠️  Sharp not available - using Node.js canvas approach");
    useNodeCanvas();
  }
}

function useImageMagick() {
  const sizes = [
    { name: "favicon-16x16.png", size: 16 },
    { name: "favicon-32x32.png", size: 32 },
    { name: "icon-72x72.png", size: 72 },
    { name: "icon-96x96.png", size: 96 },
    { name: "icon-128x128.png", size: 128 },
    { name: "icon-144x144.png", size: 144 },
    { name: "icon-152x152.png", size: 152 },
    { name: "apple-touch-icon.png", size: 180 },
    { name: "icon-192x192.png", size: 192 },
    { name: "icon-384x384.png", size: 384 },
    { name: "icon-512x512.png", size: 512 }
  ];

  let successCount = 0;

  for (const { name, size } of sizes) {
    try {
      const outputPath = path.join(publicDir, name);
      const command = `convert "${svgPath}" -resize ${size}x${size} -background transparent "${outputPath}"`;

      console.log(`⚙️  Generating ${name} (${size}x${size})...`);
      execSync(command, { stdio: "ignore" });
      console.log(`✅ Generated ${name}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error generating ${name}:`, error.message);
    }
  }

  // Generate favicon.ico
  try {
    console.log("⚙️  Generating favicon.ico...");
    const faviconCommand = `convert "${svgPath}" -resize 32x32 -background transparent "${path.join(
      publicDir,
      "favicon.ico"
    )}"`;
    execSync(faviconCommand, { stdio: "ignore" });
    console.log("✅ Generated favicon.ico");
    successCount++;
  } catch (error) {
    console.error("❌ Error generating favicon.ico:", error.message);
  }

  console.log(
    `\n🎉 ImageMagick conversion complete! Generated ${successCount} icons.`
  );
}

async function useSharp() {
  const sharp = require("sharp");

  const sizes = [
    { name: "favicon-16x16.png", size: 16 },
    { name: "favicon-32x32.png", size: 32 },
    { name: "icon-72x72.png", size: 72 },
    { name: "icon-96x96.png", size: 96 },
    { name: "icon-128x128.png", size: 128 },
    { name: "icon-144x144.png", size: 144 },
    { name: "icon-152x152.png", size: 152 },
    { name: "apple-touch-icon.png", size: 180 },
    { name: "icon-192x192.png", size: 192 },
    { name: "icon-384x384.png", size: 384 },
    { name: "icon-512x512.png", size: 512 }
  ];

  const svgBuffer = fs.readFileSync(svgPath);
  let successCount = 0;

  for (const { name, size } of sizes) {
    try {
      const outputPath = path.join(publicDir, name);

      console.log(`⚙️  Generating ${name} (${size}x${size})...`);

      await sharp(svgBuffer)
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${name}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error generating ${name}:`, error.message);
    }
  }

  // Generate favicon.ico
  try {
    console.log("⚙️  Generating favicon.ico...");
    const icoPath = path.join(publicDir, "favicon.ico");

    await sharp(svgBuffer)
      .resize(32, 32, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(icoPath);

    console.log("✅ Generated favicon.ico");
    successCount++;
  } catch (error) {
    console.error("❌ Error generating favicon.ico:", error.message);
  }

  console.log(
    `\n🎉 Sharp conversion complete! Generated ${successCount} icons.`
  );
}

function useNodeCanvas() {
  console.log("🔧 This approach requires additional setup.");
  console.log(
    "💡 Please install ImageMagick or Sharp for automatic icon generation:"
  );
  console.log("   brew install imagemagick  # For ImageMagick");
  console.log("   npm install sharp         # For Sharp library");
  console.log("");
  console.log("🔄 Manual conversion instructions:");
  console.log(
    "   Use an online SVG to PNG converter or design tool to convert:"
  );
  console.log(`   Source: ${svgPath}`);
  console.log(
    "   Required sizes: 16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512"
  );
}
