// Note: For Supabase Edge Functions, use Deno.env to get environment variables

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "https://yourappdomain.netlify.app";

// These should be set as secrets in Supabase dashboard
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || "";
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";
const REDIRECT_URI = Deno.env.get("REDIRECT_URI") || 
  "https://fifvgsxcflsfrwamfroy.supabase.co/functions/v1/google-oauth/callback";

serve(async (req) => {
  // Get the code from the request
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
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Token exchange error:", data);
      throw new Error(data.error_description || "Failed to exchange code");
    }
    
    // Redirect back to frontend with tokens in hash fragment
    // Using hash fragment is more secure than query params for tokens
    return Response.redirect(
      `${FRONTEND_URL}/auth/callback#access_token=${data.access_token}&refresh_token=${data.refresh_token}&expires_in=${data.expires_in}`,
      302
    );
  } catch (error) {
    console.error("OAuth error:", error);
    
    // Redirect back with error
    return Response.redirect(
      `${FRONTEND_URL}/auth/callback#error=${encodeURIComponent(error.message || "Authentication failed")}`,
      302
    );
  }
});