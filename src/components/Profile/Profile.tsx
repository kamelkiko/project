import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Crown, 
  MessageSquare, 
  Users, 
  Calendar,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest } from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../UI/LoadingSpinner';

const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  const planDetails = {
    free: {
      name: 'Free',
      color: 'from-gray-500 to-gray-600',
      features: ['100 messages/month', '1 session', 'Basic support'],
    },
    basic: {
      name: 'Basic',
      color: 'from-blue-500 to-blue-600',
      features: ['1,000 messages/month', '3 sessions', 'Email support'],
    },
    premium: {
      name: 'Premium',
      color: 'from-purple-500 to-purple-600',
      features: ['10,000 messages/month', '10 sessions', 'Priority support'],
    },
    unlimited: {
      name: 'Unlimited',
      color: 'from-gradient-to-r from-amber-500 to-amber-600',
      features: ['Unlimited messages', 'Unlimited sessions', '24/7 support'],
    },
  };

  const currentPlan = planDetails[user?.plan as keyof typeof planDetails] || planDetails.free;

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData({
        username: user?.username || '',
        email: user?.email || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!formData.username.trim() || !formData.email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      // This would be an endpoint to update user profile
      // For now, we'll simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
      await refreshUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your account settings and view usage statistics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
              <button
                onClick={isEditing ? handleEditToggle : () => setIsEditing(true)}
                className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-6">
              {/* Profile picture */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{user?.username}</h4>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={isEditing ? formData.username : user?.username || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={isEditing ? formData.email : user?.email || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Save button */}
              {isEditing && (
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Usage statistics */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Usage Statistics</h3>
            
            <div className="space-y-6">
              {/* Messages usage */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-900">Messages Used</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {user?.messagesUsed || 0} / {user?.messageLimit === -1 ? '∞' : user?.messageLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: user?.messageLimit === -1 
                        ? '0%' 
                        : `${getUsagePercentage(user?.messagesUsed || 0, user?.messageLimit || 1)}%` 
                    }}
                  ></div>
                </div>
                {user?.messageLimit !== -1 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {((user?.messageLimit || 1) - (user?.messagesUsed || 0))} messages remaining
                  </p>
                )}
              </div>

              {/* Account info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Member Since</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Max Sessions</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.maxSessions === -1 ? 'Unlimited' : user?.maxSessions}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plan info */}
        <div className="space-y-6">
          {/* Current plan */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
            
            <div className={`bg-gradient-to-r ${currentPlan.color} rounded-xl p-6 text-white mb-4`}>
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="w-6 h-6" />
                <h4 className="text-xl font-bold">{currentPlan.name}</h4>
              </div>
              <p className="text-sm opacity-90">Your current subscription plan</p>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">Plan Features:</h5>
              <ul className="space-y-2">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200">
              Upgrade Plan
            </button>
          </div>

          {/* Quick stats */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Messages Today</p>
                  <p className="text-xl font-bold text-blue-700">0</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl">
                <div>
                  <p className="text-sm text-emerald-600 font-medium">Active Sessions</p>
                  <p className="text-xl font-bold text-emerald-700">0</p>
                </div>
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;