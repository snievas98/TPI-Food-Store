import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import type { EstadoPedido } from '../../features/pedidos/types'

export function Button({ children, className = '', variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'outline' }) {
  return <button className={`btn btn-${variant} ${className}`} {...props}>{children}</button>
}
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`field ${props.className ?? ''}`} />
}
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>
}
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <div className="modal-content" role="dialog" aria-modal="true" aria-label={title}>
      <div className="flex items-center justify-between mb-5 gap-3"><h2 className="text-xl font-bold">{title}</h2><Button type="button" variant="ghost" onClick={onClose}>✕</Button></div>
      {children}
    </div>
  </div>
}
const labels: Record<EstadoPedido, string> = { PENDIENTE: 'Pendiente', EN_PREPARACION: 'En preparación', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado' }
export function BadgeEstado({ estado }: { estado: EstadoPedido }) { return <span className={`badge badge-${estado.toLowerCase()}`}>{labels[estado]}</span> }
export function Price({ value }: { value: number }) { return <span>{value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}</span> }
