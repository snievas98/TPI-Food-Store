import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError, EstadoVacio } from '../../../shared/components/States'
import { Paginacion } from '../../../shared/components/Paginacion'
import { BadgeEstado, Button, Modal, Price } from '../../../shared/ui'
import { handleApiError } from '../../../shared/api/handleApiError'
import { usePedidoMutations, usePedidos } from '../hooks/usePedidos'
import { DetallePedido } from '../components/DetallePedido'
import type { EstadoPedido, Pedido } from '../types'

export function AdminPedidosPage() {
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<EstadoPedido | ''>('')
  const [selected, setSelected] = useState<Pedido | null>(null)
  const [error, setError] = useState('')
  const pedidos = usePedidos(page * 100, 100, filter)
  const { estado } = usePedidoMutations()
  const advance = async (id: number, next: EstadoPedido) => {
    try { await estado.mutateAsync({ id, estado: next }); setSelected(null); setError('') }
    catch (e) { setError(handleApiError(e)) }
  }
  const columns: ColumnDef<Pedido>[] = [
    { accessorKey: 'id', header: 'Pedido', cell: ({ row }) => `#${row.original.id}` },
    { accessorKey: 'usuario_id', header: 'Cliente ID' },
    { accessorKey: 'created_at', header: 'Fecha', cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString('es-AR') },
    { accessorKey: 'total', header: 'Total', cell: ({ row }) => <Price value={row.original.total}/> },
    { accessorKey: 'estado', header: 'Estado', cell: ({ row }) => <BadgeEstado estado={row.original.estado}/> },
    { id: 'acciones', header: 'Acciones', cell: ({ row }) => <div className="flex gap-2 flex-wrap"><Button variant="outline" onClick={() => setSelected(row.original)}>Ver</Button>{row.original.estado === 'PENDIENTE' && <Button onClick={() => { void advance(row.original.id, 'EN_PREPARACION') }}>Preparar</Button>}{row.original.estado === 'EN_PREPARACION' && <Button onClick={() => { void advance(row.original.id, 'ENTREGADO') }}>Entregar</Button>}{!['ENTREGADO','CANCELADO'].includes(row.original.estado) && <Button variant="danger" onClick={() => { if (window.confirm('¿Cancelar y restituir stock?')) void advance(row.original.id, 'CANCELADO') }}>Cancelar</Button>}</div> },
  ]
  return <><div className="section-heading"><div><h2 className="text-2xl font-bold">Gestión de pedidos</h2><p className="muted">Controlá la preparación y entrega de pedidos.</p></div><select className="field max-w-64" value={filter} onChange={(e) => { setFilter(e.target.value as EstadoPedido | ''); setPage(0) }}><option value="">Todos los estados</option><option value="PENDIENTE">Pendientes</option><option value="EN_PREPARACION">En preparación</option><option value="ENTREGADO">Entregados</option><option value="CANCELADO">Cancelados</option></select></div>{error && <div className="alert-error mb-5">{error}</div>}{pedidos.isPending ? <p>Cargando…</p> : pedidos.isError ? <EstadoError mensaje={handleApiError(pedidos.error)}/> : pedidos.data.items.length ? <><DataTable data={pedidos.data.items} columns={columns} paginate={false}/><Paginacion page={page} size={100} total={pedidos.data.total} onChange={setPage}/></> : <EstadoVacio titulo="No hay pedidos en este estado"/>}
    {selected && <Modal title={`Pedido #${selected.id}`} onClose={() => setSelected(null)}><DetallePedido pedido={selected}/></Modal>}</>
}
