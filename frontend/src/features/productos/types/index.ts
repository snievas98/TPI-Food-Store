import type { Categoria } from '../../categorias/types'
export type { Categoria } from '../../categorias/types'
export interface Producto {
  id: number
  categoria_id: number
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string
  stock: number
  disponible: boolean
  activo: boolean
  categoria: Categoria
}
export interface ProductosPaginados { total: number; items: Producto[] }
export type ProductoInput = Omit<Producto, 'id' | 'activo' | 'categoria'>
