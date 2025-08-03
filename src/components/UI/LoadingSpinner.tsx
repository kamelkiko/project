import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex space-x-1">
        <div className={`${sizeClasses[size]} bg-indigo-600 rounded-full pulse-dot`}></div>
        <div className={`${sizeClasses[size]} bg-indigo-600 rounded-full pulse-dot`}></div>
        <div className={`${sizeClasses[size]} bg-indigo-600 rounded-full pulse-dot`}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;