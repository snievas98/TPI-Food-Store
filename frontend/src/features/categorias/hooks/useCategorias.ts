import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from '../api/categorias'
export const useCategorias = () => useQuery({ queryKey: ['categorias'], queryFn: getCategorias })
export function useCategoriaMutations() {
  const qc = useQueryClient()
  const onSuccess = () => { void qc.invalidateQueries({ queryKey: ['categorias'] }); void qc.invalidateQueries({ queryKey: ['productos'] }) }
  return {
    crear: useMutation({ mutationFn: createCategoria, onSuccess }),
    editar: useMutation({ mutationFn: ({ id, input }: { id: number; input: { nombre: string; descripcion: string } }) => updateCategoria(id, input), onSuccess }),
    borrar: useMutation({ mutationFn: deleteCategoria, onSuccess }),
  }
}
