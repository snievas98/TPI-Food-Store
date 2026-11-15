import { api } from '../../../shared/api/axiosInstance'
import type { Registro, Usuario } from '../types'

export async function iniciarSesion(username: string, password: string): Promise<void> {
  const form = new URLSearchParams({ username, password })
  await api.post('/auth/token', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
}
export async function registrarse(data: Registro): Promise<Usuario> {
  const { data: user } = await api.post<Usuario>('/auth/register', data)
  return user
}
export async function obtenerSesion(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me')
  return data
}
export async function cerrarSesion(): Promise<void> {
  await api.post('/auth/logout')
}
