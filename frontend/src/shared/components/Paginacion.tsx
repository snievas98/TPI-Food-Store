import { Button } from '../ui'
export function Paginacion({ page, size, total, onChange }: { page: number; size: number; total: number; onChange: (next: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / size))
  return <div className="flex flex-wrap justify-between items-center gap-4 mt-6 text-sm"><span className="muted">{total} registros · Página {page + 1} de {pages}</span><div className="flex gap-2"><Button variant="outline" disabled={page === 0} onClick={() => onChange(page - 1)}>Anterior</Button><Button variant="outline" disabled={page + 1 >= pages} onClick={() => onChange(page + 1)}>Siguiente</Button></div></div>
}
