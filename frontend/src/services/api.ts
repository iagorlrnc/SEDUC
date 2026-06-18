import axios from 'axios';

// Configura dinamicamente a URL da API
const API_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:8080/api' : '/api');

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token em cada requisição se o localStorage possuir
api.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem('seduc_user');
  if (savedUser) {
    try {
      const parsed = JSON.parse(savedUser);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch (e) {
      // Falha silenciosa
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para tratar respostas e deslogar em caso de 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('seduc_user');
      // Limpa os cabeçalhos padrões
      delete api.defaults.headers.common['Authorization'];
      // Redireciona para login se não estiver na página de login
      if (!window.location.pathname.endsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
