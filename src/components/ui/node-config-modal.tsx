import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Brain, FileText, Webhook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: any;
  onSave: (config: any) => void;
}

export function NodeConfigModal({ isOpen, onClose, nodeData, onSave }: NodeConfigModalProps) {
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    if (nodeData?.config) {
      setConfig(nodeData.config);
    } else {
      // Set default config based on node type
      setConfig(getDefaultConfig(nodeData?.service, nodeData?.label));
    }
  }, [nodeData]);

  const getDefaultConfig = (service: string, label: string) => {
    switch (service?.toLowerCase()) {
      case 'gmail':
        return {
          checkInterval: 'hourly',
          emailFilter: '',
          markAsRead: false,
          maxEmails: 10
        };
      case 'llm':
        return {
          prompt: 'Summarize this email content and extract key information.',
          model: 'gpt-3.5-turbo',
          maxTokens: 500,
          temperature: 0.7
        };
      case 'notion':
        return {
          databaseId: '',
          titleTemplate: '{{subject}}',
          contentTemplate: '{{summary}}',
          tags: []
        };
      default:
        return {};
    }
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const renderGmailConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="check-interval">Check Interval</Label>
        <Select 
          value={config.checkInterval} 
          onValueChange={(value) => setConfig({...config, checkInterval: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5min">Every 5 minutes</SelectItem>
            <SelectItem value="15min">Every 15 minutes</SelectItem>
            <SelectItem value="hourly">Every hour</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-filter">Email Filter</Label>
        <Input
          id="email-filter"
          placeholder="e.g., subject:invoice OR from:client@company.com"
          value={config.emailFilter || ''}
          onChange={(e) => setConfig({...config, emailFilter: e.target.value})}
        />
        <p className="text-xs text-muted-foreground">
          Use Gmail search syntax to filter emails
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="max-emails">Maximum Emails per Check</Label>
        <Input
          id="max-emails"
          type="number"
          min="1"
          max="50"
          value={config.maxEmails || 10}
          onChange={(e) => setConfig({...config, maxEmails: parseInt(e.target.value)})}
        />
      </div>
    </div>
  );

  const renderLLMConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt">AI Prompt</Label>
        <Textarea
          id="prompt"
          placeholder="Enter your prompt for processing the email..."
          value={config.prompt || ''}
          onChange={(e) => setConfig({...config, prompt: e.target.value})}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Use {'{subject}'}, {'{body}'}, {'{from}'} to reference email data
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="model">AI Model</Label>
        <Select 
          value={config.model} 
          onValueChange={(value) => setConfig({...config, model: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="max-tokens">Max Tokens</Label>
          <Input
            id="max-tokens"
            type="number"
            min="100"
            max="2000"
            value={config.maxTokens || 500}
            onChange={(e) => setConfig({...config, maxTokens: parseInt(e.target.value)})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature</Label>
          <Input
            id="temperature"
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={config.temperature || 0.7}
            onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
          />
        </div>
      </div>
    </div>
  );

  const renderNotionConfig = () => {
    // Initialize variables with safe default values
    const titleTemplate = config?.titleTemplate || 'Summary: {{email_subject}}';
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="database-id">Notion Database ID</Label>
          <Input
            id="database-id"
            placeholder="Paste your Notion database ID here"
            value={config.databaseId || ''}
            onChange={(e) => setConfig({...config, databaseId: e.target.value})}
          />
          <p className="text-xs text-muted-foreground">
            Copy the database ID from your Notion database URL
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title-template">Page Title Template</Label>
          <Input
            id="title-template"
            placeholder="e.g., Summary: {{email_subject}}"
            value={titleTemplate}
            onChange={(e) => setConfig({...config, titleTemplate: e.target.value})}
          />
          <p className="text-xs text-muted-foreground">
            Use {'{{email_subject}}'} as placeholder for email subject
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content-template">Page Content Template</Label>
          <Textarea
            id="content-template"
            placeholder="e.g., {{summary}}\n\nAction Items:\n{{actionItems}}"
            value={config.contentTemplate || ''}
            onChange={(e) => setConfig({...config, contentTemplate: e.target.value})}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Use {'{{summary}}'}, {'{{actionItems}}'}, {'{{priority}}'}, {'{{tags}}'} from AI output
          </p>
        </div>
      </div>
    );
  };

  const getIcon = () => {
    switch (nodeData?.service?.toLowerCase()) {
      case 'gmail': return <Mail className="h-5 w-5" />;
      case 'llm': return <Brain className="h-5 w-5" />;
      case 'notion': return <FileText className="h-5 w-5" />;
      default: return <Webhook className="h-5 w-5" />;
    }
  };

  const renderConfigContent = () => {
    switch (nodeData?.service?.toLowerCase()) {
      case 'gmail': return renderGmailConfig();
      case 'llm': return renderLLMConfig();
      case 'notion': return renderNotionConfig();
      default: return <p>No configuration available for this node type.</p>;
    }
  };

  if (!nodeData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getIcon()}
            <span>Configure {nodeData.label}</span>
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {renderConfigContent()}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gradient-primary">
              Save Configuration
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}