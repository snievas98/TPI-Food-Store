import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto } from '../features/productos/types'

export interface CartItem { producto_id: number; nombre: string; precio_unitario: number; cantidad: number; imagen_url: string }
interface CartState {
  items: CartItem[]
  agregar: (producto: Producto) => void
  quitar: (id: number) => void
  cambiarCantidad: (id: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}
export const useCartStore = create<CartState>()(persist((set, get) => ({
  items: [],
  agregar: (producto) => set((state) => {
    const existing = state.items.find((i) => i.producto_id === producto.id)
    if (existing) return { items: state.items.map((i) => i.producto_id === producto.id ? { ...i, cantidad: Math.min(producto.stock, i.cantidad + 1) } : i) }
    return { items: [...state.items, { producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base, cantidad: 1, imagen_url: producto.imagen_url }] }
  }),
  quitar: (id) => set((state) => ({ items: state.items.filter((i) => i.producto_id !== id) })),
  cambiarCantidad: (id, cantidad) => set((state) => ({ items: state.items.map((i) => i.producto_id === id ? { ...i, cantidad: Math.max(1, Math.floor(cantidad)) } : i) })),
  vaciar: () => set({ items: [] }),
  total: () => get().items.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0),
}), { name: 'foodstore-cart', partialize: (state) => ({ items: state.items }) }))
