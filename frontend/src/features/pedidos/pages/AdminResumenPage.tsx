import { Link } from 'react-router-dom'
import { useResumenPedidos } from '../hooks/usePedidos'
import { EstadoError } from '../../../shared/components/States'
import { Card, Price } from '../../../shared/ui'
import { handleApiError } from '../../../shared/api/handleApiError'
export function AdminResumenPage() {
  const resumen = useResumenPedidos()
  if (resumen.isPending) return <div className="muted">Cargando indicadores…</div>
  if (resumen.isError) return <EstadoError mensaje={handleApiError(resumen.error)}/>
  const r = resumen.data
  const indicadores = [
    { icon: '🕒', title: 'Pendientes', value: r.pendientes, note: 'Por preparar' },
    { icon: '👨‍🍳', title: 'En preparación', value: r.en_preparacion, note: 'En cocina' },
    { icon: '✅', title: 'Entregados', value: r.entregados, note: 'Finalizados' },
    { icon: '✕', title: 'Cancelados', value: r.cancelados, note: 'Sin entrega' },
    { icon: '📅', title: 'Pedidos hoy', value: r.pedidos_hoy, note: 'Creados durante el día' },
  ]
  return <><div className="section-heading"><div><h2 className="text-2xl font-bold">Tu negocio de un vistazo</h2><p className="muted">Indicadores actualizados desde la base de datos.</p></div><Link to="/admin/pedidos" className="btn btn-primary">Administrar pedidos →</Link></div><div className="metric-grid">{indicadores.map((i) => <Card key={i.title} className="metric-card"><span className="text-3xl">{i.icon}</span><p className="muted mt-3">{i.title}</p><strong className="text-4xl font-extrabold">{i.value}</strong><span className="muted text-xs">{i.note}</span></Card>)}<Card className="metric-card metric-featured"><span className="text-3xl">💰</span><p className="mt-3">Ingresos de pedidos entregados</p><strong className="text-3xl font-extrabold"><Price value={r.ingresos_entregados}/></strong><span className="text-xs opacity-80">No incluye pedidos pendientes o cancelados</span></Card></div></>
}
