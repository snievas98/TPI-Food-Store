import { useState } from 'react'
import { Button, Price } from '../../../shared/ui'
import { useCartStore } from '../../../store/cartStore'
import type { Producto } from '../types'
export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar)
  const [justAdded, setJustAdded] = useState(false)
  const available = producto.disponible && producto.stock > 0
  return <article className="card product-card"><div className="product-image">{producto.imagen_url ? <img src={producto.imagen_url} alt={producto.nombre} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} /> : <span className="text-7xl">🍽️</span>}<span className="category-chip">{producto.categoria.nombre}</span></div><div className="product-info"><h3 className="product-name">{producto.nombre}</h3><p className="product-desc">{producto.descripcion}</p><div className="flex items-center justify-between gap-2 mb-4"><strong className="price"><Price value={producto.precio_base}/></strong><span className="muted text-xs">{available ? `${producto.stock} disponibles` : 'Agotado'}</span></div><Button className="w-full" disabled={!available} onClick={() => { agregar(producto); setJustAdded(true); window.setTimeout(() => setJustAdded(false), 1000) }}>{!available ? 'No disponible' : justAdded ? '✓ Agregado' : '+ Agregar al carrito'}</Button></div></article>
}
