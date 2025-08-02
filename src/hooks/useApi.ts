import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logApiError } from '@/lib/utils';
import { GoogleAuthService } from '@/services/authService';

export const useApi = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const googleAuthService = new GoogleAuthService();

  const callFunction = useCallback(async (functionName: string, body?: any, method: string = 'POST') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated - please sign in');
      }

      console.log(`🚀 Calling function: ${functionName}`, { body, method });

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: body || null,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        console.error(`❌ Function ${functionName} error:`, error);
        logApiError(functionName, error);
        
        // Provide more specific error messages
        if (error.message?.includes('500')) {
          throw new Error(`Server error in ${functionName}. This might be due to missing configuration or database issues.`);
        }
        
        throw new Error(error.message || `Function ${functionName} failed`);
      }

      console.log(`✅ Function ${functionName} response:`, data);
      return data;
    } catch (error: any) {
      console.error(`🔥 Error calling ${functionName}:`, error);
      logApiError(functionName, error);
      
      // Don't show toast for authentication errors, let the auth system handle it
      if (!error.message?.includes('Not authenticated')) {
        toast({
          title: 'API Error',
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive',
        });
      }
      
      throw error;
    }
  }, [toast]);

  // Agent Management
  const createAgent = useCallback(async (agentData: any) => {
    return await callFunction('agents', agentData);
  }, [callFunction]);

  const getAgents = useCallback(async () => {
    return await callFunction('agents', null, 'GET');
  }, [callFunction]);

  const getAgent = useCallback(async (agentId: string) => {
    return await callFunction(`agents/${agentId}`, null, 'GET');
  }, [callFunction]);

  const updateAgent = useCallback(async (agentId: string, updates: any) => {
    return await callFunction(`agents/${agentId}`, updates, 'PUT');
  }, [callFunction]);

  const deleteAgent = useCallback(async (agentId: string) => {
    return await callFunction(`agents/${agentId}`, null, 'DELETE');
  }, [callFunction]);

  const executeAgent = useCallback(async (agentId: string, triggerData?: any) => {
    return await callFunction('execute-agent', {
      agent_id: agentId,
      trigger_data: triggerData || {},
    });
  }, [callFunction]);

  // Service Connections
  const getServiceConnections = useCallback(async () => {
    return await callFunction('service-connections', null, 'GET');
  }, [callFunction]);

  const connectService = useCallback(async (serviceData: any) => {
    return await callFunction('service-connections', serviceData);
  }, [callFunction]);

  const disconnectService = useCallback(async (serviceType: string) => {
    return await callFunction(`service-connections/${serviceType}`, null, 'DELETE');
  }, [callFunction]);

  // Google OAuth
  const startGoogleOAuth = useCallback(async () => {
    try {
      // Build the OAuth URL
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = 'https://fifvgsxcflsfrwamfroy.supabase.co/functions/v1/google-oauth/callback';
      
      // Gmail scopes needed
      const SCOPES = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify'
      ].join(' ');
      
      // Build the OAuth URL
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`;
      
      return { url: authUrl };
    } catch (error) {
      console.error('Error starting Google OAuth:', error);
      throw error;
    }
  }, [googleAuthService]);

  const exchangeGoogleCode = useCallback(async (code: string) => {
    setLoading(true);
    try {
      const tokens = await googleAuthService.getTokensFromCode(code);
      
      // Store tokens securely (in a real app, consider more secure storage)
      localStorage.setItem('gmailAccessToken', tokens.accessToken);
      localStorage.setItem('gmailRefreshToken', tokens.refreshToken);
      localStorage.setItem('gmailTokenExpiry', String(Date.now() + tokens.expiresIn * 1000));
      
      return { success: true };
    } catch (error) {
      console.error('Error exchanging code:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [googleAuthService]);

  // Workflow Templates
  const getWorkflowTemplates = useCallback(async (category?: string, triggerType?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (triggerType) params.append('trigger_type', triggerType);
    
    return await callFunction(`workflow-templates?${params.toString()}`, null, 'GET');
  }, [callFunction]);

  const createWorkflowTemplate = useCallback(async (templateData: any) => {
    return await callFunction('workflow-templates', templateData);
  }, [callFunction]);

  // Agent Logs
  const getAgentLogs = useCallback(async (filters?: { agentId?: string; status?: string; limit?: number; offset?: number }) => {
    const params = new URLSearchParams();
    if (filters?.agentId) params.append('agent_id', filters.agentId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    return await callFunction(`agent-logs?${params.toString()}`, null, 'GET');
  }, [callFunction]);

  const getAgentLog = useCallback(async (executionId: string) => {
    return await callFunction(`agent-logs/${executionId}`, null, 'GET');
  }, [callFunction]);

  const retryExecution = useCallback(async (executionId: string) => {
    return await callFunction(`agent-logs/${executionId}/retry`, {});
  }, [callFunction]);

  return {
    // Agent Management
    createAgent,
    getAgents,
    getAgent,
    updateAgent,
    deleteAgent,
    executeAgent,
    
    // Service Connections
    getServiceConnections,
    connectService,
    disconnectService,
    
    // OAuth
    startGoogleOAuth,
    exchangeGoogleCode,
    
    // Workflow Templates
    getWorkflowTemplates,
    createWorkflowTemplate,
    
    // Agent Logs
    getAgentLogs,
    getAgentLog,
    retryExecution,
  };
}