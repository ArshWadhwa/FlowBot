import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';

export function GmailSetup() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [emailFilter, setEmailFilter] = useState('');
  const { toast } = useToast();
  const { startGoogleOAuth, connectService } = useApi();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const authUrl = await startGoogleOAuth();
      if (authUrl?.url) {
        // Open OAuth popup
        const popup = window.open(
          authUrl.url, 
          'gmail-oauth', 
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );
        
        // Listen for OAuth completion
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // Check if connection was successful
            setTimeout(async () => {
              try {
                await connectService({
                  service_type: 'gmail',
                  config: {
                    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
                    filters: emailFilter ? [emailFilter] : []
                  }
                });
                setIsConnected(true);
                toast({
                  title: "Gmail Connected!",
                  description: "Your Gmail account is now connected and ready to use.",
                });
              } catch (error) {
                toast({
                  title: "Connection Failed",
                  description: "Failed to complete Gmail connection. Please try again.",
                  variant: "destructive",
                });
              }
              setIsConnecting(false);
            }, 1000);
          }
        }, 1000);
      }
    } catch (error) {
      setIsConnecting(false);
      toast({
        title: "Connection Error",
        description: "Failed to start Gmail connection process.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Gmail Integration</span>
            {isConnected && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email-filter">Email Filter (Optional)</Label>
                <Input
                  id="email-filter"
                  placeholder="e.g., subject:invoice OR from:client@company.com"
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Use Gmail search syntax to filter which emails trigger the workflow
                </p>
              </div>
              
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full gradient-primary"
              >
                {isConnecting ? (
                  <>
                    <Settings className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Connect Gmail Account
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">
                Gmail is connected and ready to use in your workflows
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
