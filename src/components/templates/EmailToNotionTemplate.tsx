import { motion } from 'framer-motion';
import { Mail, Brain, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EmailToNotionTemplateProps {
  onUseTemplate: () => void;
}

export function EmailToNotionTemplate({ onUseTemplate }: EmailToNotionTemplateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className="hover-lift"
    >
      <Card className="shadow-soft hover:shadow-medium transition-all duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gmail → AI → Notion</CardTitle>
              <CardDescription>
                Automatically process emails with AI and create organized Notion pages
              </CardDescription>
            </div>
            <Badge className="bg-blue-100 text-blue-800">Popular</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Workflow Preview */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Mail className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-sm font-medium">Gmail Trigger</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium">AI Summary</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-sm font-medium">Notion Page</span>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>AI-powered summaries</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Auto-categorization</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Custom email filters</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Structured data</span>
              </div>
            </div>

            <Button 
              onClick={onUseTemplate} 
              className="w-full gradient-primary"
            >
              Use This Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
