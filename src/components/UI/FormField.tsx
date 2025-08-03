import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  icon,
  disabled = false,
  required = false,
  rows,
  className = '',
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { isRTL } = useLanguage();

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const isTextarea = rows && rows > 1;

  const baseClasses = `
    w-full px-4 py-3 border rounded-xl transition-all duration-200
    focus:ring-2 focus:ring-indigo-500 focus:border-transparent
    disabled:bg-gray-50 disabled:cursor-not-allowed
    dark:bg-gray-800 dark:border-gray-600 dark:text-white
    dark:disabled:bg-gray-700 dark:focus:ring-indigo-400
    ${error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}
    ${icon ? (isRTL ? 'pr-10' : 'pl-10') : ''}
    ${isPassword ? (isRTL ? 'pl-12' : 'pr-12') : ''}
    ${className}
  `;

  return (
    <div className="space-y-2">
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
            <div className="h-5 w-5 text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          </div>
        )}
        
        {isTextarea ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            rows={rows}
            className={`${baseClasses} resize-none`}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={inputType}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={baseClasses}
          />
        )}
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;