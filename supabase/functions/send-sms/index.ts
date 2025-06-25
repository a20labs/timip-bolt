// Supabase Edge Function for sending SMS messages via Twilio

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

// Twilio helper
const twilioClient = {
  accountSid: Deno.env.get("TWILIO_ACCOUNT_SID") || "",
  authToken: Deno.env.get("TWILIO_AUTH_TOKEN") || "",
  
  async sendSMS(to: string, from: string, body: string) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(`${this.accountSid}:${this.authToken}`)}`,
      },
      body: new URLSearchParams({
        To: to,
        From: from,
        Body: body,
      }).toString(),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Twilio API error: ${JSON.stringify(errorData)}`);
    }
    
    return await response.json();
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, from, message, workspace_id } = await req.json();

    if (!to || !from || !message || !workspace_id) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check credit balance before sending
    const { data: wallet } = await supabase.rpc("get_credit_wallet", {
      workspace_id_param: workspace_id,
    });

    if (!wallet || wallet.balance_cents <= 0) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits" }),
        {
          status: 402, // Payment Required
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Get the SMS rate
    const { data: rate } = await supabase
      .from("comm_rates")
      .select("*")
      .eq("code", "SMS_US_OUT")
      .single();
    
    if (!rate) {
      throw new Error("SMS rate not found");
    }

    // Calculate the cost
    const cost = await supabase.rpc("calculate_artist_price", {
      base_cost_cents: rate.cost_cents,
      buffer_pct: rate.buffer_pct,
      margin_pct: rate.margin_pct
    });

    // Deduct credits
    const { data: deductResult, error: deductError } = await supabase.rpc("deduct_credits", {
      workspace_id_param: workspace_id,
      amount_cents_param: cost,
      usage_id_param: null // Will be updated with Twilio SID after sending
    });

    if (deductError || !deductResult) {
      throw new Error(`Failed to deduct credits: ${deductError?.message || "Insufficient balance"}`);
    }

    // Send the SMS
    const smsResponse = await twilioClient.sendSMS(to, from, message);

    // Log the message to database
    const { data, error } = await supabase
      .from("sms_messages")
      .insert({
        workspace_id,
        to_number: to,
        from_number: from,
        message,
        status: "sent",
        twilio_sid: smsResponse.sid,
        cost_cents: cost
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Update the transaction with the Twilio SID
    await supabase
      .from("credit_transactions")
      .update({ twilio_sid: smsResponse.sid })
      .eq("workspace_id", workspace_id)
      .is("twilio_sid", null)
      .order("created_at", { ascending: false })
      .limit(1);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message_sid: smsResponse.sid,
        message_record: data 
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
      JSON.stringify({ error: error.message || "Internal server error" }),
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