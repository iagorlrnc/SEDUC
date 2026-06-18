import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Divider, 
  Avatar, 
  Chip, 
  IconButton, 
  useTheme 
} from '@mui/material';
import { 
  LayoutDashboard,
  Presentation,
  Users, 
  Upload, 
  LogOut, 
  Sun, 
  Moon, 
  GraduationCap,
  UserCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  drawerWidth: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onDrawerToggle, drawerWidth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeContext();

  const menuItems = [
    { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { text: 'Resumo', icon: <Presentation size={20} />, path: '/resumo' },
    { text: 'Alunos', icon: <Users size={20} />, path: '/alunos' },
    { text: 'Importar Dados', icon: <Upload size={20} />, path: '/upload', roles: ['ADMIN', 'OPERATOR'] },
    { text: 'Solicitações', icon: <UserCheck size={20} />, path: '/solicitacoes', roles: ['ADMIN'] },
  ];

  // Filtra itens de acordo com a role do usuário
  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'OPERATOR': return 'Operador';
      case 'VIEWER': return 'Consulta';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'OPERATOR': return 'warning';
      case 'VIEWER': return 'info';
      default: return 'default';
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: theme.palette.background.paper }}>
      {/* Logo SEDUC Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
          <GraduationCap size={24} color="#fff" />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, leadingHeight: 1.2, color: theme.palette.primary.main }}>
            Portal - SisAluno
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            Gerenciamento de Alunos
          </Typography>
        </Box>
      </Box>
      
      <Divider />

      {/* Navegação */}
      <Box sx={{ flexGrow: 1, px: 2, py: 2 }}>
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {filteredMenuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  onClick={() => {
                    navigate(item.path);
                    if (mobileOpen) onDrawerToggle();
                  }}
                  sx={{
                    borderRadius: 2,
                    bgcolor: active ? theme.palette.primary.main + '14' : 'transparent',
                    color: active ? theme.palette.primary.main : 'text.secondary',
                    '&:hover': {
                      bgcolor: active ? theme.palette.primary.main + '18' : 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: active ? theme.palette.primary.main : 'text.secondary', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography sx={{ fontSize: '0.95rem', fontWeight: active ? 600 : 500 }}>{item.text}</Typography>} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Rodapé - Usuário e Botões */}
      <Box sx={{ p: 2, mt: 'auto', borderTop: '1px solid', borderColor: 'divider' }}>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, px: 1 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 44, height: 44 }}>
              {user.nome.charAt(0)}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                {user.nome}
              </Typography>
              <Chip 
                label={getRoleLabel(user.role)} 
                size="small" 
                color={getRoleColor(user.role) as any}
                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, mt: 0.5 }}
              />
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>
          
          <IconButton onClick={logout} color="error" title="Sair do sistema">
            <LogOut size={20} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth, 
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};
