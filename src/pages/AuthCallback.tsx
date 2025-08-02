import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const [status, setStatus] = useState('Processing authentication...');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    async function handleCallback() {
      // Extract code from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (!code) {
        setStatus('Authentication failed: No authorization code received');
        return;
      }
      
      try {
        // Exchange code for tokens
        const googleAuthService = new GoogleAuthService();
        const { accessToken, refreshToken, expiresIn } = await googleAuthService.getTokensFromCode(code);
        
        // Store tokens securely (in a real app, you'd use a more secure storage method)
        localStorage.setItem('gmailAccessToken', accessToken);
        localStorage.setItem('gmailRefreshToken', refreshToken);
        localStorage.setItem('gmailTokenExpiry', String(Date.now() + expiresIn * 1000));
        
        // Success!
        toast({
          title: "Gmail Connected",
          description: "Your Gmail account has been successfully connected",
        });
        
        // Redirect back to the page they were on
        const redirectPath = localStorage.getItem('redirectAfterAuth') || '/settings';
        navigate(redirectPath);
      } catch (error) {
        console.error('Authentication error:', error);
        setStatus('Authentication failed. Please try again.');
        
        toast({
          title: "Connection Failed",
          description: "Failed to connect Gmail account. Please try again.",
          variant: "destructive",
        });
        
        // Redirect to settings after a short delay
        setTimeout(() => navigate('/settings'), 3000);
      }
    }
    
    handleCallback();
  }, [navigate, toast]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{status}</h1>
        <p className="text-muted-foreground">You will be redirected shortly...</p>
      </div>
    </div>
  );
}
