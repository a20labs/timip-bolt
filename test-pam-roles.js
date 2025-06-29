#!/usr/bin/env node

// Test PAM Service Roles
// This script tests the PAM service mock data to ensure roles are properly configured

import { pamService } from "./dist/assets/pamService.js";

async function testPAMRoles() {
  console.log("🔄 Testing PAM Service Roles...\n");

  try {
    // Initialize PAM service
    await pamService.initialize("test-org");

    // Test getting all users
    console.log("📝 All Users:");
    const allUsers = pamService.getAllUsers();
    allUsers.forEach((user) => {
      console.log(
        `  - ${user.email}: ${user.role} (Paid: ${user.isPaidSubscriber})`
      );
    });
    console.log("");

    // Test specific user lookups
    console.log("🔍 Testing specific user lookups:");
    const ayeTwenty = pamService.getUserInfo("ayetwenty@truindee.com");
    if (ayeTwenty) {
      console.log(
        `  ✅ Aye Twenty found: ${ayeTwenty.role} (Paid: ${ayeTwenty.isPaidSubscriber})`
      );
    } else {
      console.log("  ❌ Aye Twenty not found");
    }

    // Test permissions for superadmin
    console.log("\n🛡️  Testing superadmin permissions:");
    const superadminPerms = pamService.getPermissionsByRole("superadmin");
    console.log(`  - Superadmin has ${superadminPerms.length} permissions`);

    // Test permissions for indielabel
    console.log("\n🏷️  Testing indielabel permissions:");
    const indielabelPerms = pamService.getPermissionsByRole("indielabel");
    console.log(`  - Indie Label has ${indielabelPerms.length} permissions`);

    // Check for white-label permissions
    const whitelabelPerms = indielabelPerms.filter(
      (p) => p.resource === "white-label"
    );
    if (whitelabelPerms.length > 0) {
      console.log("  ✅ Indie Label has white-label access");
    } else {
      console.log("  ❌ Indie Label missing white-label access");
    }

    // Test artist users and subscription tiers
    console.log("\n🎵 Testing artist users and subscription tiers:");

    // Test demo artist
    const artistDemo = pamService.getUserInfo("artistdemo@truindee.com");
    if (artistDemo) {
      console.log(
        `  ✅ Artist Demo found: ${artistDemo.role} (Tier: ${artistDemo.subscriptionTier})`
      );

      // Test upgrade options for demo artist
      const upgradeOptions = pamService.getUpgradeOptions(
        "artistdemo@truindee.com"
      );
      console.log(
        `  📈 Upgrade options for artist demo: ${upgradeOptions.length}`
      );
      upgradeOptions.forEach((option) => {
        console.log(
          `    - ${option.name} (${option.tier}): ${option.description}`
        );
      });
    } else {
      console.log("  ❌ Artist Demo not found");
    }

    // Test starter artist
    const artistStarter = pamService.getUserInfo("artist.starter@example.com");
    if (artistStarter) {
      console.log(
        `  ✅ Artist Starter found: ${artistStarter.role} (Tier: ${artistStarter.subscriptionTier})`
      );

      // Test if they can upgrade
      const canUpgradeToPro = pamService.canUpgradeTo(
        "artist.starter@example.com",
        "pro"
      );
      const canUpgradeToEnterprise = pamService.canUpgradeTo(
        "artist.starter@example.com",
        "enterprise"
      );
      console.log(
        `  📊 Can upgrade to Pro: ${canUpgradeToPro}, to Enterprise: ${canUpgradeToEnterprise}`
      );
    } else {
      console.log("  ❌ Artist Starter not found");
    }

    console.log("\n✅ PAM Role testing completed successfully!");
  } catch (error) {
    console.error("❌ PAM testing failed:", error);
  }
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testPAMRoles();
}

export { testPAMRoles };
