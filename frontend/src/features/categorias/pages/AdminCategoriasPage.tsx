import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import type { ColumnDef } from '@tanstack/react-table'
import { useCategorias, useCategoriaMutations } from '../hooks/useCategorias'
import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError, EstadoVacio } from '../../../shared/components/States'
import { Button, Input, Modal } from '../../../shared/ui'
import type { Categoria } from '../types'
import type { CategoriaInput } from '../api/categorias'

function CategoriaEditor({ initial, save, close }: { initial: Categoria | null; save: (data: CategoriaInput) => Promise<void>; close: () => void }) {
  const [error, setError] = useState('')
  const form = useForm({ defaultValues: { nombre: initial?.nombre ?? '', descripcion: initial?.descripcion ?? '' }, onSubmit: async ({ value }) => {
    try { setError(''); await save(value); close() } catch (e) { setError(handleApiError(e)) }
  } })
  return <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); void form.handleSubmit() }}>
    <form.Field name="nombre" validators={{ onBlur: ({ value }) => value.trim().length < 2 || value.length > 100 ? 'Nombre entre 2 y 100 caracteres' : undefined }}>{(field) => <label className="form-label">Nombre *<Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} required/><span className="validation">{field.state.meta.errors.join(', ')}</span></label>}</form.Field>
    <form.Field name="descripcion">{(field) => <label className="form-label">Descripción<textarea className="field min-h-28" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)}/></label>}</form.Field>
    {error && <div role="alert" className="alert-error">{error}</div>}
    <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>{([ok, busy]) => <Button type="submit" disabled={!ok || busy} className="w-full">{busy ? 'Guardando…' : 'Guardar categoría'}</Button>}</form.Subscribe>
  </form>
}

export function AdminCategoriasPage() {
  const categories = useCategorias()
  const mutations = useCategoriaMutations()
  const [edit, setEdit] = useState<Categoria | null | 'new'>(null)
  const [error, setError] = useState('')
  const columns: ColumnDef<Categoria>[] = [
    { accessorKey: 'id', header: 'ID' }, { accessorKey: 'nombre', header: 'Categoría' },
    { accessorKey: 'descripcion', header: 'Descripción' },
    { id: 'acciones', header: 'Acciones', cell: ({ row }) => <div className="flex gap-2"><Button variant="outline" onClick={() => setEdit(row.original)}>Editar</Button><Button variant="danger" onClick={async () => { if (!window.confirm(`¿Dar de baja la categoría ${row.original.nombre}?`)) return; try { setError(''); await mutations.borrar.mutateAsync(row.original.id) } catch (e) { setError(handleApiError(e)) } }}>Eliminar</Button></div> },
  ]
  return <><div className="section-heading"><div><h2 className="text-2xl font-bold">Categorías</h2><p className="muted">Organizá las secciones de tu carta.</p></div><Button onClick={() => setEdit('new')}>+ Nueva categoría</Button></div>
    {error && <div className="alert-error mb-5">{error}</div>}{categories.isPending ? <p>Cargando categorías…</p> : categories.isError ? <EstadoError mensaje={handleApiError(categories.error)}/> : categories.data.length ? <DataTable data={categories.data} columns={columns}/> : <EstadoVacio titulo="No hay categorías"/>}
    {edit !== null && <Modal title={edit === 'new' ? 'Nueva categoría' : 'Editar categoría'} onClose={() => setEdit(null)}><CategoriaEditor key={edit === 'new' ? 'new' : edit.id} initial={edit === 'new' ? null : edit} close={() => setEdit(null)} save={async (data) => { if (edit === 'new') await mutations.crear.mutateAsync(data); else if (edit) await mutations.editar.mutateAsync({ id: edit.id, input: data }) }}/></Modal>}
  </>
}
