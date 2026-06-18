import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {  
  CardContent, 
  Typography, 
  Box, 
  CircularProgress, 
  useTheme, 
  Divider,
} from '@mui/material';
import {BrainCircuit} from 'lucide-react';
import { api } from '../services/api';

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

export const Resume: React.FC = () => {
  const theme = useTheme();

  // Queries usando React Query
  const { data: resumo, isLoading: loadingResumo } = useQuery({
    queryKey: ['dashboard-resumo'],
    queryFn: async () => {
      const res = await api.get('/dashboard/resumo');
      return res.data;
    }
  });

  if (loadingResumo) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <CircularProgress size={44} />
        <Typography color="text.secondary">Carregando resumo...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <>
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
    </Box>
  );
};
