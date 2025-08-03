import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  QrCode, 
  Trash2, 
  RefreshCw, 
  LogOut,
  CheckCircle,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../UI/LoadingSpinner';

const Sessions: React.FC = () => {
  const { 
    sessions, 
    loading, 
    createSession, 
    deleteSession, 
    reconnectSession, 
    logoutSession,
    getQRCode,
    refreshSessions 
  } = useSession();
  
  const [qrModal, setQrModal] = useState<{ isOpen: boolean; sessionId: string; qrCode: string | null }>({
    isOpen: false,
    sessionId: '',
    qrCode: null,
  });
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      refreshSessions();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [refreshSessions]);

  const handleCreateSession = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, create: true }));
      const sessionId = await createSession();
      
      // Auto-open QR modal after creating session
      setTimeout(() => {
        handleShowQR(sessionId);
      }, 1000);
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, create: false }));
    }
  };

  const handleShowQR = async (sessionId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, [sessionId]: true }));
      const qrCode = await getQRCode(sessionId);
      
      setQrModal({
        isOpen: true,
        sessionId,
        qrCode,
      });

      // Auto-refresh QR code if not available
      if (!qrCode) {
        const interval = setInterval(async () => {
          try {
            const newQrCode = await getQRCode(sessionId);
            if (newQrCode) {
              setQrModal(prev => ({ ...prev, qrCode: newQrCode }));
              clearInterval(interval);
            }
          } catch (error) {
            console.error('Error refreshing QR:', error);
          }
        }, 2000);

        // Clear interval after 30 seconds
        setTimeout(() => clearInterval(interval), 30000);
      }
    } catch (error) {
      console.error('Error getting QR code:', error);
      toast.error('Failed to get QR code');
    } finally {
      setLoadingStates(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
      setLoadingStates(prev => ({ ...prev, [sessionId]: true }));
      await deleteSession(sessionId);
    } catch (error) {
      console.error('Error deleting session:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const handleReconnectSession = async (sessionId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, [sessionId]: true }));
      await reconnectSession(sessionId);
    } catch (error) {
      console.error('Error reconnecting session:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const handleLogoutSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to logout this session?')) return;
    
    try {
      setLoadingStates(prev => ({ ...prev, [sessionId]: true }));
      await logoutSession(sessionId);
    } catch (error) {
      console.error('Error logging out session:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'authenticated':
        return 'text-emerald-600 bg-emerald-100';
      case 'connecting':
        return 'text-yellow-600 bg-yellow-100';
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'authenticated':
        return <CheckCircle className="w-4 h-4" />;
      case 'connecting':
        return <Clock className="w-4 h-4" />;
      case 'disconnected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Sessions</h1>
          <p className="text-gray-600">Manage your WhatsApp connections</p>
        </div>
        <button
          onClick={handleCreateSession}
          disabled={loadingStates.create}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loadingStates.create ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          <span>Create Session</span>
        </button>
      </div>

      {/* Sessions grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sessions Yet</h3>
          <p className="text-gray-600 mb-6">Create your first WhatsApp session to get started</p>
          <button
            onClick={handleCreateSession}
            disabled={loadingStates.create}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
          >
            {loadingStates.create ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            <span>Create First Session</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div key={session.sessionId} className="glass rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
              {/* Status badge */}
              <div className="flex items-center justify-between mb-4">
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                  {getStatusIcon(session.status)}
                  <span className="capitalize">{session.status}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(session.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Session info */}
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-semibold text-gray-900">
                    {session.phoneNumber || 'Not connected'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Session ID</p>
                  <p className="font-mono text-sm text-gray-900">
                    {session.sessionId.substring(0, 8)}...
                  </p>
                </div>

                {session.lastActivity && (
                  <div>
                    <p className="text-sm text-gray-600">Last Activity</p>
                    <p className="text-sm text-gray-900">
                      {new Date(session.lastActivity).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                {session.status === 'connecting' && (
                  <button
                    onClick={() => handleShowQR(session.sessionId)}
                    disabled={loadingStates[session.sessionId]}
                    className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {loadingStates[session.sessionId] ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <QrCode className="w-4 h-4" />
                    )}
                    <span>Show QR</span>
                  </button>
                )}

                {session.status === 'disconnected' && session.phoneNumber && (
                  <button
                    onClick={() => handleReconnectSession(session.sessionId)}
                    disabled={loadingStates[session.sessionId]}
                    className="flex items-center space-x-1 bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {loadingStates[session.sessionId] ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span>Reconnect</span>
                  </button>
                )}

                {session.status === 'authenticated' && (
                  <button
                    onClick={() => handleLogoutSession(session.sessionId)}
                    disabled={loadingStates[session.sessionId]}
                    className="flex items-center space-x-1 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {loadingStates[session.sessionId] ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    <span>Logout</span>
                  </button>
                )}

                <button
                  onClick={() => handleDeleteSession(session.sessionId)}
                  disabled={loadingStates[session.sessionId]}
                  className="flex items-center space-x-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {loadingStates[session.sessionId] ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {qrModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Scan QR Code</h3>
              <button
                onClick={() => setQrModal({ isOpen: false, sessionId: '', qrCode: null })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center">
              {qrModal.qrCode ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 inline-block">
                    <img 
                      src={qrModal.qrCode} 
                      alt="WhatsApp QR Code" 
                      className="w-64 h-64 mx-auto"
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">1. Open WhatsApp on your phone</p>
                    <p className="mb-2">2. Go to Settings → Linked Devices</p>
                    <p>3. Scan this QR code</p>
                  </div>
                </div>
              ) : (
                <div className="py-12">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-600 mt-4">Generating QR code...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;