import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleAuthService } from '@/services/authService';
import { Mail, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ServiceConnection() {
  const [notionApiKey, setNotionApiKey] = useState('');
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [isNotionConnected, setIsNotionConnected] = useState(false);
  const { toast } = useToast();
  const googleAuthService = new GoogleAuthService();

  // Connect to Gmail using OAuth
  const connectGmail = () => {
    // Store the current page URL to return after authentication
    localStorage.setItem('redirectAfterAuth', window.location.pathname);
    
    // Redirect to Google OAuth consent screen
    window.location.href = googleAuthService.getAuthUrl();
  };

  // Connect to Notion using API key
  const connectNotion = async () => {
    if (!notionApiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Notion API key",
        variant: "destructive",
      });
      return;
    }

    try {
      // Store the API key in local storage or your secure storage solution
      localStorage.setItem('notionApiKey', notionApiKey);
      
      // You could verify the API key here by making a test API call
      
      setIsNotionConnected(true);
      toast({
        title: "Notion Connected",
        description: "Your Notion account has been successfully connected",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Notion. Please check your API key.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gmail Connection Card */}
      <Card className={isGmailConnected ? "border-green-500" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Connect Gmail</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Connect your Gmail account to read emails and trigger workflows based on new messages.
          </p>
          
          {isGmailConnected ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-500">
                <span className="text-sm font-medium">Connected</span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  localStorage.removeItem('gmailAccessToken');
                  localStorage.removeItem('gmailRefreshToken');
                  setIsGmailConnected(false);
                }}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button 
              onClick={connectGmail}
              className="w-full"
            >
              Connect Gmail Account
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notion Connection Card */}
      <Card className={isNotionConnected ? "border-green-500" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Connect Notion</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Connect your Notion workspace to create pages and databases automatically.
          </p>
          
          {isNotionConnected ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-500">
                <span className="text-sm font-medium">Connected</span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  localStorage.removeItem('notionApiKey');
                  setIsNotionConnected(false);
                }}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notion-api-key">Notion API Key</Label>
                <Input
                  id="notion-api-key"
                  value={notionApiKey}
                  onChange={(e) => setNotionApiKey(e.target.value)}
                  placeholder="Enter your Notion API key"
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key from the <a href="https://www.notion.so/my-integrations" target="_blank" className="underline">Notion Integrations page</a>
                </p>
              </div>
              <Button 
                onClick={connectNotion}
                className="w-full"
              >
                Connect Notion
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
