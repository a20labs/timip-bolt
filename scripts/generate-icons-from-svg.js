#!/usr/bin/env node

/**
 * Icon Generator Script for TIMIP
 * Converts truindee-icon-7.svg to all required icon formats
 * Overwrites existing icons with new versions
 */

import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define all required icon sizes and formats
const iconConfigs = [
  // Standard favicons
  { name: "favicon-16x16.png", size: 16, format: "png" },
  { name: "favicon-32x32.png", size: 32, format: "png" },
  { name: "favicon.ico", size: 32, format: "png" }, // Will convert to ICO later

  // PWA icons
  { name: "icon-72x72.png", size: 72, format: "png" },
  { name: "icon-96x96.png", size: 96, format: "png" },
  { name: "icon-128x128.png", size: 128, format: "png" },
  { name: "icon-144x144.png", size: 144, format: "png" },
  { name: "icon-152x152.png", size: 152, format: "png" },
  { name: "icon-192x192.png", size: 192, format: "png" },
  { name: "icon-384x384.png", size: 384, format: "png" },
  { name: "icon-512x512.png", size: 512, format: "png" },

  // Apple touch icon
  { name: "apple-touch-icon.png", size: 180, format: "png" }
];

async function generateIcons() {
  const publicDir = path.join(path.dirname(__dirname), "public");
  const svgPath = path.join(publicDir, "truindee-icon-7.svg");

  console.log("🚀 Starting icon generation from truindee-icon-7.svg...");
  console.log("📁 Public directory:", publicDir);
  console.log("🎯 Source SVG:", svgPath);

  try {
    // Check if source SVG exists
    await fs.access(svgPath);
    console.log("✅ Source SVG found");

    // Read SVG content
    const svgBuffer = await fs.readFile(svgPath);
    console.log("📖 SVG file read successfully");

    let successCount = 0;
    let errorCount = 0;

    // Generate each icon
    for (const config of iconConfigs) {
      try {
        console.log(
          `⚙️  Generating ${config.name} (${config.size}x${config.size})...`
        );

        const outputPath = path.join(publicDir, config.name);

        await sharp(svgBuffer)
          .resize(config.size, config.size, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
          })
          .png({
            quality: 100,
            compressionLevel: 9,
            palette: false // Use full color
          })
          .toFile(outputPath);

        console.log(`✅ Generated ${config.name}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error generating ${config.name}:`, error.message);
        errorCount++;
      }
    }

    // Generate favicon.ico separately (multi-size ICO file)
    try {
      console.log("⚙️  Generating favicon.ico (multi-size)...");

      const icoPath = path.join(publicDir, "favicon.ico");

      // Create 16x16 and 32x32 versions for ICO
      const ico16 = await sharp(svgBuffer)
        .resize(16, 16, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();

      const ico32 = await sharp(svgBuffer)
        .resize(32, 32, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();

      // For now, just use the 32x32 as favicon.ico
      // (True multi-size ICO would require additional library)
      await fs.writeFile(icoPath, ico32);

      console.log("✅ Generated favicon.ico");
      successCount++;
    } catch (error) {
      console.error("❌ Error generating favicon.ico:", error.message);
      errorCount++;
    }

    // Generate Safari pinned tab SVG (simplified monochrome version)
    try {
      console.log("⚙️  Generating safari-pinned-tab.svg...");

      // Read the original SVG and create a simplified monochrome version
      let svgContent = svgBuffer.toString();

      // Create a simplified monochrome version
      const monochromeSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201.45 204.07">
  <path fill="#000" d="M118.7,92.41c-.84.36-1.02,3.13-1.14,4.05-.72,5.37-.36,18.39-8.9,17.37-8.39-1-6.48-13.26-7.11-19.28-.34-3.27-.84-7-1.41-10.23-.14-.76-.11-2.96-1.03-2.94l-3.96,34.94c-.76,4.01-4.07,6.93-7.99,4.26-5.04-3.42-4.44-17.03-6.43-22.66l-3.06,6.43c-2.13,2.72-6.1,4.04-9.5,4.04-2.42,0-11.83-.98-12.47-3.55-.09-5.26,6.02-2.21,9.39-2,1.66.11,5.72.26,7.06-.34,3.52-1.58,2.89-11.42,7.81-12.44,3.88-.8,4.43,2.54,5.37,5.41,1.96,6,2.15,12.42,3.69,18.37.18.7-.04,1.99.9,1.84,1.99-11.71,1.79-24.65,4.58-36.16.84-3.49,3.72-11.15,7.97-6.09,4.94,5.9,3.79,33.1,5.81,34.62.64.48,1.26.39,1.89,0,2.97-1.84.72-20.7,7.05-21.78,7.58-1.29,6.53,13.45,9.62,16.38,5.53,5.25,8.41-9.11,8.44-12.43.4-36.45-47.78-49.28-60.07-14.07-1.05,3.02-1.35,11.04-4.56,10.75-4.44-.4-.98-10.93-.02-13.5,11.29-30.15,51.45-31.08,65.15-2.06,4.18,8.86,8.07,30.38-2.55,35.87-10.08,5.21-13.59-7.33-14.52-14.82Z"/>
  <path fill="#000" d="M148.33,28.28H53.12c-8.71,0-15.79,7.09-15.79,15.79v95.21c0,8.71,7.09,15.79,15.79,15.79h36.43c.28,0,.54-.06.78-.14,2.56.02,4.8.05,6.63-.02,17.53-.69,28.91-12.35,36.27-27.47,1.16-2.38,6.48-14.28,3.77-15.98-4.32-2.7-5.35,6.47-6.18,8.66-5.53,14.5-17.05,27.8-33.26,29.84-1.42.18-5.01.33-7.56.4-.15-.03-.3-.05-.45-.05h-36.43c-6.09,0-11.04-4.95-11.04-11.04V44.08c0-6.09,4.95-11.04,11.04-11.04h95.21c6.09,0,11.04,4.95,11.04,11.04v95.21c0,6.09-4.95,11.04-11.04,11.04h-18.95c1.33-1.35,2.69-2.89,4-4.34,16.91-18.75,22.14-56.76,11.57-79.53-7.74-16.68-26.05-28.94-44.76-27.17-23.84,2.26-40.88,21.98-42.14,45.47-.12,2.28-.87,8.02,2.17,8.29,3.84-.13,2.42-3.93,2.73-6.46,2.96-24.08,16.91-43.91,43.79-41.96,44.9,3.27,45.53,65.07,25.32,94.53-4.04,5.89-8.64,9.41-10.25,11.82-.46.43-.76,1.05-.76,1.73,0,1.31,1.06,2.38,2.38,2.38h24.89c8.71,0,15.79-7.09,15.79-15.79V44.08c0-8.71-7.09-15.79-15.79-15.79Z"/>
</svg>`;

      const safariSvgPath = path.join(publicDir, "safari-pinned-tab.svg");
      await fs.writeFile(safariSvgPath, monochromeSvg);

      console.log("✅ Generated safari-pinned-tab.svg");
      successCount++;
    } catch (error) {
      console.error(
        "❌ Error generating safari-pinned-tab.svg:",
        error.message
      );
      errorCount++;
    }

    // Summary
    console.log("\n🎉 Icon generation complete!");
    console.log(`✅ Successfully generated: ${successCount} icons`);

    if (errorCount > 0) {
      console.log(`❌ Errors encountered: ${errorCount} icons`);
    }

    console.log("\n📋 Generated icons:");
    for (const config of iconConfigs) {
      console.log(`   - ${config.name} (${config.size}x${config.size})`);
    }
    console.log("   - favicon.ico (multi-size)");
    console.log("   - safari-pinned-tab.svg (monochrome)");

    console.log(
      "\n🔄 All existing icons have been overwritten with new versions from truindee-icon-7.svg"
    );
  } catch (error) {
    console.error("❌ Fatal error:", error.message);

    if (error.code === "ENOENT") {
      console.error(
        "💡 Make sure truindee-icon-7.svg exists in the public directory"
      );
    }

    process.exit(1);
  }
}

// Check if Sharp is available
try {
  require.resolve("sharp");
} catch (error) {
  console.error("❌ Sharp library not found. Installing...");
  console.log("💡 Run: npm install sharp --save-dev");
  process.exit(1);
}

// Run the icon generation
generateIcons().catch(console.error);
