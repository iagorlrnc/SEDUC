import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  useTheme 
} from '@mui/material';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onDrawerToggle: () => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ onDrawerToggle, title }) => {
  const theme = useTheme();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(9, 13, 22, 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <Menu size={24} />
        </IconButton>
        
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />
      </Toolbar>
    </AppBar>
  );
};
