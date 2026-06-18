import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  InputAdornment, 
  IconButton, 
  Avatar,
  Link,
  useTheme 
} from '@mui/material';
import { Eye, EyeOff, Lock, User, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { login, isAuthenticated } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redireciona de volta se já estiver autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, id, username: respUser, nome, role } = response.data;
      
      login(token, id, respUser, nome, role);
      
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      let errorMessage = err.response?.data?.message || 'Credenciais inválidas.';
      errorMessage = errorMessage.replace(/\d{3}\s*[A-Z_]+/g, '').trim();
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // const handleQuickLogin = (role: 'admin' | 'operator' | 'viewer') => {
  //   setUsername(role);
  //   setPassword(role);
  //   setError(null);
  // };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: '#090d16',
        backgroundImage: 'radial-gradient(at 50% 0%, rgba(30, 58, 138, 0.3) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(17, 24, 39, 0.5) 0px, transparent 50%)',
        p: 2 
      }}
    >
      <Card 
        sx={{ 
          maxWidth: 420, 
          width: '100%', 
          borderRadius: 4, 
          border: '1px solid rgba(255, 255, 255, 0.08)',
          bgcolor: 'rgba(17, 24, 39, 0.7)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main', 
                width: 56, 
                height: 56,
                boxShadow: '0 0 20px rgba(42, 128, 255, 0.4)',
                mb: 2 
              }}
            >
              <GraduationCap size={32} color="#fff" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>
              SEDUC Tocantins
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              Sistema de Análise de Alunos do Ensino Médio
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                }
              }}
            />

            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disabled={loading}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                }
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ 
                py: 1.5, 
                fontSize: '1rem', 
                boxShadow: '0 4px 14px rgba(42, 128, 255, 0.3)',
                mt: 1
              }}
            >
              {loading ? 'Entrando...' : 'Acessar Portal'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Não possui uma conta?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={(e: any) => {
                  e.preventDefault();
                  navigate('/register');
                }}
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 600, 
                  textDecoration: 'none',
                  border: 'none',
                  background: 'none',
                  p: 0,
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                Solicitar Acesso
              </Link>
            </Typography>
          </Box>

          {/* <Box sx={{ mt: 4, mb: 2 }}>
            <Divider>
              <Typography variant="caption" sx={{ color: 'text.secondary', px: 1 }}>
                Acesso de Teste Rápido
              </Typography>
            </Divider>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => handleQuickLogin('admin')}
              sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'text.secondary', fontSize: '0.75rem' }}
            >
              Admin
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => handleQuickLogin('operator')}
              sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'text.secondary', fontSize: '0.75rem' }}
            >
              Operador
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => handleQuickLogin('viewer')}
              sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'text.secondary', fontSize: '0.75rem' }}
            >
              Consulta
            </Button>
          </Box> */}
        </CardContent>
      </Card>
    </Box>
  );
};
