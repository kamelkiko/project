import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  MessageSquare,
  Activity,
  Clock
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import LoadingSpinner from '../UI/LoadingSpinner';

interface AnalyticsData {
  messageStats: Array<{
    _id: { date: string; status: string };
    count: number;
  }>;
  apiStats: Array<{
    _id: { date: string; endpoint: string };
    count: number;
    avgResponseTime: number;
  }>;
  period: string;
}

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  const periods = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/api/analytics/usage?period=${period}`);
      
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMessageStats = () => {
    if (!data?.messageStats) return { sent: 0, failed: 0, total: 0, dailyData: [] };

    const sent = data.messageStats
      .filter(stat => stat._id.status === 'sent')
      .reduce((sum, stat) => sum + stat.count, 0);

    const failed = data.messageStats
      .filter(stat => stat._id.status === 'failed')
      .reduce((sum, stat) => sum + stat.count, 0);

    const total = sent + failed;

    // Process daily data for chart
    const dailyData = data.messageStats.reduce((acc: any[], stat) => {
      const existingDay = acc.find(day => day.date === stat._id.date);
      if (existingDay) {
        existingDay[stat._id.status] = stat.count;
      } else {
        acc.push({
          date: stat._id.date,
          [stat._id.status]: stat.count,
        });
      }
      return acc;
    }, []);

    return { sent, failed, total, dailyData };
  };

  const processApiStats = () => {
    if (!data?.apiStats) return { totalRequests: 0, avgResponseTime: 0, topEndpoints: [] };

    const totalRequests = data.apiStats.reduce((sum, stat) => sum + stat.count, 0);
    const avgResponseTime = data.apiStats.reduce((sum, stat) => sum + stat.avgResponseTime, 0) / data.apiStats.length;

    // Group by endpoint
    const endpointStats = data.apiStats.reduce((acc: any, stat) => {
      const endpoint = stat._id.endpoint;
      if (!acc[endpoint]) {
        acc[endpoint] = { count: 0, avgResponseTime: 0 };
      }
      acc[endpoint].count += stat.count;
      acc[endpoint].avgResponseTime = (acc[endpoint].avgResponseTime + stat.avgResponseTime) / 2;
      return acc;
    }, {});

    const topEndpoints = Object.entries(endpointStats)
      .map(([endpoint, stats]: [string, any]) => ({ endpoint, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { totalRequests, avgResponseTime, topEndpoints };
  };

  const messageStats = processMessageStats();
  const apiStats = processApiStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Monitor your WhatsApp API usage and performance</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div className="text-emerald-600 text-sm font-medium">
              +{messageStats.sent > 0 ? Math.round((messageStats.sent / messageStats.total) * 100) : 0}%
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {messageStats.sent.toLocaleString()}
            </p>
            <p className="text-gray-600 text-sm">Messages Sent</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div className="text-red-600 text-sm font-medium">
              {messageStats.failed > 0 ? Math.round((messageStats.failed / messageStats.total) * 100) : 0}%
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {messageStats.failed.toLocaleString()}
            </p>
            <p className="text-gray-600 text-sm">Failed Messages</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="text-blue-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {apiStats.totalRequests.toLocaleString()}
            </p>
            <p className="text-gray-600 text-sm">API Requests</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-purple-600 text-sm font-medium">
              avg
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {apiStats.avgResponseTime ? Math.round(apiStats.avgResponseTime) : 0}ms
            </p>
            <p className="text-gray-600 text-sm">Response Time</p>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message trends */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Message Trends</h3>
          
          {messageStats.dailyData.length > 0 ? (
            <div className="space-y-4">
              {messageStats.dailyData.slice(-7).map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        Sent: {day.sent || 0}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        Failed: {day.failed || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No message data available</p>
            </div>
          )}
        </div>

        {/* Top endpoints */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top API Endpoints</h3>
          
          {apiStats.topEndpoints.length > 0 ? (
            <div className="space-y-4">
              {apiStats.topEndpoints.map((endpoint) => (
                <div key={endpoint.endpoint} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {endpoint.endpoint}
                    </span>
                    <span className="text-sm text-gray-600">
                      {endpoint.count} requests
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(endpoint.count / apiStats.totalRequests) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Avg response time: {Math.round(endpoint.avgResponseTime)}ms
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No API usage data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Success rate */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Message Success Rate</h3>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">Success Rate</div>
          <div className="text-lg font-semibold text-gray-900">
            {messageStats.total > 0 
              ? Math.round((messageStats.sent / messageStats.total) * 100)
              : 0
            }%
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-4 rounded-full transition-all duration-500"
            style={{ 
              width: messageStats.total > 0 
                ? `${(messageStats.sent / messageStats.total) * 100}%`
                : '0%'
            }}
          ></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-emerald-600">
              {messageStats.sent}
            </p>
            <p className="text-sm text-gray-600">Successful</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {messageStats.failed}
            </p>
            <p className="text-sm text-gray-600">Failed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;