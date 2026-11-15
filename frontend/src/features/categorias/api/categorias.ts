import { api } from '../../../shared/api/axiosInstance'
import type { Categoria } from '../types'
export interface CategoriaInput { nombre: string; descripcion: string }
export async function getCategorias(): Promise<Categoria[]> { const { data } = await api.get<Categoria[]>('/categorias'); return data }
export async function createCategoria(input: CategoriaInput): Promise<Categoria> { const { data } = await api.post<Categoria>('/categorias', input); return data }
export async function updateCategoria(id: number, input: CategoriaInput): Promise<Categoria> { const { data } = await api.put<Categoria>(`/categorias/${id}`, input); return data }
export async function deleteCategoria(id: number): Promise<void> { await api.delete(`/categorias/${id}`) }
