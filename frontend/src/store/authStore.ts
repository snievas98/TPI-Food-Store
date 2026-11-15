import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cerrarSesion, iniciarSesion, obtenerSesion } from '../features/auth/api/auth'
import type { Usuario } from '../features/auth/types'
import { queryClient } from '../shared/api/queryClient'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  clear: () => void
}

export const useAuthStore = create<AuthState>()(persist((set) => ({
  usuario: null,
  cargando: true,
  clear: () => { set({ usuario: null, cargando: false }); queryClient.clear() },
  login: async (username, password) => {
    await iniciarSesion(username, password)
    const usuario = await obtenerSesion()
    set({ usuario, cargando: false })
  },
  logout: async () => {
    try { await cerrarSesion() } finally { set({ usuario: null, cargando: false }); queryClient.clear() }
  },
  checkSession: async () => {
    set({ cargando: true })
    try { const usuario = await obtenerSesion(); set({ usuario }) }
    catch { set({ usuario: null }) }
    finally { set({ cargando: false }) }
  },
}), { name: 'foodstore-auth', partialize: (state) => ({ usuario: state.usuario }) }))
