// Supabase Edge Function for Eleven Labs voice synthesis

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const ELEVEN_LABS_API_KEY = Deno.env.get("ELEVEN_LABS_API_KEY") || "";

interface VoiceSynthesisRequest {
  text: string;
  voice_id: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
  };
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
    const { text, voice_id, model_id = "eleven_monolingual_v1", voice_settings } = await req.json() as VoiceSynthesisRequest;

    if (!text || !voice_id) {
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

    // Default voice settings if not provided
    const settings = voice_settings || {
      stability: 0.5,
      similarity_boost: 0.75,
    };

    // Extract the actual voice ID from our naming convention
    // e.g., "eleven-labs-rachel" -> "rachel"
    const actualVoiceId = voice_id.split('-').pop() || voice_id;

    // Map our voice IDs to Eleven Labs voice IDs
    const voiceIdMap: Record<string, string> = {
      "rachel": "21m00Tcm4TlvDq8ikWAM",
      "antoni": "ErXwobaYiN019PkySvjV",
      "bella": "EXAVITQu4vr4xnSDxMaL",
      "josh": "TxGEqnHWrfWFTfGW9XjX",
      // Add more voice mappings as needed
    };

    const elevenLabsVoiceId = voiceIdMap[actualVoiceId] || voiceIdMap["rachel"];

    // Call Eleven Labs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVEN_LABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings: settings,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Eleven Labs API error: ${JSON.stringify(errorData)}`);
    }

    // Get the audio data
    const audioData = await response.arrayBuffer();

    // Return the audio data
    return new Response(audioData, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
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