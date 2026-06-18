import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  useTheme,
  Grid
} from '@mui/material';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Briefcase, 
  CheckCircle2, 
  GraduationCap 
} from 'lucide-react';
import { api } from '../services/api';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Form state
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [setor, setSetor] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '') // remove non-digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1'); // limit characters
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', {
        nome,
        email,
        password,
        telefone,
        cpf,
        setor
      });
      setSuccess(true);
    } catch (err: any) {
      let errorMessage = err.response?.data?.message || 'Ocorreu um erro ao realizar o cadastro.';
      errorMessage = errorMessage.replace(/\d{3}\s*[A-Z_]+/g, '').trim();
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
            maxWidth: 480, 
            width: '100%', 
            borderRadius: 4, 
            border: '1px solid rgba(255, 255, 255, 0.08)',
            bgcolor: 'rgba(17, 24, 39, 0.7)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            textAlign: 'center',
            p: 4
          }}
        >
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'success.main', 
                width: 72, 
                height: 72,
                boxShadow: '0 0 30px rgba(46, 125, 50, 0.4)',
              }}
            >
              <CheckCircle2 size={40} color="#fff" />
            </Avatar>
            
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 1 }}>
                Solicitação Enviada!
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', px: 2 }}>
                Sua solicitação de cadastro foi registrada com sucesso. Um administrador revisará sua conta para liberar o acesso e definir seu perfil.
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={() => navigate('/login')}
              sx={{ 
                py: 1.5, 
                fontSize: '1rem', 
                boxShadow: '0 4px 14px rgba(42, 128, 255, 0.3)',
                mt: 1
              }}
            >
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: '#090d16',
        backgroundImage: 'radial-gradient(at 50% 0%, rgba(30, 58, 138, 0.3) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(17, 24, 39, 0.5) 0px, transparent 50%)',
        py: 4,
        px: 2 
      }}
    >
      <Card 
        sx={{ 
          maxWidth: 600, 
          width: '100%', 
          borderRadius: 4, 
          border: '1px solid rgba(255, 255, 255, 0.08)',
          bgcolor: 'rgba(17, 24, 39, 0.7)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          {/* Header */}
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
              Solicitar Acesso
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              Cadastre sua conta para solicitar acesso ao Portal SEDUC-TO
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Nome Completo"
                  variant="outlined"
                  fullWidth
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
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
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="E-mail Corporativo"
                  type="email"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={18} color={theme.palette.text.secondary} />
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
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Telefone"
                  variant="outlined"
                  fullWidth
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhone(e.target.value))}
                  placeholder="(63) 99999-9999"
                  disabled={loading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone size={18} color={theme.palette.text.secondary} />
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
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="CPF"
                  variant="outlined"
                  fullWidth
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  disabled={loading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <FileText size={18} color={theme.palette.text.secondary} />
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
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Setor / Departamento"
                  variant="outlined"
                  fullWidth
                  value={setor}
                  onChange={(e) => setSetor(e.target.value)}
                  placeholder="Ex: TI, RH, Financeiro..."
                  disabled={loading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Briefcase size={18} color={theme.palette.text.secondary} />
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
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
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
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Confirmar Senha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  variant="outlined"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" disabled={loading}>
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
              </Grid>

              <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
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
                  }}
                >
                  {loading ? 'Processando...' : 'Enviar Solicitação'}
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Já tem acesso?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={(e: any) => {
                  e.preventDefault();
                  navigate('/login');
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
                Fazer Login
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
