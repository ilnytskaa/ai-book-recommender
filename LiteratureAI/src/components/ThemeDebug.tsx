'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeDebug() {
  const { theme, toggleTheme, setTheme, mounted } = useTheme();
  
  const [systemTheme, setSystemTheme] = React.useState<'light' | 'dark'>('light');
  const [htmlClasses, setHtmlClasses] = React.useState<string>('');
  
  React.useEffect(() => {
    if (!mounted) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    // Update HTML classes
    const updateHtmlClasses = () => {
      setHtmlClasses(document.documentElement.className);
    };
    
    updateHtmlClasses();
    
    // Create a mutation observer to watch for class changes
    const observer = new MutationObserver(updateHtmlClasses);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, [mounted]);

  // Don't render debug info until fully mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className="right-4 bottom-4 z-50 fixed bg-white dark:bg-gray-800 shadow-lg p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <h3 className="mb-2 font-bold text-gray-900 dark:text-white text-sm">Theme Debug</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Current:</span>
          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-gray-900 dark:text-white">
            {theme}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">System:</span>
          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-gray-900 dark:text-white">
            {systemTheme}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">HTML Class:</span>
          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-gray-900 dark:text-white text-xs">
            {htmlClasses || 'none'}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Mounted:</span>
          <span className={`font-mono px-2 py-1 rounded text-xs ${
            mounted 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}>
            {mounted ? 'true' : 'false'}
          </span>
        </div>
      </div>
      
      <div className="flex space-x-2 mt-3">
        <button
          onClick={() => setTheme('light')}
          className={`p-2 rounded ${
            theme === 'light'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          title="Light Theme"
        >
          <Sun className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => setTheme('dark')}
          className={`p-2 rounded ${
            theme === 'dark'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          title="Dark Theme"
        >
          <Moon className="w-4 h-4" />
        </button>
        
        <button
          onClick={toggleTheme}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded text-gray-600 dark:text-gray-400"
          title="Toggle Theme"
        >
          <Monitor className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 