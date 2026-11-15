import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelarPedido, cambiarEstado, crearPedido, getPedidos, getResumen } from '../api/pedidos'
import type { EstadoPedido } from '../types'
export const usePedidos = (skip = 0, limit = 20, estado: EstadoPedido | '' = '') => useQuery({ queryKey: ['pedidos', skip, limit, estado], queryFn: () => getPedidos(skip, limit, estado) })
export const useResumenPedidos = () => useQuery({ queryKey: ['resumen'], queryFn: getResumen })
export function usePedidoMutations() {
  const qc = useQueryClient()
  const onSuccess = () => { void qc.invalidateQueries({ queryKey: ['pedidos'] }); void qc.invalidateQueries({ queryKey: ['productos'] }); void qc.invalidateQueries({ queryKey: ['resumen'] }) }
  return {
    crear: useMutation({ mutationFn: crearPedido, onSuccess }),
    cancelar: useMutation({ mutationFn: cancelarPedido, onSuccess }),
    estado: useMutation({ mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstado(id, estado), onSuccess }),
  }
}
