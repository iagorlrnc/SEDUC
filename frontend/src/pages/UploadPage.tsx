import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Upload,
  History,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  FileText,
  FileJson,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

interface UploadLog {
  id: number;
  usuario: string;
  dataHora: string;
  tipoArquivo: string;
  registrosProcessados: number;
  status: 'SUCESSO' | 'PARCIAL' | 'ERRO';
  logErros: string | null;
}

export const UploadPage: React.FC = () => {
  const queryClient = useQueryClient();
  const theme = useTheme();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<number | null>(null);

  // Fetch log history
  const { data: logs, isLoading: loadingLogs } = useQuery<UploadLog[]>({
    queryKey: ['upload-logs'],
    queryFn: async () => {
      const res = await api.get('/upload/logs');
      return res.data;
    }
  });

  // Mutation para envio do arquivo via multipart/form-data
  const uploadMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: 'json' | 'sql' | 'xml' | 'xlsx' }) => {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post(`/upload/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data;
    },
    onSuccess: (data) => {
      setUploadResult(data);
      setSelectedFile(null);

      // Atualiza logs de upload e dados do dashboard
      queryClient.invalidateQueries({ queryKey: ['upload-logs'] });
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-resumo'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-municipio'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-escola'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-serie'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-faixa-etaria'] });

      // Dispara confetes se o upload foi 100% sucesso
      if (data.status === 'SUCESSO') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    },
    onError: (error: any) => {
      let errorMessage = error.response?.data?.message || 'Erro ao processar arquivo.';
      errorMessage = errorMessage.replace(/\d{3}\s*[A-Z_]+/g, '').trim();
      setUploadResult({
        status: 'ERRO',
        registrosProcessados: 0,
        mensagem: errorMessage,
        logErros: null
      });
      setSelectedFile(null);
    }
  });

  // Mutation para deletar upload log
  const deleteMutation = useMutation({
    mutationFn: async (logId: number) => {
      const res = await api.delete(`/upload/logs/${logId}`);
      return res.data;
    },
    onSuccess: (data) => {
      setDeleteDialogOpen(false);
      setLogToDelete(null);

      // Atualiza logs de upload e dados do dashboard
      queryClient.invalidateQueries({ queryKey: ['upload-logs'] });
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-resumo'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-municipio'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-escola'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-serie'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-faixa-etaria'] });

      setUploadResult({
        status: 'SUCESSO',
        registrosProcessados: data.deletedAlunos,
        mensagem: `Upload e ${data.deletedAlunos} alunos associados foram removidos com sucesso.`,
        logErros: null
      });
    },
    onError: (error: any) => {
      setDeleteDialogOpen(false);
      setLogToDelete(null);
      let errorMessage = error.response?.data?.error || 'Erro ao remover registro.';
      errorMessage = errorMessage.replace(/\d{3}\s*[A-Z_]+/g, '').trim();
      setUploadResult({
        status: 'ERRO',
        registrosProcessados: 0,
        mensagem: errorMessage,
        logErros: null
      });
    }
  });

  // Drag and Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'json' || extension === 'sql' || extension === 'xml' || extension === 'xlsx') {
      setSelectedFile(file);
      setUploadResult(null);
    } else {
      alert('Por favor, envie apenas arquivos com extensão .json, .sql, .xml ou .xlsx.');
    }
  };

  const handleUploadClick = () => {
    if (!selectedFile) return;
    const extension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (extension === 'json' || extension === 'sql' || extension === 'xml' || extension === 'xlsx') {
      uploadMutation.mutate({ file: selectedFile, type: extension as 'json' | 'sql' | 'xml' | 'xlsx' });
    }
  };

  const handleDeleteClick = (logId: number) => {
    setLogToDelete(logId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (logToDelete) {
      deleteMutation.mutate(logToDelete);
    }
  };

  const getStatusChip = (status: UploadLog['status']) => {
    switch (status) {
      case 'SUCESSO':
        return <Chip label="Sucesso" color="success" size="small" icon={<CheckCircle size={14} />} sx={{ fontWeight: 600 }} />;
      case 'PARCIAL':
        return <Chip label="Parcial" color="warning" size="small" icon={<AlertTriangle size={14} />} sx={{ fontWeight: 600 }} />;
      case 'ERRO':
        return <Chip label="Falha" color="error" size="small" icon={<XCircle size={14} />} sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {/* Upload Zone */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Importador de Estudantes (ETL)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Selecione ou arraste um arquivo com a lista de alunos bruta nos formatos <strong>JSON</strong>, <strong>XML</strong>, <strong>XLSX</strong> ou script de inserção <strong>SQL</strong>. O motor de ETL aplicará regras de limpeza de espaços, normalização de nomes, verificação matemática de CPFs e padronização geográfica.
          </Typography>

          <Box
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: '2px dashed',
              borderColor: dragActive ? 'primary.main' : 'divider',
              borderRadius: 3,
              bgcolor: dragActive 
                ? theme.palette.primary.main + '0a' 
                : 'action.hover',
              p: 6,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease, background-color 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: theme.palette.primary.main + '05',
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.sql,.xml,.xlsx"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'background.paper', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Upload size={32} color={theme.palette.primary.main} />
              </Box>
              {selectedFile ? (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Math.round((selectedFile.size / 1024) * 10) / 10} KB • Pronto para processamento
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Arraste seu arquivo JSON, SQL, XML ou XLSX aqui
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ou clique para navegar em seus diretórios locais
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {selectedFile && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1.5 }}>
              <Button color="inherit" onClick={() => setSelectedFile(null)} disabled={uploadMutation.isPending}>
                Descartar
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleUploadClick}
                disabled={uploadMutation.isPending}
                startIcon={uploadMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Upload size={16} />}
              >
                {uploadMutation.isPending ? 'Executando ETL...' : 'Iniciar Carga (Load)'}
              </Button>
            </Box>
          )}

          {/* Resultado do ETL Recente */}
          {uploadResult && (
            <Box sx={{ mt: 4 }}>
              <Alert 
                severity={uploadResult.status === 'SUCESSO' ? 'success' : (uploadResult.status === 'PARCIAL' ? 'warning' : 'error')}
                sx={{ borderRadius: 2, mb: 2 }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Resultado do ETL: {uploadResult.status}
                </Typography>
                <Typography variant="body2">
                  {uploadResult.mensagem} — <strong>{uploadResult.registrosProcessados} alunos</strong> foram importados/atualizados no banco de dados.
                </Typography>
              </Alert>

              {uploadResult.logErros && (
                <Accordion sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', '&::before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ChevronDown size={16} />}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FileText size={16} /> Ver Log de Inconsistências do Processo de Transformação
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box 
                      component="pre" 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: 'background.default', 
                        color: 'error.main',
                        fontSize: '0.8rem',
                        overflowX: 'auto',
                        maxHeight: 250,
                        border: '1px solid',
                        borderColor: 'divider',
                        fontFamily: 'monospace'
                      }}
                    >
                      {uploadResult.logErros}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Upload History logs */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <History size={20} color={theme.palette.text.secondary} /> Histórico de Processamento (Auditoria)
          </Typography>

          {loadingLogs ? (
            <Box sx={{ display: 'flex', py: 4, justifyContent: 'center' }}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell style={{ fontWeight: 600 }}>Data/Hora</TableCell>
                    <TableCell style={{ fontWeight: 600 }}>Usuário</TableCell>
                    <TableCell style={{ fontWeight: 600 }}>Tipo</TableCell>
                    <TableCell style={{ fontWeight: 600 }}>Processados</TableCell>
                    <TableCell style={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell style={{ fontWeight: 600 }}>Relatório de Erros</TableCell>
                    <TableCell style={{ fontWeight: 600 }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Nenhuma carga de dados foi realizada anteriormente.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs?.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell>
                          {new Date(log.dataHora).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{log.usuario}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            {log.tipoArquivo === 'JSON' ? <FileJson size={16} /> : (log.tipoArquivo === 'XLSX' ? <FileSpreadsheet size={16} /> : <FileText size={16} />)}
                            {log.tipoArquivo}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{log.registrosProcessados}</TableCell>
                        <TableCell>{getStatusChip(log.status)}</TableCell>
                        <TableCell>
                          {log.logErros ? (
                            <Button
                              size="small"
                              onClick={() => {
                                setUploadResult({
                                  status: log.status,
                                  registrosProcessados: log.registrosProcessados,
                                  mensagem: `Importação realizada em ${new Date(log.dataHora).toLocaleString('pt-BR')} por ${log.usuario}.`,
                                  logErros: log.logErros
                                });
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              Visualizar Logs
                            </Button>
                          ) : (
                            <Typography variant="caption" color="text.secondary">Nenhum erro</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<Trash2 size={14} />}
                            onClick={() => handleDeleteClick(log.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Remover
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmação para deletar upload */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Remoção</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Tem certeza que deseja remover este upload e todos os {logs?.find(l => l.id === logToDelete)?.registrosProcessados || 0} alunos associados?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteMutation.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Trash2 size={16} />}
          >
            {deleteMutation.isPending ? 'Removendo...' : 'Confirmar Remoção'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
