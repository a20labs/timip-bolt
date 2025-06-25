// Supabase Edge Function for syncing Twilio pricing
// This runs nightly via Supabase scheduled functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { corsHeaders } from "../_shared/cors.ts";

// Twilio API credentials
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID") || "";
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") || "";

// Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Pricing mapping from Twilio to our internal codes
const PRICING_MAPPING = {
  "sms-outbound-us": "SMS_US_OUT",
  "sms-inbound-us": "SMS_US_IN",
  "voice-outbound-us": "VOICE_US_OUT",
  "voice-inbound-us": "VOICE_US_IN",
  "mms-outbound-us": "MMS_US_OUT",
  "mms-inbound-us": "MMS_US_IN",
  "sms-outbound-international": "SMS_INTL_OUT",
  "voice-outbound-international": "VOICE_INTL_OUT",
  "phone-number-us": "PHONE_NUMBER"
};

// Default buffer and margin percentages
const DEFAULT_BUFFER_PCT = 15;
const DEFAULT_MARGIN_PCT = 20;

// Function to fetch Twilio pricing
async function fetchTwilioPricing() {
  try {
    // In a real implementation, this would call the Twilio API
    // For demo purposes, we'll use mock data
    
    // Mock Twilio pricing data
    const mockPricing = {
      "sms-outbound-us": { cost: 0.0083 },
      "sms-inbound-us": { cost: 0.0075 },
      "voice-outbound-us": { cost: 0.013 },
      "voice-inbound-us": { cost: 0.012 },
      "mms-outbound-us": { cost: 0.015 },
      "mms-inbound-us": { cost: 0.014 },
      "sms-outbound-international": { cost: 0.035 },
      "voice-outbound-international": { cost: 0.045 },
      "phone-number-us": { cost: 0.01 }
    };
    
    return mockPricing;
  } catch (error) {
    console.error("Error fetching Twilio pricing:", error);
    throw error;
  }
}

// Function to update comm_rates table
async function updateCommRates(pricing) {
  try {
    const updates = [];
    
    for (const [twilioCode, price] of Object.entries(pricing)) {
      const internalCode = PRICING_MAPPING[twilioCode];
      
      if (internalCode) {
        // Convert dollars to cents
        const costCents = Math.round(price.cost * 100);
        
        // Upsert into comm_rates table
        const { data, error } = await supabase
          .from("comm_rates")
          .upsert({
            code: internalCode,
            cost_cents: costCents,
            buffer_pct: DEFAULT_BUFFER_PCT,
            margin_pct: DEFAULT_MARGIN_PCT
          })
          .select();
        
        if (error) {
          console.error(`Error updating rate for ${internalCode}:`, error);
        } else {
          updates.push({ code: internalCode, data });
        }
      }
    }
    
    return updates;
  } catch (error) {
    console.error("Error updating comm_rates:", error);
    throw error;
  }
}

// Function to trigger revalidation of rate sheet page
async function triggerRevalidation() {
  try {
    // In a real implementation, this would call a webhook to invalidate the cache
    // For demo purposes, we'll just log the action
    console.log("Triggering revalidation of rate sheet page");
    return { success: true };
  } catch (error) {
    console.error("Error triggering revalidation:", error);
    return { success: false, error };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Fetch Twilio pricing
    const pricing = await fetchTwilioPricing();
    
    // Update comm_rates table
    const updates = await updateCommRates(pricing);
    
    // Trigger revalidation
    const revalidation = await triggerRevalidation();
    
    return new Response(
      JSON.stringify({
        success: true,
        updates,
        revalidation,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});