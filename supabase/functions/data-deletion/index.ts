// Supabase Edge Function for handling data deletion requests

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { corsHeaders } from "../_shared/cors.ts";

interface FacebookDeletionRequest {
  signed_request: string;
}

interface DeletionResponse {
  url?: string;
  confirmation_code?: string;
  success: boolean;
  message?: string;
}

// Function to parse and verify the Facebook signed request
function parseSignedRequest(signedRequest: string, appSecret: string): Record<string, any> {
  // Split the signed request into signature and payload
  const [encodedSig, payload] = signedRequest.split(".", 2);
  
  // In a real implementation, we would verify the signature here
  // For demo purposes, we'll skip the verification
  console.log("Would verify signature with app secret:", appSecret);
  
  // Parse the payload
  const data = JSON.parse(atob(payload));
  
  return data;
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
    if (req.method === "POST") {
      // Parse request body
      const { signed_request } = await req.json() as FacebookDeletionRequest;
      
      if (!signed_request) {
        throw new Error("Missing signed_request parameter");
      }
      
      // Get the app secret from environment
      const appSecret = Deno.env.get("FACEBOOK_APP_SECRET") || "mock-app-secret";
      
      // Parse the signed request
      const data = parseSignedRequest(signed_request, appSecret);
      const userId = data.user_id;
      
      if (!userId) {
        throw new Error("Invalid signed_request - missing user_id");
      }
      
      // Create a Supabase client
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // In a real implementation, this would:
      // 1. Find the user associated with this Facebook ID
      // 2. Delete or anonymize all their data
      // 3. Log the deletion for compliance purposes
      
      // For demo, we'll simulate the process
      console.log(`Processing deletion for Facebook user ID: ${userId}`);
      
      // Generate a confirmation code
      const confirmationCode = `del_${userId}_${Date.now()}`;
      
      // In production, you'd save this to your database
      console.log(`Generated confirmation code: ${confirmationCode}`);
      
      // Create deletion record
      await supabase
        .from("deletion_logs")
        .insert({
          external_id: userId,
          source: "facebook",
          confirmation_code: confirmationCode,
          status: "completed",
          created_at: new Date().toISOString()
        });
      
      // Return the confirmation
      const response: DeletionResponse = {
        url: `${req.url.split("/functions/")[0]}/privacy/deletion-status?c=${confirmationCode}`,
        confirmation_code: confirmationCode,
        success: true
      };
      
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    } else {
      throw new Error(`Method ${req.method} not allowed`);
    }
  } catch (error) {
    console.error("Error:", error);
    
    const errorResponse: DeletionResponse = {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});