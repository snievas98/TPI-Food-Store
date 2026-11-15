import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError, EstadoVacio } from '../../../shared/components/States'
import { Button, Input, Modal, Price } from '../../../shared/ui'
import { handleApiError } from '../../../shared/api/handleApiError'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { useProductoMutations, useProductos } from '../hooks/useProductos'
import type { Categoria, Producto, ProductoInput } from '../types'

function ProductoEditor({ initial, categorias, save, close }: { initial: Producto | null; categorias: Categoria[]; save: (data: ProductoInput) => Promise<void>; close: () => void }) {
  const [error, setError] = useState('')
  const form = useForm({ defaultValues: {
    categoria_id: initial?.categoria_id ?? categorias[0]?.id ?? 0,
    nombre: initial?.nombre ?? '', descripcion: initial?.descripcion ?? '',
    precio_base: initial?.precio_base ?? 0, stock: initial?.stock ?? 0,
    imagen_url: initial?.imagen_url ?? '', disponible: initial?.disponible ?? true,
  }, onSubmit: async ({ value }) => {
    try { setError(''); await save(value); close() } catch (e) { setError(handleApiError(e)) }
  } })
  return <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); void form.handleSubmit() }}>
    <form.Field name="nombre" validators={{ onBlur: ({ value }) => value.trim().length < 2 ? 'Ingresá el nombre del producto' : undefined }}>{(field) => <label className="form-label">Nombre *<Input required placeholder="Ej. Burger con cheddar" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur}/><span className="validation">{field.state.meta.errors.join(', ')}</span></label>}</form.Field>
    <form.Field name="categoria_id">{(field) => <label className="form-label">Categoría *<select required className="field" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))}>{categorias.map((c) => <option value={c.id} key={c.id}>{c.nombre}</option>)}</select></label>}</form.Field>
    <form.Field name="descripcion">{(field) => <label className="form-label">Descripción<textarea className="field min-h-20" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)}/></label>}</form.Field>
    <div className="grid grid-cols-2 gap-4"><form.Field name="precio_base" validators={{ onBlur: ({ value }) => value < 0 ? 'Debe ser ≥ 0' : undefined }}>{(field) => <label className="form-label">Precio ($) *<Input type="number" min={0} step="0.01" required value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))}/></label>}</form.Field><form.Field name="stock" validators={{ onBlur: ({ value }) => value < 0 ? 'Debe ser ≥ 0' : undefined }}>{(field) => <label className="form-label">Stock *<Input type="number" min={0} step="1" required value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))}/></label>}</form.Field></div>
    <form.Field name="imagen_url">{(field) => <label className="form-label">Imagen (URL)<Input type="url" placeholder="https://…" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)}/></label>}</form.Field>
    <form.Field name="disponible">{(field) => <label className="flex gap-3 items-center font-semibold"><input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)}/> Disponible para la venta</label>}</form.Field>
    {error && <div role="alert" className="alert-error">{error}</div>}
    <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>{([ok, busy]) => <Button type="submit" className="w-full" disabled={!ok || busy || !categorias.length}>{busy ? 'Guardando…' : 'Guardar producto'}</Button>}</form.Subscribe>
  </form>
}

function StockEditor({ product, save, close }: { product: Producto; save: (stock: number, disponible: boolean) => Promise<void>; close: () => void }) {
  const [error, setError] = useState('')
  const form = useForm({ defaultValues: { stock: product.stock, disponible: product.disponible }, onSubmit: async ({ value }) => {
    try { setError(''); await save(value.stock, value.disponible); close() } catch (e) { setError(handleApiError(e)) }
  } })
  return <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); void form.handleSubmit() }}>
    <form.Field name="stock" validators={{ onBlur: ({ value }) => value < 0 || !Number.isInteger(value) ? 'Stock debe ser un entero ≥ 0' : undefined }}>{(field) => <label className="form-label">Stock de {product.nombre}<Input type="number" min={0} step={1} value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))}/><span className="validation">{field.state.meta.errors.join(', ')}</span></label>}</form.Field>
    <form.Field name="disponible">{(field) => <label className="flex gap-2 items-center"><input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)}/> Disponible</label>}</form.Field>
    {error && <div className="alert-error">{error}</div>}
    <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>{([ok, busy]) => <Button type="submit" className="w-full" disabled={!ok || busy}>{busy ? 'Actualizando…' : 'Aplicar cambios'}</Button>}</form.Subscribe>
  </form>
}

export function AdminProductosPage() {
  const { data: cats = [] } = useCategorias()
  const products = useProductos({ skip: 0, limit: 100, search: '', categoria_id: null })
  const mutations = useProductoMutations()
  const [edit, setEdit] = useState<Producto | 'new' | null>(null)
  const [stock, setStock] = useState<Producto | null>(null)
  const [error, setError] = useState('')
  const columns: ColumnDef<Producto>[] = [
    { accessorKey: 'id', header: 'ID' }, { accessorKey: 'nombre', header: 'Producto' },
    { id: 'categoria', header: 'Categoría', cell: ({ row }) => row.original.categoria.nombre },
    { accessorKey: 'precio_base', header: 'Precio', cell: ({ row }) => <Price value={row.original.precio_base}/> },
    { accessorKey: 'stock', header: 'Stock' }, { accessorKey: 'disponible', header: 'Disponible', cell: ({ row }) => row.original.disponible ? 'Sí' : 'No' },
    { id: 'acciones', header: 'Acciones', cell: ({ row }) => <div className="flex gap-2 flex-wrap"><Button variant="outline" onClick={() => setEdit(row.original)}>Editar</Button><Button variant="outline" onClick={() => setStock(row.original)}>Stock</Button><Button variant="danger" onClick={async () => { if (!window.confirm(`¿Dar de baja ${row.original.nombre}?`)) return; try { setError(''); await mutations.borrar.mutateAsync(row.original.id) } catch (e) { setError(handleApiError(e)) } }}>Eliminar</Button></div> },
  ]
  return <><div className="section-heading"><div><h2 className="text-2xl font-bold">Productos</h2><p className="muted">Agregá y actualizá la oferta de tu negocio.</p></div><Button disabled={!cats.length} onClick={() => setEdit('new')}>+ Nuevo producto</Button></div>{error && <div className="alert-error mb-5">{error}</div>}{products.isPending ? <p>Cargando productos…</p> : products.isError ? <EstadoError mensaje={handleApiError(products.error)}/> : products.data.items.length ? <><DataTable data={products.data.items} columns={columns}/>{products.data.total > 100 && <p className="muted text-sm mt-4">Mostrando los primeros 100 productos.</p>}</> : <EstadoVacio titulo="No hay productos"/>}
    {edit !== null && <Modal title={edit === 'new' ? 'Nuevo producto' : 'Editar producto'} onClose={() => setEdit(null)}><ProductoEditor key={edit === 'new' ? 'new' : edit.id} initial={edit === 'new' ? null : edit} categorias={cats} close={() => setEdit(null)} save={async (input) => { if (edit === 'new') await mutations.crear.mutateAsync(input); else if (edit) await mutations.editar.mutateAsync({ id: edit.id, input }) }}/></Modal>}
    {stock && <Modal title="Actualizar stock y disponibilidad" onClose={() => setStock(null)}><StockEditor key={stock.id} product={stock} close={() => setStock(null)} save={async (count, available) => { await mutations.stock.mutateAsync({ id: stock.id, stock: count, disponible: available }) }}/></Modal>}
  </>
}
