// Supabase Edge Function for Twilio phone dialer

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

// Twilio helper
const twilioClient = {
  accountSid: Deno.env.get("TWILIO_ACCOUNT_SID") || "",
  authToken: Deno.env.get("TWILIO_AUTH_TOKEN") || "",
  
  async makeCall(to: string, from: string, twimlUrl: string) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Calls.json`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(`${this.accountSid}:${this.authToken}`)}`,
      },
      body: new URLSearchParams({
        To: to,
        From: from,
        Url: twimlUrl,
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
    const { to, from, workspace_id, agent_name } = await req.json();

    if (!to || !from || !workspace_id) {
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

    // Generate a TwiML URL for the call
    // In a real implementation, this would be a URL to a TwiML document
    // that Twilio would use to control the call flow
    const twimlUrl = `${supabaseUrl}/functions/v1/twiml?agent=${encodeURIComponent(agent_name || "PAM")}`;

    // Make the call using Twilio
    const callResponse = await twilioClient.makeCall(to, from, twimlUrl);

    // Log the call to the database
    const { data, error } = await supabase
      .from("phone_calls")
      .insert({
        workspace_id,
        to_number: to,
        from_number: from,
        status: "initiated",
        duration: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        call_sid: callResponse.sid,
        call_record: data 
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