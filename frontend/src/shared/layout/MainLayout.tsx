import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui'

function Navbar() {
  const { usuario, logout } = useAuthStore()
  const items = useCartStore((s) => s.items)
  const navigate = useNavigate()
  const count = items.reduce((sum, i) => sum + i.cantidad, 0)
  const signOut = async () => { await logout(); navigate('/login') }
  return <header className="topbar"><div className="topbar-inner"><NavLink to="/" className="logo"><span className="logo-symbol">✳</span><span>food<span className="logo-accent">store</span><small>COMIDA RICA, SIN VUELTAS</small></span></NavLink>
    <nav className="toplinks" aria-label="Navegación principal"><NavLink to="/" end>Menú</NavLink><NavLink to="/carrito">Carrito <span className="cart-count">{count}</span></NavLink>{usuario && <NavLink to="/mis-pedidos">Mis pedidos</NavLink>}{usuario?.role === 'admin' && <NavLink to="/admin/resumen">Administración</NavLink>}</nav>
    <div className="account-links">{usuario ? <><span className="welcome">Hola, {usuario.full_name.split(' ')[0]} <span className="muted">· {usuario.role}</span></span><Button variant="outline" onClick={() => { void signOut() }}>Salir</Button></> : <><NavLink className="btn btn-outline" to="/login">Ingresar</NavLink><NavLink className="btn btn-primary" to="/register">Crear cuenta</NavLink></>}</div>
  </div></header>
}
export function MainLayout() {
  return <><Navbar/><main className="main-content"><Outlet/></main><footer className="footer"><span>✳ foodstore · Hecho con dedicación</span><span>Programación IV · UTN · TPI 2026</span></footer></>
}
export function AdminLayout() {
  return <div className="space-y-6"><div className="admin-header"><div><span className="eyebrow">BACK OFFICE</span><h1 className="page-title">Panel de administración</h1><p className="muted">Gestioná tu negocio desde un solo lugar.</p></div></div><div className="admin-tabs"><NavLink to="/admin/resumen">Resumen</NavLink><NavLink to="/admin/categorias">Categorías</NavLink><NavLink to="/admin/productos">Productos</NavLink><NavLink to="/admin/pedidos">Pedidos</NavLink><NavLink to="/admin/usuarios">Usuarios</NavLink></div><Outlet/></div>
}
