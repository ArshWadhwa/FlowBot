// Note: For Supabase Edge Functions, use Deno.env to get environment variables

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "https://your-app.netlify.app";
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || "";
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";
const REDIRECT_URI = Deno.env.get("REDIRECT_URI") || "https://fifvgsxcflsfrwamfroy.supabase.co/functions/v1/google-oauth/callback";

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response(
      JSON.stringify({ error: "No authorization code provided" }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error || "Failed to exchange code for tokens");
    }

    // Redirect back to frontend with tokens in fragment
    // This is more secure than query params
    const redirectUrl = new URL(FRONTEND_URL + "/auth/callback");
    redirectUrl.hash = `access_token=${tokenData.access_token}&refresh_token=${tokenData.refresh_token}&expires_in=${tokenData.expires_in}`;

    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl.toString(),
      },
    });
  } catch (error) {
    console.error("OAuth error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Authentication failed" }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});