import { createContext, useContext, useEffect, useState } from 'react';
import { metallicSeaweedTheme } from './themes';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (root) {
      root.style.setProperty('--primary-hsl', '201, 66%, 37%'); // Metallic Seaweed
      root.style.setProperty('--primary-light-hsl', '201, 66%, 42%');
      root.style.setProperty('--primary-dark-hsl', '201, 66%, 32%');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    // You can add light theme support later if needed
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);