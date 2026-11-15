import axios from 'axios'

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail: unknown = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail.map((item: { msg?: string }) => item.msg ?? 'Dato inválido').join('; ')
    if (!error.response) return 'No fue posible conectar con el servidor. Verificá que esté iniciado.'
    return `Error HTTP ${error.response.status}`
  }
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
}
