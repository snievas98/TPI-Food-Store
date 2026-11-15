import { api } from '../../../shared/api/axiosInstance'
import type { EstadoPedido, Pedido, PedidoCreate, PedidosPaginados, ResumenPedidos } from '../types'
export async function getPedidos(skip = 0, limit = 20, estado: EstadoPedido | '' = ''): Promise<PedidosPaginados> {
  const { data } = await api.get<PedidosPaginados>('/pedidos', { params: { skip, limit, estado: estado || undefined } }); return data
}
export async function crearPedido(input: PedidoCreate): Promise<Pedido> { const { data } = await api.post<Pedido>('/pedidos', input); return data }
export async function cancelarPedido(id: number): Promise<Pedido> { const { data } = await api.patch<Pedido>(`/pedidos/${id}/cancelar`); return data }
export async function cambiarEstado(id: number, estado: EstadoPedido): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado }); return data
}
export async function getResumen(): Promise<ResumenPedidos> { const { data } = await api.get<ResumenPedidos>('/pedidos/resumen'); return data }
