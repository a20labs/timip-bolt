// Supabase Edge Function for handling TwiML responses

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get the agent name from the query parameters
    const url = new URL(req.url);
    const agent = url.searchParams.get("agent") || "PAM";

    // In a real implementation, we would:
    // 1. Parse the SpeechResult from Twilio
    // 2. Send it to an LLM to generate a response
    // 3. Return TwiML with the response
    
    // For demo purposes, we'll use a simple response
    const twiml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="alice">Thank you for your question. As ${agent}, I'd be happy to help with that. I'll have someone from our team follow up with more information.</Say>
        <Pause length="1"/>
        <Say voice="alice">Is there anything else I can assist you with today?</Say>
        <Gather input="speech" action="${url.origin}/functions/v1/twiml-response?agent=${encodeURIComponent(agent)}" method="POST">
          <Say voice="alice">Please let me know if you need anything else.</Say>
        </Gather>
        <Say voice="alice">Thank you for calling. Goodbye.</Say>
        <Hangup/>
      </Response>
    `;

    return new Response(twiml, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    
    // Return a basic TwiML response in case of error
    const errorTwiml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="alice">Sorry, there was an error processing your request. Please try again later.</Say>
        <Hangup/>
      </Response>
    `;
    
    return new Response(errorTwiml, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
      },
    });
  }
});