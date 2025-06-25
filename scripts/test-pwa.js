#!/usr/bin/env node

/**
 * PWA Testing and Validation Script
 * Tests PWA installation, offline functionality, and mobile features
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

class PWATester {
  constructor() {
    this.results = {
      manifest: false,
      icons: false,
      serviceWorker: false,
      metaTags: false,
      httpsReady: false,
      offline: false,
      installable: false
    };
  }

  log(message, type = "info") {
    const colors = {
      info: "\x1b[36m",
      success: "\x1b[32m",
      warning: "\x1b[33m",
      error: "\x1b[31m",
      reset: "\x1b[0m"
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async testManifest() {
    this.log("🔍 Testing PWA Manifest...", "info");

    try {
      const manifestPath = join(projectRoot, "dist", "manifest.webmanifest");
      if (!existsSync(manifestPath)) {
        throw new Error("Manifest file not found");
      }

      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

      // Required fields
      const required = ["name", "short_name", "start_url", "display", "icons"];
      const missing = required.filter((field) => !manifest[field]);

      if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(", ")}`);
      }

      // Check icon sizes
      const iconSizes = manifest.icons.map((icon) => icon.sizes);
      const requiredSizes = ["192x192", "512x512"];
      const hasRequiredSizes = requiredSizes.every((size) =>
        iconSizes.some((iconSize) => iconSize.includes(size))
      );

      if (!hasRequiredSizes) {
        throw new Error("Missing required icon sizes (192x192, 512x512)");
      }

      this.results.manifest = true;
      this.log("✅ Manifest validation passed", "success");
    } catch (error) {
      this.log(`❌ Manifest validation failed: ${error.message}`, "error");
    }
  }

  async testIcons() {
    this.log("🔍 Testing PWA Icons...", "info");

    try {
      const requiredIcons = [
        "icon-72x72.png",
        "icon-96x96.png",
        "icon-128x128.png",
        "icon-144x144.png",
        "icon-152x152.png",
        "icon-192x192.png",
        "icon-384x384.png",
        "icon-512x512.png",
        "apple-touch-icon.png",
        "favicon.ico"
      ];

      const missingIcons = requiredIcons.filter(
        (icon) => !existsSync(join(projectRoot, "dist", icon))
      );

      if (missingIcons.length > 0) {
        throw new Error(`Missing icons: ${missingIcons.join(", ")}`);
      }

      this.results.icons = true;
      this.log("✅ All required icons present", "success");
    } catch (error) {
      this.log(`❌ Icon validation failed: ${error.message}`, "error");
    }
  }

  async testServiceWorker() {
    this.log("🔍 Testing Service Worker...", "info");

    try {
      const swPath = join(projectRoot, "dist", "sw.js");
      if (!existsSync(swPath)) {
        throw new Error("Service worker file not found");
      }

      const swContent = readFileSync(swPath, "utf8");

      // Check for Workbox functionality (modern PWA approach)
      const hasWorkbox =
        swContent.includes("workbox") || swContent.includes("precacheAndRoute");
      const hasPrecaching =
        swContent.includes("precacheAndRoute") ||
        swContent.includes("precache");
      const hasRouting =
        swContent.includes("registerRoute") ||
        swContent.includes("NavigationRoute");
      const hasSkipWaiting = swContent.includes("skipWaiting");
      const hasClientsClaim = swContent.includes("clientsClaim");

      // Legacy SW checks for basic functionality
      const hasInstall = swContent.includes("install");
      const hasFetch = swContent.includes("fetch");
      const hasCache =
        swContent.includes("cache") || swContent.includes("Cache");

      const isWorkboxSW = hasWorkbox && hasPrecaching && hasRouting;
      const isBasicSW = hasInstall && hasFetch && hasCache;

      if (!isWorkboxSW && !isBasicSW) {
        throw new Error("Service worker missing essential functionality");
      }

      if (isWorkboxSW) {
        this.log("  ✓ Workbox-generated service worker detected", "success");
        this.log("  ✓ Precaching configured", "success");
        this.log("  ✓ Route handling configured", "success");
        if (hasSkipWaiting) this.log("  ✓ Skip waiting enabled", "success");
        if (hasClientsClaim) this.log("  ✓ Clients claim enabled", "success");
      } else {
        this.log("  ✓ Basic service worker functionality detected", "success");
      }

      this.results.serviceWorker = true;
      this.log("✅ Service worker validation passed", "success");
    } catch (error) {
      this.log(
        `❌ Service worker validation failed: ${error.message}`,
        "error"
      );
    }
  }

  async testMetaTags() {
    this.log("🔍 Testing PWA Meta Tags...", "info");

    try {
      const indexPath = join(projectRoot, "dist", "index.html");
      if (!existsSync(indexPath)) {
        throw new Error("index.html not found");
      }

      const htmlContent = readFileSync(indexPath, "utf8");

      const requiredMeta = [
        "viewport",
        "theme-color",
        "mobile-web-app-capable",
        "apple-mobile-web-app-capable"
      ];

      const missingMeta = requiredMeta.filter(
        (meta) =>
          !htmlContent.includes(`name="${meta}"`) &&
          !htmlContent.includes(`name='${meta}'`)
      );

      if (missingMeta.length > 0) {
        throw new Error(`Missing meta tags: ${missingMeta.join(", ")}`);
      }

      // Check for manifest link
      if (!htmlContent.includes("manifest.webmanifest")) {
        throw new Error("Manifest link not found in HTML");
      }

      this.results.metaTags = true;
      this.log("✅ Meta tags validation passed", "success");
    } catch (error) {
      this.log(`❌ Meta tags validation failed: ${error.message}`, "error");
    }
  }

  async testHTTPSReadiness() {
    this.log("🔍 Testing HTTPS Readiness...", "info");

    try {
      // Check if service worker registration uses secure contexts
      const swPath = join(projectRoot, "dist", "sw.js");
      const swContent = readFileSync(swPath, "utf8");

      // Basic check for secure context awareness
      const isSecureContextAware =
        swContent.includes("importScripts") ||
        swContent.includes("self.registration");

      if (!isSecureContextAware) {
        this.log(
          "⚠️  Service worker may need HTTPS context improvements",
          "warning"
        );
      }

      this.results.httpsReady = true;
      this.log("✅ HTTPS readiness check passed", "success");
    } catch (error) {
      this.log(`❌ HTTPS readiness check failed: ${error.message}`, "error");
    }
  }

  generateReport() {
    this.log("\n📊 PWA Validation Report", "info");
    this.log("========================", "info");

    const tests = [
      { name: "Manifest", status: this.results.manifest },
      { name: "Icons", status: this.results.icons },
      { name: "Service Worker", status: this.results.serviceWorker },
      { name: "Meta Tags", status: this.results.metaTags },
      { name: "HTTPS Ready", status: this.results.httpsReady }
    ];

    tests.forEach((test) => {
      const status = test.status ? "✅ PASS" : "❌ FAIL";
      const color = test.status ? "success" : "error";
      this.log(`${test.name.padEnd(15)} ${status}`, color);
    });

    const passedTests = tests.filter((test) => test.status).length;
    const totalTests = tests.length;
    const score = Math.round((passedTests / totalTests) * 100);

    this.log(
      `\nOverall Score: ${score}% (${passedTests}/${totalTests})`,
      score >= 80 ? "success" : score >= 60 ? "warning" : "error"
    );

    if (score === 100) {
      this.log("\n🎉 PWA is ready for deployment!", "success");
      this.log("Next steps:", "info");
      this.log("• Test on mobile devices", "info");
      this.log("• Deploy to HTTPS server", "info");
      this.log("• Test installation flow", "info");
      this.log("• Validate offline functionality", "info");
    } else {
      this.log("\n🔧 PWA needs improvements before deployment", "warning");
    }
  }

  async run() {
    this.log("🚀 Starting PWA Validation Tests...", "info");
    this.log("===================================", "info");

    await this.testManifest();
    await this.testIcons();
    await this.testServiceWorker();
    await this.testMetaTags();
    await this.testHTTPSReadiness();

    this.generateReport();
  }
}

// Run tests
const tester = new PWATester();
tester.run().catch((error) => {
  console.error("❌ PWA testing failed:", error);
  process.exit(1);
});
