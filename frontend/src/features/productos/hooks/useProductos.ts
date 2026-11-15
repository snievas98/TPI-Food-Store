import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProducto, deleteProducto, getProductos, updateProducto, updateStock } from '../api/productos'
import type { ProductFilters } from '../api/productos'
import type { ProductoInput } from '../types'
export const useProductos = (filters: ProductFilters) => useQuery({ queryKey: ['productos', filters], queryFn: () => getProductos(filters) })
export function useProductoMutations() {
  const qc = useQueryClient()
  const onSuccess = () => { void qc.invalidateQueries({ queryKey: ['productos'] }) }
  return {
    crear: useMutation({ mutationFn: createProducto, onSuccess }),
    editar: useMutation({ mutationFn: ({ id, input }: { id: number; input: ProductoInput }) => updateProducto(id, input), onSuccess }),
    borrar: useMutation({ mutationFn: deleteProducto, onSuccess }),
    stock: useMutation({ mutationFn: ({ id, stock, disponible }: { id: number; stock: number; disponible: boolean }) => updateStock(id, stock, disponible), onSuccess }),
  }
}
