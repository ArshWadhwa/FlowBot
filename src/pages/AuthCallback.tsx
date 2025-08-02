import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';

export default function AuthCallback() {
  const [status, setStatus] = useState('Processing authentication...');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { exchangeGoogleCode } = useApi();
  
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
        const result = await exchangeGoogleCode(code);
        
        if (result.success) {
          // Success notification
          toast({
            title: "Gmail Connected",
            description: "Your Gmail account has been successfully connected",
          });
          
          // Close the popup if in a popup window
          if (window.opener) {
            window.close();
          } else {
            // Or redirect to settings page
            navigate('/settings');
          }
        } else {
          throw new Error('Failed to authenticate');
        }
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
  }, [navigate, toast, exchangeGoogleCode]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{status}</h1>
        <p className="text-muted-foreground">You will be redirected shortly...</p>
      </div>
    </div>
  );
}
