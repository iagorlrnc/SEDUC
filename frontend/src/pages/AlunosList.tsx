import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination, 
  TableSortLabel,
  TextField, 
  Button, 
  IconButton, 
  MenuItem, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  Chip, 
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
  CircularProgress,
  DialogContentText,
  Grid
} from '@mui/material';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  FilterX 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Aluno {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  email: string | null;
  telefone: string | null;
  serieId: number;
  serieNome: string;
  escolaId: number;
  escolaNome: string;
  municipioId: number;
  municipioNome: string;
  idade: number;
}

export const AlunosList: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // State de Filtros e Paginação
  const [search, setSearch] = useState('');
  const [municipioFilter, setMunicipioFilter] = useState('');
  const [escolaFilter, setEscolaFilter] = useState('');
  const [serieFilter, setSerieFilter] = useState('');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('nome');
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

  // State de Formulários / Modals
  const [openForm, setOpenForm] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form Fields
  const [formNome, setFormNome] = useState('');
  const [formCpf, setFormCpf] = useState('');
  const [formDataNasc, setFormDataNasc] = useState('');
  const [formSexo, setFormSexo] = useState('M');
  const [formEmail, setFormEmail] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formSerieId, setFormSerieId] = useState('');
  const [formEscolaId, setFormEscolaId] = useState('');

  // Queries de Lookups
  const { data: escolas } = useQuery({ queryKey: ['lookup-escolas'], queryFn: async () => (await api.get('/alunos/escolas')).data });
  const { data: series } = useQuery({ queryKey: ['lookup-series'], queryFn: async () => (await api.get('/alunos/series')).data });
  const { data: municipios } = useQuery({ queryKey: ['lookup-municipios'], queryFn: async () => (await api.get('/alunos/municipios')).data });

  // Query de Alunos (Filtros, Pesquisa e Paginação)
  const { data: alunosPage, isLoading } = useQuery({
    queryKey: ['alunos', page, rowsPerPage, sortBy, direction, search, municipioFilter, escolaFilter, serieFilter],
    queryFn: async () => {
      const params: any = {
        page,
        size: rowsPerPage,
        sortBy,
        direction,
      };
      if (search) params.search = search;
      if (municipioFilter) params.municipio = municipioFilter;
      if (escolaFilter) params.escola = escolaFilter;
      if (serieFilter) params.serie = serieFilter;

      const res = await api.get('/alunos', { params });
      return res.data;
    }
  });

  // Mutações (CRUD)
  const createMutation = useMutation({
    mutationFn: async (novo: any) => await api.post('/alunos', novo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-resumo'] });
      handleCloseForm();
    },
    onError: (error: any) => {
      console.error('Erro ao criar aluno:', error);
      let errorMessage = error.response?.data?.message || 'Erro desconhecido';
      errorMessage = errorMessage.replace(/\d{3}\s*[A-Z_]+/g, '').trim();
      alert('Não foi possível cadastrar o aluno. ' + errorMessage);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => await api.put(`/alunos/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-resumo'] });
      handleCloseForm();
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar aluno:', error);
      let errorMessage = error.response?.data?.message || 'Erro desconhecido';
      errorMessage = errorMessage.replace(/\d{3}\s*[A-Z_]+/g, '').trim();
      alert('Não foi possível atualizar dados do aluno. ' + errorMessage);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => await api.delete(`/alunos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-resumo'] });
      setOpenDelete(false);
      setDeletingId(null);
    }
  });

  // Handlers
  const handleSort = (property: string) => {
    const isAsc = sortBy === property && direction === 'asc';
    setDirection(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  const handleClearFilters = () => {
    setSearch('');
    setMunicipioFilter('');
    setEscolaFilter('');
    setSerieFilter('');
    setPage(0);
  };

  const handleOpenCreateForm = () => {
    setEditingAluno(null);
    setFormNome('');
    setFormCpf('');
    setFormDataNasc('');
    setFormSexo('M');
    setFormEmail('');
    setFormTelefone('');
    setFormSerieId('');
    setFormEscolaId('');
    setOpenForm(true);
  };

  const handleOpenEditForm = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setFormNome(aluno.nome);
    setFormCpf(formatCPF(aluno.cpf));
    setFormDataNasc(aluno.dataNascimento);
    setFormSexo(aluno.sexo);
    setFormEmail(aluno.email || '');
    setFormTelefone(aluno.telefone ? formatPhone(aluno.telefone) : '');
    setFormSerieId(aluno.serieId.toString());
    setFormEscolaId(aluno.escolaId.toString());
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingAluno(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Salvando aluno...');
    console.log('editingAluno:', editingAluno);
    
    const payload = {
      nome: formNome,
      cpf: formCpf.replace(/\D/g, ''),
      dataNascimento: formDataNasc,
      sexo: formSexo,
      email: formEmail || null,
      telefone: formTelefone ? formTelefone.replace(/\D/g, '') : null,
      serieId: Number(formSerieId),
      escolaId: Number(formEscolaId),
    };

    console.log('Payload:', payload);

    if (editingAluno) {
      console.log('Chamando updateMutation com ID:', editingAluno.id);
      updateMutation.mutate({ id: editingAluno.id, data: payload });
    } else {
      console.log('Chamando createMutation');
      createMutation.mutate(payload);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setOpenDelete(true);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
    }
  };

  // Função para formatar CPF (XXX.XXX.XXX-XX)
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    let formatted = '';
    
    if (numbers.length > 0) {
      formatted += numbers.substring(0, 3);
    }
    if (numbers.length > 3) {
      formatted += '.' + numbers.substring(3, 6);
    }
    if (numbers.length > 6) {
      formatted += '.' + numbers.substring(6, 9);
    }
    if (numbers.length > 9) {
      formatted += '-' + numbers.substring(9, 11);
    }
    
    return formatted;
  };

  // Função para formatar telefone ((XX) XXXXX-XXXX)
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    let formatted = '';
    
    if (numbers.length > 0) {
      formatted += '(' + numbers.substring(0, 2);
    }
    if (numbers.length > 2) {
      formatted += ') ' + numbers.substring(2, 7);
    }
    if (numbers.length > 7) {
      formatted += '-' + numbers.substring(7, 11);
    }
    
    return formatted;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormCpf(formatted);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormTelefone(formatted);
  };

  // Funções de Exportação de Relatórios
  const handleExport = (type: 'excel' | 'pdf') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (municipioFilter) params.append('municipio', municipioFilter);
    if (escolaFilter) params.append('escola', escolaFilter);
    if (serieFilter) params.append('serie', serieFilter);

    const url = `/alunos/export/${type}?${params.toString()}`;
    
    api.get(url, { responseType: 'blob' }).then((response) => {
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `alunos_seduc_to_${new Date().getTime()}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
      link.click();
    });
  };

  const hasWriteAccess = user && (user.role === 'ADMIN' || user.role === 'OPERATOR');
  const isAdmin = user && user.role === 'ADMIN';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Bloco de Filtros */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Busca inteligente"
                variant="outlined"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nome, CPF..."
                slotProps={{
                  input: {
                    startAdornment: <Search size={16} style={{ marginRight: 8, opacity: 0.6 }} />,
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2.5 }}>
              <TextField
                select
                fullWidth
                label="Município"
                variant="outlined"
                size="small"
                value={municipioFilter}
                onChange={(e) => setMunicipioFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {municipios?.map((m: any) => (
                  <MenuItem key={m.id} value={m.nome}>{m.nome}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 2.5 }}>
              <TextField
                select
                fullWidth
                label="Escola"
                variant="outlined"
                size="small"
                value={escolaFilter}
                onChange={(e) => setEscolaFilter(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {escolas?.map((e: any) => (
                  <MenuItem key={e.id} value={e.nome}>{e.nome}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                select
                fullWidth
                label="Série"
                variant="outlined"
                size="small"
                value={serieFilter}
                onChange={(e) => setSerieFilter(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {series?.map((s: any) => (
                  <MenuItem key={s.id} value={s.nome}>{s.nome}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                color="inherit" 
                fullWidth 
                onClick={handleClearFilters}
                startIcon={<FilterX size={16} />}
              >
                Limpar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Grid de Dados e Tabela */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {/* Header da Tabela com botões de Ações globais */}
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Registros de Alunos
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button 
                variant="outlined" 
                color="success" 
                size="small"
                startIcon={<FileSpreadsheet size={16} />}
                onClick={() => handleExport('excel')}
              >
                Excel
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                size="small"
                startIcon={<FileText size={16} />}
                onClick={() => handleExport('pdf')}
              >
                PDF
              </Button>
              {hasWriteAccess && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<Plus size={16} />}
                  onClick={handleOpenCreateForm}
                >
                  Novo Aluno
                </Button>
              )}
            </Box>
          </Box>

          <TableContainer>
            {isLoading ? (
              <Box sx={{ display: 'flex', py: 8, justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress size={36} />
              </Box>
            ) : (
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'nome'}
                        direction={sortBy === 'nome' ? direction : 'asc'}
                        onClick={() => handleSort('nome')}
                        style={{ fontWeight: 600 }}
                      >
                        Nome
                      </TableSortLabel>
                    </TableCell>
                    <TableCell style={{ fontWeight: 600 }}>CPF</TableCell>
                    <TableCell style={{ fontWeight: 600 }}>Série</TableCell>
                    <TableCell style={{ fontWeight: 600 }}>Escola</TableCell>
                    <TableCell style={{ fontWeight: 600 }}>Município</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'dataNascimento'}
                        direction={sortBy === 'dataNascimento' ? direction : 'asc'}
                        onClick={() => handleSort('dataNascimento')}
                        style={{ fontWeight: 600 }}
                      >
                        Idade
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" style={{ fontWeight: 600, paddingRight: 24 }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alunosPage?.content?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        Nenhum aluno encontrado para os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    alunosPage?.content?.map((aluno: Aluno) => (
                      <TableRow key={aluno.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{aluno.nome}</TableCell>
                        <TableCell>
                          {formatCPF(aluno.cpf)}
                        </TableCell>
                        <TableCell>
                          <Chip label={aluno.serieNome} size="small" variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>{aluno.escolaNome}</TableCell>
                        <TableCell>{aluno.municipioNome}</TableCell>
                        <TableCell>{aluno.idade} anos</TableCell>
                        <TableCell align="right" sx={{ paddingRight: 24 }}>
                          {hasWriteAccess && (
                            <IconButton 
                              color="primary" 
                              size="small" 
                              onClick={() => handleOpenEditForm(aluno)}
                              title="Editar aluno"
                            >
                              <Edit size={16} />
                            </IconButton>
                          )}
                          {isAdmin && (
                            <IconButton 
                              color="error" 
                              size="small" 
                              onClick={() => handleDeleteClick(aluno.id)}
                              title="Excluir aluno"
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={alunosPage?.totalElements || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Registros por página:"
          />
        </CardContent>
      </Card>

      {/* Dialog para Formulário de Criar/Editar */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingAluno ? 'Editar Dados do Aluno' : 'Cadastrar Novo Aluno'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSave}>
          <DialogContent>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  fullWidth
                  label="Nome Completo"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  label="CPF"
                  placeholder="000.000.000-00"
                  value={formCpf}
                  onChange={handleCpfChange}
                  slotProps={{
                    htmlInput: { maxLength: 14 }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="Data de Nascimento"
                  value={formDataNasc}
                  onChange={(e) => setFormDataNasc(e.target.value)}
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ fontSize: '0.85rem' }}>Sexo</FormLabel>
                  <RadioGroup row value={formSexo} onChange={(e) => setFormSexo(e.target.value)}>
                    <FormControlLabel value="M" control={<Radio />} label="Masculino" />
                    <FormControlLabel value="F" control={<Radio />} label="Feminino" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="email"
                  label="E-mail (opcional)"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Telefone (opcional)"
                  placeholder="(63) 99999-9999"
                  value={formTelefone}
                  onChange={handlePhoneChange}
                  slotProps={{
                    htmlInput: { maxLength: 15 }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  select
                  fullWidth
                  label="Série"
                  value={formSerieId}
                  onChange={(e) => setFormSerieId(e.target.value)}
                >
                  {series?.map((s: any) => (
                    <MenuItem key={s.id} value={s.id.toString()}>{s.nome}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  select
                  fullWidth
                  label="Escola Estadual"
                  value={formEscolaId}
                  onChange={(e) => setFormEscolaId(e.target.value)}
                >
                  {escolas?.map((es: any) => (
                    <MenuItem key={es.id} value={es.id.toString()}>
                      {es.nome} ({es.municipio.nome})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseForm} color="inherit">
              Cancelar
            </Button>
            <Button 
              onClick={(e) => {
                e.preventDefault();
                handleSave(e);
              }}
              variant="contained" 
              color="primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Salvar Registro
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza de que deseja excluir permanentemente o registro deste aluno? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDelete(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleteMutation.isPending}>
            Excluir Registro
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
