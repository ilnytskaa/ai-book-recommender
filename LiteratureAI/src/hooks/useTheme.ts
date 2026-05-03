import { useTheme as useThemeContext } from '@/context/ThemeContext';
import { useEffect } from 'react';

export function useTheme() {
  return useThemeContext();
}

export function useSystemTheme() {
  const { setTheme } = useThemeContext();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only change theme if user hasn't manually set one
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [setTheme]);
}

export function useThemeClass() {
  const { theme } = useThemeContext();
  
  return {
    isDark: theme === 'dark',
    isLight: theme === 'light',
    themeClass: theme,
  };
} 