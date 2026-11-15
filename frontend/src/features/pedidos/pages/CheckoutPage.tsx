import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../../store/cartStore'
import { usePedidoMutations } from '../hooks/usePedidos'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button, Card, Input, Price } from '../../../shared/ui'
import type { FormaPago } from '../types'

export function CheckoutPage() {
  const { items, total, vaciar } = useCartStore()
  const { crear } = usePedidoMutations()
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const form = useForm({ defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' }, onSubmit: async ({ value }) => {
    setError('')
    if (!items.length) { setError('Tu carrito está vacío.'); return }
    try {
      await crear.mutateAsync({ direccion_entrega: value.direccion_entrega, forma_pago: value.forma_pago, notas: value.notas,
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })) })
      vaciar(); navigate('/mis-pedidos', { state: { exito: true } })
    } catch (e) { setError(handleApiError(e)) }
  } })
  return <><div className="section-heading"><div><span className="eyebrow">ÚLTIMO PASO</span><h1 className="page-title">Confirmar pedido</h1><p className="muted">Ya falta poco para disfrutar tu comida.</p></div></div><div className="two-column"><Card className="p-7"><h2 className="text-xl font-bold mb-5">Datos de entrega</h2><form className="space-y-5" onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); void form.handleSubmit() }}>
    <form.Field name="direccion_entrega" validators={{ onBlur: ({ value }) => value.trim().length < 5 || value.trim().length > 200 ? 'Ingresá una dirección de entre 5 y 200 caracteres' : undefined }}>{(field) => <label className="form-label">Dirección de entrega *<Input placeholder="Calle, altura, piso y departamento" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} required/><span className="validation">{field.state.meta.errors.join(', ')}</span></label>}</form.Field>
    <form.Field name="forma_pago">{(field) => <label className="form-label">Forma de pago *<select className="field" value={field.state.value} onChange={(e) => field.handleChange(e.target.value as FormaPago)}><option value="EFECTIVO">Efectivo</option><option value="TRANSFERENCIA">Transferencia bancaria</option></select></label>}</form.Field>
    <form.Field name="notas">{(field) => <label className="form-label">Notas para el local (opcional)<textarea className="field min-h-28" placeholder="Sin cebolla, tocar timbre…" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} /></label>}</form.Field>
    {error && <div className="alert-error" role="alert">{error}</div>}
    <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>{([canSubmit, loading]) => <Button type="submit" className="w-full" disabled={!canSubmit || loading || !items.length}>{loading ? 'Confirmando…' : 'Confirmar pedido →'}</Button>}</form.Subscribe>
    <p className="muted text-sm">El pago se coordina con el negocio. No se procesa en esta aplicación.</p>
  </form></Card><Card className="summary-card"><h2 className="text-xl font-bold mb-5">Tu pedido</h2>{items.map((i) => <div key={i.producto_id} className="summary-line"><span>{i.cantidad} × {i.nombre}</span><Price value={i.cantidad * i.precio_unitario}/></div>)}<div className="summary-total"><span>Total</span><Price value={total()}/></div><Link to="/carrito" className="link">← Editar carrito</Link></Card></div></>
}
