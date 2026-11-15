import { api } from '../../../shared/api/axiosInstance'
import type { Producto, ProductoInput, ProductosPaginados } from '../types'
export interface ProductFilters { skip: number; limit: number; search: string; categoria_id: number | null; disponible?: boolean }
export async function getProductos(filters: ProductFilters): Promise<ProductosPaginados> {
  const { data } = await api.get<ProductosPaginados>('/productos', { params: { ...filters, categoria_id: filters.categoria_id ?? undefined } })
  return data
}
export async function createProducto(input: ProductoInput): Promise<Producto> { const { data } = await api.post<Producto>('/productos', input); return data }
export async function updateProducto(id: number, input: ProductoInput): Promise<Producto> { const { data } = await api.put<Producto>(`/productos/${id}`, input); return data }
export async function deleteProducto(id: number): Promise<void> { await api.delete(`/productos/${id}`) }
export async function updateStock(id: number, stock: number, disponible: boolean): Promise<Producto> {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, { stock, disponible }); return data
}
