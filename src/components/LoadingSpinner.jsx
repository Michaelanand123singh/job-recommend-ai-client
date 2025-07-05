import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'blue', 
  text = '', 
  className = '' 
}) => {
  // Size configurations
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  // Color configurations
  const colorClasses = {
    blue: 'border-blue-600',
    purple: 'border-purple-600',
    green: 'border-green-600',
    red: 'border-red-600',
    gray: 'border-gray-600',
    white: 'border-white'
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.medium;
  const spinnerColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Spinner */}
      <div className="relative">
        <div
          className={`${spinnerSize} border-4 border-gray-200 border-t-transparent rounded-full animate-spin ${spinnerColor}`}
          style={{
            borderTopColor: 'transparent'
          }}
        ></div>
        
        {/* Gradient overlay for better visual effect */}
        <div
          className={`absolute inset-0 ${spinnerSize} border-4 border-transparent rounded-full animate-spin`}
          style={{
            borderTopColor: color === 'blue' ? '#2563eb' : 
                           color === 'purple' ? '#9333ea' :
                           color === 'green' ? '#16a34a' :
                           color === 'red' ? '#dc2626' :
                           color === 'gray' ? '#4b5563' : '#ffffff',
            borderRightColor: 'rgba(37, 99, 235, 0.3)',
            animationDuration: '1s'
          }}
        ></div>
      </div>

      {/* Text */}
      {text && (
        <p className="mt-3 text-sm text-gray-600 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

// Alternative pulsing dots spinner
export const DotsSpinner = ({ color = 'blue', className = '' }) => {
  const dotColor = color === 'blue' ? 'bg-blue-600' :
                   color === 'purple' ? 'bg-purple-600' :
                   color === 'green' ? 'bg-green-600' :
                   'bg-blue-600';

  return (
    <div className={`flex space-x-1 ${className}`}>
      <div className={`w-2 h-2 ${dotColor} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
      <div className={`w-2 h-2 ${dotColor} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
      <div className={`w-2 h-2 ${dotColor} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
    </div>
  );
};

// Pulse spinner (for cards/backgrounds)
export const PulseSpinner = ({ className = '' }) => {
  return (
    <div className={`${className}`}>
      <div className="animate-pulse">
        <div className="flex space-x-4">
          <div className="rounded-full bg-gray-300 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;