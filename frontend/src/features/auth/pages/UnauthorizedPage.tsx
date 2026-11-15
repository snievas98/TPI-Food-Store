import { Link } from 'react-router-dom'
export function UnauthorizedPage() { return <div className="empty-state"><div className="text-5xl mb-4">🔒</div><h1 className="text-3xl font-bold">No tenés permiso para entrar acá</h1><p className="muted mb-6">Esta página está reservada para administradores.</p><Link to="/" className="btn btn-primary">Volver al menú</Link></div> }
