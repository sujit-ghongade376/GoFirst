import React, { useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '@/App';

const Header: React.FC = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Toolbar>
        <AssignmentTurnedInIcon sx={{ mr: 1, fontSize: 32, color: 'secondary.main' }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
          GoFirst Board
        </Typography>
        <IconButton color="inherit" onClick={colorMode.toggleColorMode} sx={{ mr: 1 }}>
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
