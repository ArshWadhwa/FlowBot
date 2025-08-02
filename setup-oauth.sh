#!/bin/bash

# FlowBot AI - Google OAuth Setup Script
# This script helps you set up the required environment variables for Google OAuth

echo "🚀 FlowBot AI - Google OAuth Setup"
echo "=================================="
echo ""

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    exit 1
fi

echo "📝 Please provide your Google OAuth credentials:"
echo "   (Get these from Google Cloud Console > APIs & Services > Credentials)"
echo ""

# Get Google Client ID
read -p "🔑 Enter your Google OAuth Client ID: " GOOGLE_CLIENT_ID
if [ -z "$GOOGLE_CLIENT_ID" ]; then
    echo "❌ Google Client ID is required"
    exit 1
fi

# Get Google Client Secret
read -s -p "🔐 Enter your Google OAuth Client Secret: " GOOGLE_CLIENT_SECRET
echo ""
if [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "❌ Google Client Secret is required"
    exit 1
fi

# Get OpenRouter API Key (for LLM functionality)
read -s -p "🧠 Enter your OpenRouter API Key (for LLM functionality): " OPENROUTER_API_KEY
echo ""
if [ -z "$OPENROUTER_API_KEY" ]; then
    echo "⚠️  OpenRouter API Key is optional but required for LLM functionality"
fi

echo ""
echo "🔧 Setting up Supabase secrets..."

# Set Google OAuth secrets
echo "Setting GOOGLE_CLIENT_ID..."
supabase secrets set GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" --project-ref fifvgsxcflsfrwamfroy

echo "Setting GOOGLE_CLIENT_SECRET..."
supabase secrets set GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" --project-ref fifvgsxcflsfrwamfroy

# Set OpenRouter API Key if provided
if [ ! -z "$OPENROUTER_API_KEY" ]; then
    echo "Setting OPENROUTER_API_KEY..."
    supabase secrets set OPENROUTER_API_KEY="$OPENROUTER_API_KEY" --project-ref fifvgsxcflsfrwamfroy
fi

echo ""
echo "✅ Secrets configured successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Make sure you've enabled Gmail API in Google Cloud Console"
echo "   2. Add this redirect URI to your Google OAuth app:"
echo "      https://fifvgsxcflsfrwamfroy.supabase.co/functions/v1/google-oauth/callback"
echo "   3. Restart your development server"
echo "   4. Try connecting Gmail in your FlowBot AI app"
echo ""
echo "🎉 Setup complete! Your FlowBot AI is ready for Gmail integration."
