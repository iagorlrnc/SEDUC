import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Grid,
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress, 
  useTheme, 
  Paper,
  Divider
} from '@mui/material';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  Users, 
  School, 
  MapPin, 
  TrendingUp, 
  BrainCircuit, 
  CalendarClock 
} from 'lucide-react';
import { api } from '../services/api';

// Cores para os gráficos (Harmonia visual escura/clara)
const COLORS = ['#2a80ff', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

interface KPIProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const KPICard: React.FC<KPIProps> = ({ title, value, icon, color }) => {
  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Detalhe de gradiente superior no card */}
      <Box sx={{ height: 4, bgcolor: color }} />
      <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {value}
          </Typography>
        </Box>
        <AvatarContainer color={color}>{icon}</AvatarContainer>
      </CardContent>
    </Card>
  );
};

const AvatarContainer: React.FC<{ children: React.ReactNode; color: string }> = ({ children, color }) => (
  <Box 
    sx={{ 
      p: 1.5, 
      borderRadius: 3, 
      bgcolor: color + '18', 
      color: color, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}
  >
    {children}
  </Box>
);

// Função auxiliar simples para renderizar Markdown do resumo analítico básico
const renderMarkdown = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, index) => {
    let cleanLine = line.trim();
    if (cleanLine.startsWith('### ')) {
      return (
        <Typography key={index} variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mt: 2, mb: 1 }}>
          {cleanLine.replace('### ', '')}
        </Typography>
      );
    }
    if (cleanLine.startsWith('#### ')) {
      return (
        <Typography key={index} variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 650, mt: 1.5, mb: 0.5 }}>
          {cleanLine.replace('#### ', '')}
        </Typography>
      );
    }
    if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = cleanLine.substring(2).split(boldRegex);
      return (
        <Box key={index} sx={{ display: 'flex', gap: 1, ml: 2, mb: 0.8 }}>
          <Typography color="primary">•</Typography>
          <Typography variant="body2">
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
          </Typography>
        </Box>
      );
    }
    if (cleanLine.match(/^\d+\./)) {
      const boldRegex = /\*\*(.*?)\*\*/g;
      const content = cleanLine.replace(/^\d+\.\s*/, '');
      const parts = content.split(boldRegex);
      return (
        <Box key={index} sx={{ display: 'flex', gap: 1, ml: 2, mb: 0.8 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
            {cleanLine.match(/^\d+\./)?.[0]}
          </Typography>
          <Typography variant="body2">
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
          </Typography>
        </Box>
      );
    }
    if (cleanLine.length > 0) {
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = cleanLine.split(boldRegex);
      return (
        <Typography key={index} variant="body2" sx={{ mb: 1.5, lineHeight: 1.6 }}>
          {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
        </Typography>
      );
    }
    return <Box key={index} sx={{ height: 8 }} />;
  });
};

export const Dashboard: React.FC = () => {
  const theme = useTheme();

  // Queries usando React Query
  const { data: resumo, isLoading: loadingResumo } = useQuery({
    queryKey: ['dashboard-resumo'],
    queryFn: async () => {
      const res = await api.get('/dashboard/resumo');
      return res.data;
    }
  });

  const { data: porMunicipio } = useQuery({
    queryKey: ['dashboard-municipio'],
    queryFn: async () => {
      const res = await api.get('/dashboard/alunos-por-municipio');
      return res.data;
    }
  });

  const { data: porEscola } = useQuery({
    queryKey: ['dashboard-escola'],
    queryFn: async () => {
      const res = await api.get('/dashboard/alunos-por-escola');
      return res.data;
    }
  });

  const { data: porSerie } = useQuery({
    queryKey: ['dashboard-serie'],
    queryFn: async () => {
      const res = await api.get('/dashboard/alunos-por-serie');
      return res.data;
    }
  });

  const { data: faixaEtaria } = useQuery({
    queryKey: ['dashboard-faixa-etaria'],
    queryFn: async () => {
      const res = await api.get('/dashboard/faixa-etaria');
      return res.data;
    }
  });

  if (loadingResumo) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <CircularProgress size={44} />
        <Typography color="text.secondary">Carregando painel estatístico...</Typography>
      </Box>
    );
  }

  const isBaseEmpty = !resumo || resumo.totalAlunos === 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {isBaseEmpty ? (
        <Paper 
          sx={{ 
            p: 5, 
            textAlign: 'center', 
            borderRadius: 3, 
            borderStyle: 'dashed', 
            borderWidth: 2, 
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <BrainCircuit size={48} color={theme.palette.text.secondary} style={{ marginBottom: 16 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Base de Alunos Vazia
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
            Nenhum aluno está matriculado no sistema. Por favor, acesse o menu <strong>Importar Dados</strong> na barra lateral para carregar um arquivo JSON ou SQL e gerar os dashboards estatísticos de forma automatizada.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Grid de KPIs principais */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KPICard 
                title="Total de Alunos" 
                value={resumo.totalAlunos.toLocaleString()} 
                icon={<Users size={22} />} 
                color="#2a80ff" 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KPICard 
                title="Escolas Cadastradas" 
                value={resumo.totalEscolas} 
                icon={<School size={22} />} 
                color="#10b981" 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KPICard 
                title="Municípios Atendidos" 
                value={resumo.totalMunicipios} 
                icon={<MapPin size={22} />} 
                color="#f59e0b" 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KPICard 
                title="Média de Idade" 
                value={`${resumo.mediaIdade} anos`} 
                icon={<CalendarClock size={22} />} 
                color="#8b5cf6" 
              />
            </Grid>
          </Grid>

          {/* Seção AI Analytics Insights */}
          <Card 
            sx={{ 
              borderRadius: 3, 
              border: '1px solid',
              borderColor: theme.palette.mode === 'light' ? 'rgba(0, 51, 102, 0.1)' : 'rgba(42, 128, 255, 0.15)',
              bgcolor: theme.palette.mode === 'light' ? '#f0f7ff' : '#0a1220',
              backgroundImage: theme.palette.mode === 'light' ? 'none' : 'radial-gradient(circle at 100% 100%, rgba(42, 128, 255, 0.05) 0%, transparent 60%)'
            }}
          >
          </Card>

          {/* Gráficos Linha 1 */}
          <Grid container spacing={3}>
            {/* Alunos por Município (Barras Horizontais) */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapPin size={18} color="#2a80ff" /> Alunos por Município
                  </Typography>
                  <Box sx={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={porMunicipio || []} 
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                      >
                        <XAxis type="number" stroke={theme.palette.text.secondary} fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke={theme.palette.text.secondary} fontSize={11} width={80} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: theme.palette.background.paper, 
                            borderColor: theme.palette.divider,
                            color: theme.palette.text.primary 
                          }} 
                        />
                        <Bar dataKey="value" fill="#2a80ff" radius={[0, 4, 4, 0]} barSize={14} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Distribuição por Série (Rosca) */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp size={18} color="#8b5cf6" /> Alunos por Série
                  </Typography>
                  <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={porSerie || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {(porSerie || []).map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: theme.palette.background.paper, 
                            borderColor: theme.palette.divider,
                            color: theme.palette.text.primary 
                          }} 
                        />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Gráficos Linha 2 */}
          <Grid container spacing={3}>
            {/* Distribuição por Faixa Etária */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarClock size={18} color="#f59e0b" /> Distribuição por Faixa Etária
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={faixaEtaria || []}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <XAxis dataKey="name" stroke={theme.palette.text.secondary} fontSize={12} />
                        <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: theme.palette.background.paper, 
                            borderColor: theme.palette.divider,
                            color: theme.palette.text.primary 
                          }} 
                        />
                        <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Matrículas por Escola */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <School size={18} color="#10b981" /> Densidade por Escola
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={porEscola || []}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <XAxis dataKey="name" stroke={theme.palette.text.secondary} fontSize={10} tickFormatter={(val) => val.length > 15 ? val.substring(0, 12) + '...' : val} />
                        <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: theme.palette.background.paper, 
                            borderColor: theme.palette.divider,
                            color: theme.palette.text.primary 
                          }} 
                        />
                        <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <BrainCircuit size={28} color="#2a80ff" />
                <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.mode === 'light' ? '#003366' : '#fff' }}>
                  Análise da IA
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ color: 'text.primary' }}>
                {renderMarkdown(resumo.insightsIa)}
              </Box>
            </CardContent>
        </>
      )}
    </Box>
  );
};
