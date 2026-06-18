import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ptBR } from '@mui/material/locale';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('seduc_theme_mode');
    return (saved as ThemeMode) || 'dark'; // Default to dark for BI premium aesthetic
  });

  useEffect(() => {
    localStorage.setItem('seduc_theme_mode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = createTheme(
    {
      palette: {
        mode,
        primary: {
          main: mode === 'light' ? '#003366' : '#2a80ff', // Rich corporate blue
          light: mode === 'light' ? '#2c5c8f' : '#5fa4ff',
          dark: mode === 'light' ? '#001b33' : '#0059cc',
        },
        secondary: {
          main: '#f59e0b', // Accent amber/orange
        },
        background: {
          default: mode === 'light' ? '#f3f4f6' : '#090d16', // Dark space blue
          paper: mode === 'light' ? '#ffffff' : '#111827',   // Dark grey cards
        },
        text: {
          primary: mode === 'light' ? '#1f2937' : '#f3f4f6',
          secondary: mode === 'light' ? '#4b5563' : '#9ca3af',
        },
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
          fontWeight: 700,
        },
        h5: {
          fontWeight: 600,
        },
        h6: {
          fontWeight: 600,
        },
        button: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
      shape: {
        borderRadius: 12,
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              boxShadow: mode === 'light' 
                ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' 
                : '0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -2px rgb(0 0 0 / 0.2)',
              border: mode === 'light' ? '1px solid #e5e7eb' : '1px solid #1f2937',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: mode === 'light'
                  ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                  : '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
              }
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              padding: '8px 16px',
            },
          },
        },
      },
    },
    ptBR // Locale for MUI components like tables
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a CustomThemeProvider');
  }
  return context;
};
