import axios from 'axios';

// Debug environment variables
console.log('VITE_GOOGLE_CLIENT_ID exists:', !!import.meta.env.VITE_GOOGLE_CLIENT_ID);

// Access environment variables properly
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

// Fallback for development if env vars are missing
if (!GOOGLE_CLIENT_ID) {
  console.error('Google Client ID is missing! Check your .env.local file.');
}

// Scopes needed for Gmail access
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.modify'
];

export class GoogleAuthService {
  // Generate OAuth URL for user consent
  getAuthUrl() {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google Client ID is not configured');
    }
    
    const scopes = encodeURIComponent(GMAIL_SCOPES.join(' '));
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent`;
  }

  // Exchange authorization code for tokens
  async getTokensFromCode(code: string) {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in
      };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken(refreshToken: string) {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      });

      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh Google access token');
    }
  }
}
