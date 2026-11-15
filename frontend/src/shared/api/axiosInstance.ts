import axios from 'axios'
import { useAuthStore } from '../../store/authStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,
  timeout: 15000,
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const url = error.config?.url ?? ''
      const detail: unknown = error.response?.data?.detail
      if ((error.response?.status === 401 && !url.includes('/auth/token') && !url.includes('/auth/me')) ||
          (error.response?.status === 400 && detail === 'Cuenta de usuario desactivada')) {
        useAuthStore.getState().clear()
      }
    }
    return Promise.reject(error)
  },
)
