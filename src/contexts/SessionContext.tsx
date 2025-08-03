import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '../utils/api';
import toast from 'react-hot-toast';

interface Session {
  sessionId: string;
  phoneNumber?: string;
  status: string;
  isReady: boolean;
  hasQR: boolean;
  socketConnected: boolean;
  createdAt: string;
  lastActivity: string;
  reconnectAttempts: number;
  deviceInfo?: any;
}

interface SessionContextType {
  sessions: Session[];
  loading: boolean;
  createSession: (sessionId?: string) => Promise<string>;
  deleteSession: (sessionId: string) => Promise<void>;
  reconnectSession: (sessionId: string) => Promise<void>;
  logoutSession: (sessionId: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
  getQRCode: (sessionId: string) => Promise<string | null>;
  getSessionStatus: (sessionId: string) => Promise<Session | null>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshSessions();
  }, []);

  const refreshSessions = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/api/sessions');
      if (response.success) {
        setSessions(response.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (sessionId?: string): Promise<string> => {
    try {
      const body: any = {};
      if (sessionId) {
        body.sessionId = sessionId;
      }
      
      const response = await apiRequest('/api/sessions', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create session');
      }

      await refreshSessions();
      toast.success('Session created successfully');
      return response.sessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const response = await apiRequest(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete session');
      }

      setSessions(sessions.filter(s => s.sessionId !== sessionId));
      toast.success('Session deleted successfully');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
      throw error;
    }
  };

  const reconnectSession = async (sessionId: string) => {
    try {
      const response = await apiRequest(`/api/sessions/${sessionId}/reconnect`, {
        method: 'POST',
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to reconnect session');
      }

      await refreshSessions();
      toast.success('Session reconnection initiated');
    } catch (error) {
      console.error('Error reconnecting session:', error);
      toast.error('Failed to reconnect session');
      throw error;
    }
  };

  const logoutSession = async (sessionId: string) => {
    try {
      const response = await apiRequest(`/api/sessions/${sessionId}/logout`, {
        method: 'POST',
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to logout session');
      }

      await refreshSessions();
      toast.success('Session logged out successfully');
    } catch (error) {
      console.error('Error logging out session:', error);
      toast.error('Failed to logout session');
      throw error;
    }
  };

  const getQRCode = async (sessionId: string): Promise<string | null> => {
    try {
      const response = await apiRequest(`/api/sessions/${sessionId}/qr`);
      
      if (response.success && response.qr) {
        return response.qr;
      }
      return null;
    } catch (error) {
      console.error('Error getting QR code:', error);
      throw error;
    }
  };

  const getSessionStatus = async (sessionId: string): Promise<Session | null> => {
    try {
      const response = await apiRequest(`/api/sessions/${sessionId}/status`);
      
      if (response.success) {
        return response;
      }
      return null;
    } catch (error) {
      console.error('Error getting session status:', error);
      throw error;
    }
  };

  const value = {
    sessions,
    loading,
    createSession,
    deleteSession,
    reconnectSession,
    logoutSession,
    refreshSessions,
    getQRCode,
    getSessionStatus,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};