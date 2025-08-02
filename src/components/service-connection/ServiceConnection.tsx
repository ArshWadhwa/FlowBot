import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GmailSetup } from '@/components/integrations/GmailSetup';

export function ServiceConnection() {
  const [notionApiKey, setNotionApiKey] = useState('');
  const [isNotionConnected, setIsNotionConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const key = localStorage.getItem('notionApiKey');
    if (key) {
      setIsNotionConnected(true);
    }
  }, []);

  const connectNotion = () => {
    if (!notionApiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Notion API key.",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem('notionApiKey', notionApiKey);
    setIsNotionConnected(true);
    toast({
      title: "Notion Connected",
      description: "Your Notion account has been successfully connected.",
    });
  };

  const disconnectNotion = () => {
    localStorage.removeItem('notionApiKey');
    setIsNotionConnected(false);
    toast({ title: "Notion Disconnected" });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gmail Setup */}
      <GmailSetup />

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
              <Button variant="outline" onClick={disconnectNotion}>
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notion-api-key">Notion API Key</Label>
                <Input
                  id="notion-api-key"
                  type="password"
                  value={notionApiKey}
                  onChange={(e) => setNotionApiKey(e.target.value)}
                  placeholder="Enter your Notion API key"
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key from the <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="underline">Notion Integrations page</a>
                </p>
              </div>
              <Button onClick={connectNotion} className="w-full">
                Connect Notion
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
            