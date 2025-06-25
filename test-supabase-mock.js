// Simple test to verify supabase mock functionality
import { supabase } from "./src/lib/supabase.ts";

console.log("Testing Supabase Mock Client...");

async function testFeatureFlags() {
  try {
    console.log("\n1. Testing feature flags query...");
    const { data, error } = await supabase.from("feature_flags").select("*");

    console.log("Feature flags data:", data);
    console.log("Error:", error);

    console.log("\n2. Testing feature flags filter...");
    const { data: filteredData, error: filterError } = await supabase
      .from("feature_flags")
      .select("*")
      .eq("name", "PHONE_DIALER");

    console.log("Filtered data:", filteredData);
    console.log("Filter error:", filterError);

    console.log("\n3. Testing lexicon categories...");
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories", { schema: "lexicon" })
      .select("*");

    console.log("Categories data:", categoriesData);
    console.log("Categories error:", categoriesError);

    console.log("\n✅ All tests completed successfully!");
  } catch (err) {
    console.error("❌ Test failed:", err);
  }
}

testFeatureFlags();
