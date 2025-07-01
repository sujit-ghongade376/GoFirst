import React from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Board from '@/features/board/Board';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Type for color mode context
interface ColorModeContextType {
  toggleColorMode: () => void;
  mode: 'light' | 'dark';
}

export const ColorModeContext = React.createContext<ColorModeContextType>({
  toggleColorMode: () => {},
  mode: 'light',
});

function App() {
  // Always start in light mode on first render
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');

  // Optionally, persist user preference in localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('colorMode');
    if (saved === 'light' || saved === 'dark') {
      setMode(saved);
    }
  }, []);

  // Save mode to localStorage when changed
  React.useEffect(() => {
    localStorage.setItem('colorMode', mode);
  }, [mode]);

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
      mode,
    }),
    [mode]
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#1976d2' },
          secondary: { main: '#dc004e' },
        },
        shape: { borderRadius: 8 },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box
            sx={{
              minHeight: '100vh',
              bgcolor: 'background.default',
              width: '100vw',
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Header />
            <Box
              sx={{
                width: '100%',
                maxWidth: { xs: '100%', sm: '100%', md: '1200px', lg: '1600px' },
                mx: 'auto',
                py: { xs: 2, sm: 3, md: 4 },
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                px: { xs: 1, sm: 2, md: 4, lg: 6 },
              }}
            >
              <Board />
            </Box>
            <Footer />
          </Box>
        </ThemeProvider>
      </LocalizationProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
