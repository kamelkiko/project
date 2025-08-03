import React, { useState, useEffect } from 'react';
import { Send, Phone, User, Clock } from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest, validatePhoneNumber, formatPhoneNumber } from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../UI/LoadingSpinner';

interface MessageHistory {
  id: string;
  to: string;
  message: string;
  status: string;
  timestamp: string;
  sessionId: string;
}

const Messages: React.FC = () => {
  const { sessions } = useSession();
  const { user, refreshUser } = useAuth();
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageHistory, setMessageHistory] = useState<MessageHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const authenticatedSessions = sessions.filter(s => s.status === 'authenticated');

  useEffect(() => {
    if (authenticatedSessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(authenticatedSessions[0].sessionId);
    }
  }, [authenticatedSessions, selectedSessionId]);

  useEffect(() => {
    fetchMessageHistory();
  }, []);

  const fetchMessageHistory = async () => {
    try {
      setHistoryLoading(true);
      // This would be an endpoint to fetch message history
      // For now, we'll use a placeholder
      const response = await apiRequest('/api/analytics/usage?period=7d');
      if (response.success) {
        // Transform analytics data to message history format
        const messages: MessageHistory[] = [];
        // This is a simplified transformation - you'd implement based on your actual API
        setMessageHistory(messages);
      }
    } catch (error) {
      console.error('Error fetching message history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSessionId) {
      toast.error('Please select an active session');
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (user?.messageLimit !== -1 && (user?.messagesUsed || 0) >= (user?.messageLimit || 0)) {
      toast.error('Message limit exceeded. Upgrade your plan or wait for next month reset.');
      return;
    }

    try {
      setLoading(true);
      
      const response = await apiRequest('/api/send-message', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: selectedSessionId,
          phoneNumber: phoneNumber,
          message: message,
        }),
      });

      if (response.success) {
        toast.success('Message sent successfully!');
        setMessage('');
        await refreshUser(); // Refresh user data to update message count
        
        // Add to message history
        const newMessage: MessageHistory = {
          id: response.data.messageId,
          to: phoneNumber,
          message: message,
          status: 'sent',
          timestamp: new Date().toISOString(),
          sessionId: selectedSessionId,
        };
        
        setMessageHistory(prev => [newMessage, ...prev]);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const selectedSession = sessions.find(s => s.sessionId === selectedSessionId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Send Messages</h1>
        <p className="text-gray-600">Send WhatsApp messages through your authenticated sessions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message form */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-6">
            {authenticatedSessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Sessions</h3>
                <p className="text-gray-600 mb-6">You need an authenticated WhatsApp session to send messages</p>
                <button
                  onClick={() => window.location.href = '/sessions'}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                >
                  <span>Go to Sessions</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-6">
                {/* Session selection */}
                <div>
                  <label htmlFor="session" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Session
                  </label>
                  <select
                    id="session"
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    {authenticatedSessions.map((session) => (
                      <option key={session.sessionId} value={session.sessionId}>
                        {session.phoneNumber || `Session ${session.sessionId.substring(0, 8)}...`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Enter phone number (e.g., +1234567890)"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Include country code (e.g., +1 for US)
                  </p>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter your message..."
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{message.length} characters</span>
                    <span>
                      Messages used: {user?.messagesUsed || 0} / {user?.messageLimit === -1 ? '∞' : user?.messageLimit}
                    </span>
                  </div>
                </div>

                {/* Send button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </div>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Session info and message history */}
        <div className="space-y-6">
          {/* Selected session info */}
          {selectedSession && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-semibold text-gray-900">
                    {selectedSession.phoneNumber || 'Not available'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-emerald-600 bg-emerald-100">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                    <span>Connected</span>
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Activity</p>
                  <p className="text-sm text-gray-900">
                    {selectedSession.lastActivity 
                      ? new Date(selectedSession.lastActivity).toLocaleString()
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recent messages */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Messages</h3>
            
            {historyLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : messageHistory.length > 0 ? (
              <div className="space-y-3">
                {messageHistory.slice(0, 5).map((msg) => (
                  <div key={msg.id} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">{msg.to}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{msg.message}</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        msg.status === 'sent' 
                          ? 'text-emerald-600 bg-emerald-100'
                          : msg.status === 'failed'
                          ? 'text-red-600 bg-red-100'
                          : 'text-yellow-600 bg-yellow-100'
                      }`}>
                        {msg.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">No recent messages</p>
                <p className="text-sm text-gray-400">Your sent messages will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;