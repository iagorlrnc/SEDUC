import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 260;

export const Layout: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Se estiver carregando o estado de autenticação, exibe tela preta ou de loading
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }} />
    );
  }

  // Redireciona para o login se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Define o título da página baseado no path
  const getPageTitle = (pathname: string) => {
    if (pathname === '/') return 'Painel Executivo';
    if (pathname.startsWith('/alunos')) return 'Gerenciamento de Alunos';
    if (pathname.startsWith('/upload')) return 'Processo ETL - Carga de Arquivos';
    if (pathname.startsWith('/solicitacoes')) return 'Solicitações de Acesso';
    return 'SEDUC-TO';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar de Navegação */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        onDrawerToggle={handleDrawerToggle} 
        drawerWidth={DRAWER_WIDTH} 
      />

      {/* Área de Conteúdo Principal */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh'
        }}
      >
        <Header onDrawerToggle={handleDrawerToggle} title={getPageTitle(location.pathname)} />
        
        {/* Viewport da Página */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            p: { xs: 2, sm: 3, md: 4 }, 
            bgcolor: 'background.default',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            overflowX: 'hidden'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
