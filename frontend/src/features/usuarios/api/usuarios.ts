import { api } from '../../../shared/api/axiosInstance'
import type { Usuario } from '../../auth/types'
export async function getUsuarios(): Promise<Usuario[]> { const { data } = await api.get<Usuario[]>('/admin/usuarios'); return data }
export async function setUserActive(id: number, active: boolean): Promise<Usuario> {
  const { data } = await api.post<Usuario>(`/admin/usuarios/${id}/${active ? 'activar' : 'desactivar'}`); return data
}
