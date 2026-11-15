import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { Rol } from '../features/auth/types'

export function ProtectedRoute({ role }: { role?: Rol }) {
  const { usuario, cargando } = useAuthStore()
  const location = useLocation()
  if (cargando) return <div className="empty-state">Verificando sesión…</div>
  if (!usuario) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (role && usuario.role !== role) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
