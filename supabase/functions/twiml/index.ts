// Supabase Edge Function for generating TwiML for Twilio calls

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

    // Generate TwiML for the call
    const twiml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="alice">Hello, this is ${agent} from TruIndee. How can I help you today?</Say>
        <Gather input="speech" action="${url.origin}/functions/v1/twiml-response?agent=${encodeURIComponent(agent)}" method="POST">
          <Say voice="alice">Please tell me what you need assistance with.</Say>
        </Gather>
        <Say voice="alice">I didn't hear anything. Goodbye.</Say>
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
        <Say voice="alice">Sorry, there was an error processing your call. Please try again later.</Say>
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