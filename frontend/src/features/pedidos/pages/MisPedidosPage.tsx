import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePedidos, usePedidoMutations } from '../hooks/usePedidos'
import { DetallePedido } from '../components/DetallePedido'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError, EstadoVacio } from '../../../shared/components/States'
import { Paginacion } from '../../../shared/components/Paginacion'
import { BadgeEstado, Button, Card, Modal, Price } from '../../../shared/ui'
import type { Pedido } from '../types'

export function MisPedidosPage() {
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<Pedido | null>(null)
  const [error, setError] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const pedidos = usePedidos(page * 10, 10)
  const { cancelar } = usePedidoMutations()
  const cancel = async (id: number) => {
    if (!window.confirm('¿Cancelar este pedido? Se devolverá el stock al catálogo.')) return
    try { await cancelar.mutateAsync(id); setSelected(null); setError(''); navigate(location.pathname + location.search, { replace: true, state: null }) } catch (e) { setError(handleApiError(e)) }
  }
  return <><div className="section-heading"><div><span className="eyebrow">HISTORIAL DE COMPRAS</span><h1 className="page-title">Mis pedidos</h1><p className="muted">Consultá el estado de tus pedidos.</p></div></div>{(location.state as { exito?: boolean } | null)?.exito && <div className="alert-success mb-5">✓ ¡Pedido confirmado! El negocio ya puede verlo.</div>}{error && <div className="alert-error mb-5">{error}</div>}
    {pedidos.isPending ? <p className="muted">Cargando pedidos…</p> : pedidos.isError ? <EstadoError mensaje={handleApiError(pedidos.error)}/> : !pedidos.data.items.length ? <EstadoVacio titulo="Todavía no tenés pedidos" texto="Cuando hagas una compra, aparecerá acá."/> : <><div className="space-y-4">{pedidos.data.items.map((p) => <Card key={p.id} className="order-row"><div><div className="flex items-center gap-3 flex-wrap"><strong className="text-lg">Pedido #{p.id}</strong><BadgeEstado estado={p.estado}/></div><p className="muted text-sm mt-1">{new Date(p.created_at).toLocaleString('es-AR')} · {p.items.length} productos</p></div><strong className="text-lg"><Price value={p.total}/></strong><div className="flex gap-2"><Button variant="outline" onClick={() => setSelected(p)}>Ver detalle</Button>{p.estado === 'PENDIENTE' && <Button variant="danger" onClick={() => { void cancel(p.id) }} disabled={cancelar.isPending}>Cancelar</Button>}</div></Card>)}</div><Paginacion page={page} size={10} total={pedidos.data.total} onChange={setPage}/></>}
    {selected && <Modal title="Detalle del pedido" onClose={() => setSelected(null)}><DetallePedido pedido={selected}/>{selected.estado === 'PENDIENTE' && <Button variant="danger" className="mt-4" onClick={() => { void cancel(selected.id) }}>Cancelar pedido</Button>}</Modal>}</>
}
