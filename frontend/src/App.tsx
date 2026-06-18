import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CustomThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Resume } from './pages/Resume';
import { AlunosList } from './pages/AlunosList';
import { UploadPage } from './pages/UploadPage';
import { SolicitacoesPage } from './pages/SolicitacoesPage';

// Cria o cliente para React Query (gerenciador de estado assíncrono)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Rota pública de Login */}
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Register />} />

              {/* Rotas Privadas e Autenticadas protegidas pelo Layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="resumo" element={<Resume />} />
                <Route path="alunos" element={<AlunosList />} />
                <Route path="upload" element={<UploadPage />} />
                <Route path="solicitacoes" element={<SolicitacoesPage />} />
              </Route>

              {/* Redirecionamento Padrão */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </CustomThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
