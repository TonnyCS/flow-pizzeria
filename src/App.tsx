import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, Button, IconButton, Menu, MenuItem, useTheme as useMuiTheme, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import UserOrderPage from './UserOrderPage';
import AdminDashboard from './AdminDashboard';
import PizzaManagement from './PizzaManagement';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useMuiTheme();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModeChange = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode);
    handleClose();
  };

  const getIcon = () => {
    switch (mode) {
      case 'light':
        return <LightModeIcon />;
      case 'dark':
        return <DarkModeIcon />;
      default:
        return <SettingsBrightnessIcon />;
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ 
          ml: 2,
          color: theme.palette.mode === 'dark' ? '#fff' : '#222',
        }}
        aria-controls={open ? 'theme-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        {getIcon()}
      </IconButton>
      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'theme-button',
        }}
      >
        <MenuItem 
          onClick={() => handleModeChange('light')}
          selected={mode === 'light'}
        >
          <LightModeIcon sx={{ mr: 1 }} /> Light
        </MenuItem>
        <MenuItem 
          onClick={() => handleModeChange('dark')}
          selected={mode === 'dark'}
        >
          <DarkModeIcon sx={{ mr: 1 }} /> Dark
        </MenuItem>
        <MenuItem 
          onClick={() => handleModeChange('system')}
          selected={mode === 'system'}
        >
          <SettingsBrightnessIcon sx={{ mr: 1 }} /> System
        </MenuItem>
      </Menu>
    </>
  );
}

const ADMIN_CODE = 'flow-mio';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });
  const [showDialog, setShowDialog] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      setShowDialog(true);
    }
  }, [isAuthenticated]);

  const handleSubmit = () => {
    if (code === ADMIN_CODE) {
      setIsAuthenticated(true);
      localStorage.setItem('isAdmin', 'true');
      setShowDialog(false);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleClose = () => {
    setShowDialog(false);
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <Dialog 
        open={showDialog} 
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            width: '100%',
            maxWidth: 400,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Admin Access Required</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Enter Admin Code"
            type="password"
            fullWidth
            variant="outlined"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(false);
            }}
            error={error}
            helperText={error ? 'Invalid code' : ''}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleClose}
            sx={{ 
              borderRadius: 2,
              fontWeight: 600,
              color: 'text.secondary'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              fontWeight: 600,
              background: '#00b388',
              '&:hover': {
                background: '#009e76'
              }
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return <>{children}</>;
}

function AppBarWithAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const theme = useMuiTheme();
  
  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        borderRadius: 0,
        background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
        borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#eee'}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', gap: 1 }}>
        <Box 
          display="flex" 
          alignItems="center" 
          gap={1} 
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <LocalPizzaIcon sx={{ color: '#00b388', fontSize: 36 }} />
          <Typography variant="h6" component="div" fontWeight={800} sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#222', letterSpacing: 1, fontFamily: 'inherit' }}>
            Mio's Corner
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <ThemeToggle />
          {!isAdmin ? (
            <Button
              variant="outlined"
              size="small"
              sx={{ 
                borderRadius: 3, 
                fontWeight: 600, 
                borderColor: '#00b388', 
                color: '#00b388', 
                ml: 2, 
                '&:hover': { 
                  borderColor: '#009e76', 
                  background: theme.palette.mode === 'dark' ? 'rgba(0, 179, 136, 0.1)' : '#e6f7f3' 
                } 
              }}
              onClick={() => navigate('/admin')}
            >
              Admin
            </Button>
          ) : (
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                size="small"
                sx={{ 
                  borderRadius: 3, 
                  fontWeight: 600, 
                  borderColor: '#00b388', 
                  color: '#00b388', 
                  ml: 2, 
                  '&:hover': { 
                    borderColor: '#009e76', 
                    background: theme.palette.mode === 'dark' ? 'rgba(0, 179, 136, 0.1)' : '#e6f7f3' 
                  } 
                }}
                onClick={() => navigate('/')}
              >
                Order Page
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={{ 
                  borderRadius: 3, 
                  fontWeight: 600, 
                  borderColor: '#ff5252', 
                  color: '#ff5252', 
                  '&:hover': { 
                    borderColor: '#ff1744', 
                    background: theme.palette.mode === 'dark' ? 'rgba(255, 82, 82, 0.1)' : '#ffebee' 
                  } 
                }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppBarWithAdmin />
        <Box sx={{ minHeight: '100vh', py: 2 }}>
          <Container maxWidth="sm" sx={{ p: { xs: 1, sm: 2 } }}>
            <Routes>
              <Route path="/" element={<UserOrderPage />} />
              <Route path="/admin" element={
                <RequireAuth>
                  <AdminDashboard />
                </RequireAuth>
              } />
              <Route path="/admin/pizzas" element={
                <RequireAuth>
                  <PizzaManagement />
                </RequireAuth>
              } />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
