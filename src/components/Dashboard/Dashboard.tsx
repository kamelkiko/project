import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Users, 
  BarChart3, 
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSession } from '../../contexts/SessionContext';
import { apiRequest } from '../../utils/api';
import LoadingSpinner from '../UI/LoadingSpinner';

interface Stats {
  totalSessions: number;
  activeSessions: number;
  totalMessages: number;
  messagesSentToday: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { sessions } = useSession();
  const [stats, setStats] = useState<Stats>({
    totalSessions: 0,
    activeSessions: 0,
    totalMessages: 0,
    messagesSentToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [sessions]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Calculate stats from sessions
      const totalSessions = sessions.length;
      const activeSessions = sessions.filter(s => s.status === 'authenticated').length;
      
      // You can fetch more detailed stats from analytics endpoint
      const analyticsResponse = await apiRequest('/api/analytics/usage?period=30d');
      
      let totalMessages = 0;
      let messagesSentToday = 0;
      
      if (analyticsResponse.success) {
        const today = new Date().toISOString().split('T')[0];
        analyticsResponse.data.messageStats.forEach((stat: any) => {
          if (stat._id.status === 'sent') {
            totalMessages += stat.count;
            if (stat._id.date === today) {
              messagesSentToday += stat.count;
            }
          }
        });
      }

      setStats({
        totalSessions,
        activeSessions,
        totalMessages,
        messagesSentToday,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to basic stats from sessions
      setStats({
        totalSessions: sessions.length,
        activeSessions: sessions.filter(s => s.status === 'authenticated').length,
        totalMessages: user?.messagesUsed || 0,
        messagesSentToday: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Sessions',
      value: stats.totalSessions,
      icon: Users,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Active Sessions',
      value: stats.activeSessions,
      icon: Activity,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Messages Sent',
      value: stats.totalMessages,
      icon: MessageSquare,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      change: '+23%',
      changeType: 'positive' as const,
    },
    {
      title: 'Today\'s Messages',
      value: stats.messagesSentToday,
      icon: Clock,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      change: '+5%',
      changeType: 'positive' as const,
    },
  ];

  const recentSessions = sessions.slice(0, 5);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="glass rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your WhatsApp API today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="glass rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  stat.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-gray-600 text-sm">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Usage overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan usage */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Usage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Messages Used</span>
                <span className="text-sm font-medium text-gray-900">
                  {user?.messagesUsed || 0} / {user?.messageLimit === -1 ? '∞' : user?.messageLimit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: user?.messageLimit === -1 
                      ? '100%' 
                      : `${Math.min(((user?.messagesUsed || 0) / (user?.messageLimit || 1)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.activeSessions} / {user?.maxSessions === -1 ? '∞' : user?.maxSessions}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: user?.maxSessions === -1 
                      ? '100%' 
                      : `${Math.min((stats.activeSessions / (user?.maxSessions || 1)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Plan</span>
                <span className="text-sm font-semibold text-indigo-600 capitalize">
                  {user?.plan}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent sessions */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {recentSessions.length > 0 ? (
              recentSessions.map((session) => (
                <div key={session.sessionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                      {getStatusIcon(session.status)}
                      <span className="capitalize">{session.status}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {session.phoneNumber || 'Not connected'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No sessions yet</p>
                <p className="text-sm text-gray-400">Create your first session to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;