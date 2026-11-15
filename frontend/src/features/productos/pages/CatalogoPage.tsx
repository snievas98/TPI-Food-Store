import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { useProductos } from '../hooks/useProductos'
import { ProductoCard } from '../components/ProductoCard'
import { EstadoError, EstadoVacio, Skeleton } from '../../../shared/components/States'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Input } from '../../../shared/ui'
import { handleApiError } from '../../../shared/api/handleApiError'

const PAGE_SIZE = 8
export function CatalogoPage() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  useEffect(() => { const timeout = window.setTimeout(() => { setQuery(search); setPage(0) }, 300); return () => window.clearTimeout(timeout) }, [search])
  const categorias = useCategorias()
  const productos = useProductos({ skip: page * PAGE_SIZE, limit: PAGE_SIZE, search: query, categoria_id: category })
  return <><section className="hero"><div className="hero-copy"><span className="eyebrow">✳ HECHO CON AMOR, SERVIDO CALIENTE</span><h1>Buena comida.<br/><em>Mejores momentos.</em></h1><p>Hamburguesas increíbles, pizzas irresistibles y mucho más. Elegí lo que te gusta y nosotros nos encargamos del resto.</p><a href="#menu" className="btn btn-primary">Explorar el menú ↓</a></div><div className="hero-visual"><div className="food-circle">🍔</div><div className="hero-sticker">¡A comer! <span>✳</span></div></div></section>
    <section id="menu" className="pt-10"><div className="section-heading"><div><span className="eyebrow">ALGO RICO TE ESPERA</span><h2 className="page-title">Nuestro menú</h2><p className="muted">Encontrá tu próximo favorito.</p></div><Link to="/carrito" className="btn btn-outline">Ver carrito →</Link></div>
    <div className="filters"><Input aria-label="Buscar productos" placeholder="🔎  Buscá algo rico…" value={search} onChange={(e) => setSearch(e.target.value)}/><select className="field" aria-label="Filtrar por categoría" value={category ?? ''} onChange={(e) => { setCategory(e.target.value ? Number(e.target.value) : null); setPage(0) }}><option value="">Todas las categorías</option>{categorias.data?.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
    {productos.isPending ? <Skeleton/> : productos.isError ? <EstadoError mensaje={handleApiError(productos.error)} retry={() => { void productos.refetch() }}/> : productos.data.items.length === 0 ? <EstadoVacio/> : <><div className="product-grid">{productos.data.items.map((p) => <ProductoCard key={p.id} producto={p}/>)}</div><Paginacion page={page} size={PAGE_SIZE} total={productos.data.total} onChange={setPage}/></>}
    </section></>
}
