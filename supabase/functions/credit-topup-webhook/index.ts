// Supabase Edge Function for handling Stripe webhook events for credit top-ups
// This processes successful checkout sessions and adds credits to the wallet

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { corsHeaders } from "../_shared/cors.ts";

// Stripe webhook secret
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

// Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to verify Stripe webhook signature
function verifyStripeSignature(payload, signature) {
  // In a real implementation, this would verify the signature using crypto
  // For demo purposes, we'll assume the signature is valid
  return true;
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
    // Get the signature from the headers
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }
    
    // Get the raw body
    const body = await req.text();
    
    // Verify the signature
    const isValid = verifyStripeSignature(body, signature);
    
    if (!isValid) {
      throw new Error("Invalid Stripe signature");
    }
    
    // Parse the event
    const event = JSON.parse(body);
    
    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      
      // Get the workspace ID and amount from the metadata
      const workspaceId = session.metadata.workspace_id;
      const amountCents = parseInt(session.metadata.amount_cents);
      
      if (!workspaceId || !amountCents) {
        throw new Error("Missing workspace_id or amount_cents in metadata");
      }
      
      // Add credits to the wallet
      const { error } = await supabase.rpc("add_credits", {
        workspace_id_param: workspaceId,
        amount_cents_param: amountCents,
        payment_id_param: session.payment_intent
      });
      
      if (error) {
        throw error;
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Credits added successfully",
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    // Return a 200 response for other event types
    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook received",
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
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});