import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  systemTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const getSystemTheme = (): 'light' | 'dark' => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as ThemeMode) || 'system';
  });
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme());

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const theme = createTheme({
    palette: {
      mode: mode === 'system' ? systemTheme : mode,
      primary: {
        main: '#00b388',
        dark: '#009e76',
        light: '#33c3a0',
        contrastText: '#fff',
      },
      secondary: {
        main: '#ff5252',
        dark: '#e64a4a',
        light: '#ff7575',
        contrastText: '#fff',
      },
      background: {
        default: mode === 'system' ? (systemTheme === 'dark' ? '#121212' : '#f7fafd') : (mode === 'dark' ? '#121212' : '#f7fafd'),
        paper: mode === 'system' ? (systemTheme === 'dark' ? '#1e1e1e' : '#fff') : (mode === 'dark' ? '#1e1e1e' : '#fff'),
      },
      text: {
        primary: mode === 'system' ? (systemTheme === 'dark' ? '#fff' : '#222') : (mode === 'dark' ? '#fff' : '#222'),
        secondary: mode === 'system' ? (systemTheme === 'dark' ? '#aaa' : '#666') : (mode === 'dark' ? '#aaa' : '#666'),
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, setMode, systemTheme }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
}; 