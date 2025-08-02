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
      // In a real app, you would send this to your backend
      console.log(`Connected ${service_type} with config:`, config);
      
      // For now, just store that the service is connected
      localStorage.setItem(`${service_type}Connected`, 'true');
      localStorage.setItem(`${service_type}Config`, JSON.stringify(config));
      
      return true;
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
      // Simulate API call
      console.log('Creating agent:', agentData);
      return { id: 'agent-' + Date.now() };
    } catch (error) {
      console.error('Error creating agent:', error);
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