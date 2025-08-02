import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const [status, setStatus] = useState('Processing authentication...');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Handle the callback
    const handleCallback = () => {
      // Get tokens from URL hash fragment
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      
      // Check for error
      const error = params.get('error');
      if (error) {
        setStatus(`Authentication failed: ${error}`);
        toast({
          title: "Connection Failed",
          description: error,
          variant: "destructive",
        });
        setTimeout(() => navigate('/settings'), 3000);
        return;
      }
      
      // Get tokens
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const expiresIn = params.get('expires_in');
      
      if (!accessToken || !refreshToken) {
        setStatus('Authentication failed: Missing tokens');
        toast({
          title: "Connection Failed",
          description: "Failed to receive authentication tokens",
          variant: "destructive",
        });
        setTimeout(() => navigate('/settings'), 3000);
        return;
      }
      
      // Store tokens
      localStorage.setItem('gmailAccessToken', accessToken);
      localStorage.setItem('gmailRefreshToken', refreshToken);
      
      // Calculate expiry time
      const expiryTime = Date.now() + (parseInt(expiresIn || '3600') * 1000);
      localStorage.setItem('gmailTokenExpiry', expiryTime.toString());
      
      // Success notification
      toast({
        title: "Gmail Connected",
        description: "Your Gmail account has been successfully connected",
      });
      
      // Navigate back to settings
      navigate('/settings');
    };
    
    handleCallback();
  }, [navigate, toast]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">{status}</h2>
        <p className="text-muted-foreground">You will be redirected shortly...</p>
      </div>
    </div>
  );
}
