import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
      aria-label="Toggle language"
    >
      <Languages className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {language.toUpperCase()}
      </span>
    </button>
  );
};

export default LanguageToggle;