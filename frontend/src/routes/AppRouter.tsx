import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { MainLayout, AdminLayout } from '../shared/layout/MainLayout'
import { CatalogoPage } from '../features/productos/pages/CatalogoPage'
import { CarritoPage } from '../features/pedidos/pages/CarritoPage'
import { CheckoutPage } from '../features/pedidos/pages/CheckoutPage'
import { MisPedidosPage } from '../features/pedidos/pages/MisPedidosPage'
import { AdminResumenPage } from '../features/pedidos/pages/AdminResumenPage'
import { AdminPedidosPage } from '../features/pedidos/pages/AdminPedidosPage'
import { AdminCategoriasPage } from '../features/categorias/pages/AdminCategoriasPage'
import { AdminProductosPage } from '../features/productos/pages/AdminProductosPage'
import { AdminUsuariosPage } from '../features/usuarios/pages/AdminUsuariosPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { UnauthorizedPage } from '../features/auth/pages/UnauthorizedPage'

export function AppRouter() {
  return <BrowserRouter><Routes><Route element={<MainLayout/>}>
    <Route path="/" element={<CatalogoPage/>}/>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="/register" element={<RegisterPage/>}/>
    <Route path="/carrito" element={<CarritoPage/>}/>
    <Route path="/unauthorized" element={<UnauthorizedPage/>}/>
    <Route element={<ProtectedRoute/>}><Route path="/checkout" element={<CheckoutPage/>}/><Route path="/mis-pedidos" element={<MisPedidosPage/>}/></Route>
    <Route element={<ProtectedRoute role="admin"/>}><Route path="/admin" element={<AdminLayout/>}><Route index element={<Navigate to="resumen" replace/>}/><Route path="resumen" element={<AdminResumenPage/>}/><Route path="categorias" element={<AdminCategoriasPage/>}/><Route path="productos" element={<AdminProductosPage/>}/><Route path="pedidos" element={<AdminPedidosPage/>}/><Route path="usuarios" element={<AdminUsuariosPage/>}/></Route></Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Route></Routes></BrowserRouter>
}
