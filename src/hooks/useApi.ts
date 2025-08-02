import { useState } from 'react';
import { GoogleAuthService } from '@/services/authService';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const googleAuthService = new GoogleAuthService();

  const startGoogleOAuth = async () => {
    try {
      const authUrl = googleAuthService.getAuthUrl();
      return { url: authUrl };
    } catch (error) {
      console.error('Error starting Google OAuth:', error);
      throw error;
    }
  };

  const connectService = async ({ service_type, config }: { service_type: string, config: any }) => {
    setLoading(true);
    try {
      console.log(`Connecting ${service_type} with config:`, config);
      // In a real app, you'd call your backend API
      return { success: true };
    } catch (error) {
      console.error(`Error connecting ${service_type}:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async (agentData: any) => {
    setLoading(true);
    try {
      console.log('Creating agent with data:', agentData);
      // Simulate a successful API call
      return { id: 'agent-' + Date.now() };
    } catch (error) {
      console.error('Failed to create agent:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    startGoogleOAuth,
    connectService,
    createAgent
  };
};