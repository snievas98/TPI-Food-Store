import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useAuthStore } from '../../../store/authStore'
import { useUsuarios, useUserMutation } from '../hooks/useUsuarios'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError, EstadoVacio } from '../../../shared/components/States'
import { Button } from '../../../shared/ui'
import { handleApiError } from '../../../shared/api/handleApiError'
import type { Usuario } from '../../auth/types'

export function AdminUsuariosPage() {
  const usuarios = useUsuarios()
  const mutacion = useUserMutation()
  const current = useAuthStore((s) => s.usuario)
  const [error, setError] = useState('')
  const change = async (id: number, active: boolean) => {
    try { setError(''); await mutacion.mutateAsync({ id, active }) } catch (e) { setError(handleApiError(e)) }
  }
  const columns: ColumnDef<Usuario>[] = [
    { accessorKey: 'id', header: 'ID' }, { accessorKey: 'username', header: 'Usuario' },
    { accessorKey: 'full_name', header: 'Nombre completo' }, { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Rol', cell: ({ row }) => row.original.role === 'admin' ? 'Administrador' : 'Cliente' },
    { accessorKey: 'disabled', header: 'Estado', cell: ({ row }) => row.original.disabled ? <span className="pill-disabled">Desactivado</span> : <span className="pill-active">Activo</span> },
    { id: 'acciones', header: 'Acciones', cell: ({ row }) => row.original.disabled ? <Button disabled={mutacion.isPending} onClick={() => { void change(row.original.id, true) }}>Activar</Button> : row.original.id === current?.id ? <span className="muted text-xs">Tu cuenta</span> : <Button variant="danger" disabled={mutacion.isPending} onClick={() => { if (window.confirm('¿Desactivar este usuario?')) void change(row.original.id, false) }}>Desactivar</Button> },
  ]
  return <><div className="section-heading"><div><h2 className="text-2xl font-bold">Usuarios</h2><p className="muted">Administrá el acceso de tus clientes.</p></div></div>{error && <div className="alert-error mb-5">{error}</div>}{usuarios.isPending ? <p>Cargando usuarios…</p> : usuarios.isError ? <EstadoError mensaje={handleApiError(usuarios.error)}/> : usuarios.data.length ? <DataTable data={usuarios.data} columns={columns}/> : <EstadoVacio titulo="No hay usuarios"/>}</>
}
