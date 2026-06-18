import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  useTheme,
  Grid,
  Avatar
} from '@mui/material';
import { 
  Check, 
  Trash2, 
  UserX, 
  UserCheck, 
  Mail, 
  Phone, 
  FileText, 
  Briefcase 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface PendingUser {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  setor: string;
  username: string;
  role?: 'ADMIN' | 'OPERATOR' | 'VIEWER';
}

export const SolicitacoesPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  // Estados - Solicitações Pendentes
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [roles, setRoles] = useState<{ [key: number]: 'ADMIN' | 'OPERATOR' | 'VIEWER' }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});
  
  // Estados - Usuários Ativos
  const [activeUsers, setActiveUsers] = useState<PendingUser[]>([]);
  const [activeRoles, setActiveRoles] = useState<{ [key: number]: 'ADMIN' | 'OPERATOR' | 'VIEWER' }>({});
  const [activeLoading, setActiveLoading] = useState(true);

  // Dialog de Rejeição / Exclusão
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [isRevokingActive, setIsRevokingActive] = useState(false);

  // Redireciona se não for Admin
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const fetchPendingUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/users/pending');
      setUsers(response.data);
      
      // Inicializa cada usuário pendente com papel VIEWER (Consulta) por padrão
      const initialRoles: { [key: number]: 'ADMIN' | 'OPERATOR' | 'VIEWER' } = {};
      response.data.forEach((u: PendingUser) => {
        initialRoles[u.id] = 'VIEWER';
      });
      setRoles(initialRoles);
    } catch (err: any) {
      setError('Erro ao carregar as solicitações pendentes.');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveUsers = async () => {
    setActiveLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/users/active');
      setActiveUsers(response.data);
      
      const initialRoles: { [key: number]: 'ADMIN' | 'OPERATOR' | 'VIEWER' } = {};
      response.data.forEach((u: PendingUser) => {
        if (u.role) {
          initialRoles[u.id] = u.role;
        }
      });
      setActiveRoles(initialRoles);
    } catch (err: any) {
      setError('Erro ao carregar os usuários ativos.');
    } finally {
      setActiveLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchPendingUsers();
      fetchActiveUsers();
    }
  }, [user]);

  const handleRoleChange = (userId: number, role: 'ADMIN' | 'OPERATOR' | 'VIEWER') => {
    setRoles(prev => ({ ...prev, [userId]: role }));
  };

  const handleActiveRoleChange = (userId: number, role: 'ADMIN' | 'OPERATOR' | 'VIEWER') => {
    setActiveRoles(prev => ({ ...prev, [userId]: role }));
  };

  const handleApprove = async (userId: number) => {
    const role = roles[userId];
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    setError(null);
    
    try {
      await api.post(`/admin/users/${userId}/approve`, { role });
      
      // Blast confetti for premium effect!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      
      // Remove do estado local e atualiza lista de ativos
      setUsers(prev => prev.filter(u => u.id !== userId));
      fetchActiveUsers();
    } catch (err: any) {
      setError('Erro ao aprovar o usuário.');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleUpdateActiveRole = async (userId: number) => {
    const role = activeRoles[userId];
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    setError(null);
    
    try {
      await api.post(`/admin/users/${userId}/approve`, { role });
      // Atualiza lista de ativos para refletir as alterações no Grid
      fetchActiveUsers();
    } catch (err: any) {
      setError('Erro ao atualizar o perfil do usuário ativo.');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleRejectClick = (userId: number, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setIsRevokingActive(false);
    setConfirmOpen(true);
  };

  const handleRevokeClick = (userId: number, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setIsRevokingActive(true);
    setConfirmOpen(true);
  };

  const handleConfirmReject = async () => {
    if (selectedUserId === null) return;
    
    setActionLoading(prev => ({ ...prev, [selectedUserId]: true }));
    setConfirmOpen(false);
    setError(null);
    
    try {
      await api.delete(`/admin/users/${selectedUserId}`);
      if (isRevokingActive) {
        setActiveUsers(prev => prev.filter(u => u.id !== selectedUserId));
      } else {
        setUsers(prev => prev.filter(u => u.id !== selectedUserId));
      }
    } catch (err: any) {
      setError(isRevokingActive ? 'Erro ao revogar o acesso do usuário.' : 'Erro ao rejeitar a solicitação.');
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedUserId]: false }));
      setSelectedUserId(null);
      setIsRevokingActive(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Bloco 1: Solicitações Pendentes */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card 
            sx={{ 
              borderRadius: 3, 
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Solicitações de Acesso Pendentes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gerencie as requisições de criação de conta e conceda os níveis correspondentes de permissão.
                </Typography>
              </Box>
              <Chip 
                label={`${users.length} pendente(s)`} 
                color={users.length > 0 ? "warning" : "default"} 
                size="medium" 
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={30} />
                </Box>
              ) : users.length === 0 ? (
                <Box sx={{ p: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'action.hover', width: 64, height: 64, color: 'text.secondary' }}>
                    <UserCheck size={32} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Nenhuma solicitação pendente
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Todos os usuários que se cadastraram já foram gerenciados.
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>E-mail</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Contato</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Setor</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Documento (CPF)</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Nível de Acesso</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((row) => (
                        <TableRow 
                          key={row.id} 
                          sx={{ 
                            '&:hover': { bgcolor: 'action.hover' },
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>{row.nome}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Mail size={14} color={theme.palette.text.secondary} />
                              <Typography variant="body2">{row.email || row.username}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {row.telefone ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Phone size={14} color={theme.palette.text.secondary} />
                                <Typography variant="body2">{row.telefone}</Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.disabled">-</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {row.setor ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Briefcase size={14} color={theme.palette.text.secondary} />
                                <Typography variant="body2">{row.setor}</Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.disabled">-</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {row.cpf ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FileText size={14} color={theme.palette.text.secondary} />
                                <Typography variant="body2">{row.cpf}</Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.disabled">-</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={roles[row.id] || 'VIEWER'}
                              onChange={(e) => handleRoleChange(row.id, e.target.value as any)}
                              size="small"
                              sx={{ 
                                minWidth: 150, 
                                borderRadius: 2,
                                bgcolor: 'rgba(255, 255, 255, 0.02)',
                              }}
                              disabled={actionLoading[row.id]}
                            >
                              <MenuItem value="VIEWER">Consulta (Viewer)</MenuItem>
                              <MenuItem value="OPERATOR">Operador (Operator)</MenuItem>
                              <MenuItem value="ADMIN">Administrador (Admin)</MenuItem>
                            </Select>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              <Tooltip title="Aprovar Acesso">
                                <span>
                                  <IconButton
                                    color="success"
                                    onClick={() => handleApprove(row.id)}
                                    disabled={actionLoading[row.id]}
                                    sx={{ 
                                      border: '1px solid',
                                      borderColor: 'success.main',
                                      bgcolor: 'success.main' + '0A',
                                      '&:hover': {
                                        bgcolor: 'success.main',
                                        color: '#fff'
                                      }
                                    }}
                                  >
                                    <Check size={18} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              
                              <Tooltip title="Rejeitar Acesso">
                                <span>
                                  <IconButton
                                    color="error"
                                    onClick={() => handleRejectClick(row.id, row.nome)}
                                    disabled={actionLoading[row.id]}
                                    sx={{ 
                                      border: '1px solid',
                                      borderColor: 'error.main',
                                      bgcolor: 'error.main' + '0A',
                                      '&:hover': {
                                        bgcolor: 'error.main',
                                        color: '#fff'
                                      }
                                    }}
                                  >
                                    <Trash2 size={18} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bloco 2: Usuários Ativos */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card 
            sx={{ 
              borderRadius: 3, 
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Usuários Ativos / Contas Cadastradas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lista de todos os usuários que já possuem acesso ativo ao portal e seus respectivos setores e perfis.
                </Typography>
              </Box>
              <Chip 
                label={`${activeUsers.length} usuário(s)`} 
                color="primary" 
                size="medium" 
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <CardContent sx={{ p: 0 }}>
              {activeLoading ? (
                <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={30} />
                </Box>
              ) : activeUsers.length === 0 ? (
                <Box sx={{ p: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Nenhum usuário ativo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nenhum usuário foi aprovado no sistema ainda.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>E-mail</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Contato</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Setor</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Documento (CPF)</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Nível de Acesso</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeUsers.map((row) => (
                        <TableRow 
                          key={row.id} 
                          sx={{ 
                            '&:hover': { bgcolor: 'action.hover' },
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>{row.nome}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Mail size={14} color={theme.palette.text.secondary} />
                              <Typography variant="body2">{row.email || row.username}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {row.telefone ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Phone size={14} color={theme.palette.text.secondary} />
                                <Typography variant="body2">{row.telefone}</Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.disabled">-</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {row.setor ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Briefcase size={14} color={theme.palette.text.secondary} />
                                <Typography variant="body2">{row.setor}</Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.disabled">-</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {row.cpf ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FileText size={14} color={theme.palette.text.secondary} />
                                <Typography variant="body2">{row.cpf}</Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.disabled">-</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={activeRoles[row.id] || row.role || 'VIEWER'}
                              onChange={(e) => handleActiveRoleChange(row.id, e.target.value as any)}
                              size="small"
                              sx={{ 
                                minWidth: 150, 
                                borderRadius: 2,
                                bgcolor: 'rgba(255, 255, 255, 0.02)',
                              }}
                              disabled={actionLoading[row.id] || row.username === user?.username}
                            >
                              <MenuItem value="VIEWER">Consulta (Viewer)</MenuItem>
                              <MenuItem value="OPERATOR">Operador (Operator)</MenuItem>
                              <MenuItem value="ADMIN">Administrador (Admin)</MenuItem>
                            </Select>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              <Tooltip title="Salvar Novo Perfil">
                                <span>
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleUpdateActiveRole(row.id)}
                                    disabled={actionLoading[row.id] || activeRoles[row.id] === row.role || row.username === user?.username}
                                    sx={{ 
                                      border: '1px solid',
                                      borderColor: 'primary.main',
                                      bgcolor: 'primary.main' + '0A',
                                      '&:hover': {
                                        bgcolor: 'primary.main',
                                        color: '#fff'
                                      }
                                    }}
                                  >
                                    <Check size={18} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              
                              <Tooltip title="Excluir Usuário / Revogar Acesso">
                                <span>
                                  <IconButton
                                    color="error"
                                    onClick={() => handleRevokeClick(row.id, row.nome)}
                                    disabled={actionLoading[row.id] || row.username === user?.username}
                                    sx={{ 
                                      border: '1px solid',
                                      borderColor: 'error.main',
                                      bgcolor: 'error.main' + '0A',
                                      '&:hover': {
                                        bgcolor: 'error.main',
                                        color: '#fff'
                                      }
                                    }}
                                  >
                                    <Trash2 size={18} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal de Confirmação de Rejeição ou Exclusão */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <UserX color={theme.palette.error.main} size={24} />
          {isRevokingActive ? 'Revogar Acesso / Excluir Usuário' : 'Confirmar Rejeição'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary' }}>
            {isRevokingActive ? (
              <>Tem certeza de que deseja excluir permanentemente a conta de <strong>{selectedUserName}</strong>? O usuário perderá o acesso ao sistema de forma imediata.</>
            ) : (
              <>Tem certeza de que deseja rejeitar a solicitação de acesso de <strong>{selectedUserName}</strong>?</>
            )}
          </DialogContentText>
          <DialogContentText variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta ação excluirá o cadastro de forma permanente e o usuário precisará solicitar acesso novamente caso queira entrar no sistema.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setConfirmOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmReject} 
            color="error"
            variant="contained"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            {isRevokingActive ? 'Sim, Excluir Usuário' : 'Sim, Rejeitar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
