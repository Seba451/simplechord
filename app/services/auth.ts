import axios from 'axios';

interface RegisterData {
  usuario: string;
  email: string;
  password: string;
}

interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  }
});

export const getUserService = async () => {
  try {
    const response = await api.get('/auth/me', {
      withCredentials: true 
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('No estás autenticado. Por favor inicia sesión.');
    }
    throw error;
  }}

export const logoutService = async () => {
  try {
    const response = await api.post('/auth/logout', {}, {
      withCredentials: true 
    });
    return response.data;
  } catch (error: any) {
    throw new Error('Error al cerrar sesión. Por favor intenta nuevamente.');
  }
};

export const authService = {
  register: async (userData: RegisterData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        throw new Error('Datos inválidos. Por favor verifica la información.');
      }
      throw error;
    }
  },

  login: async (credentials: LoginCredentials) => {
    try {
      const formData = new URLSearchParams({
        username: credentials.usernameOrEmail,
        password: credentials.password
      });

      const response = await api.post('/auth/token', 
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          withCredentials: true // Importante para permitir cookies
        }
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

};