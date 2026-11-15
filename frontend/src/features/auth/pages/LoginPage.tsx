import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button, Input } from '../../../shared/ui'

export function LoginPage() {
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const form = useForm({ defaultValues: { username: '', password: '' }, onSubmit: async ({ value }) => {
    setError('')
    try { await login(value.username, value.password); navigate((location.state as { from?: string } | null)?.from ?? '/') }
    catch (e) { setError(handleApiError(e)) }
  } })
  return <div className="auth-container"><div className="auth-promo"><span className="eyebrow">BIENVENIDO A FOODSTORE</span><h1>El antojo de hoy tiene solución.</h1><p>Descubrí lo mejor del menú, armá tu pedido y recibilo donde quieras.</p><div className="promo-art">🍔 <span>🍟</span> 🥤</div></div><div className="card auth-card"><h2 className="text-3xl font-extrabold">Ingresá a tu cuenta</h2><p className="muted mb-7">Qué bueno tenerte de vuelta.</p><form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); void form.handleSubmit() }} className="space-y-5">
    <form.Field name="username" validators={{ onBlur: ({ value }) => value.trim().length < 3 ? 'Mínimo 3 caracteres' : undefined }}>{(field) => <label className="form-label">Usuario<Input autoComplete="username" placeholder="Tu nombre de usuario" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur}/><span className="validation">{field.state.meta.errors.join(', ')}</span></label>}</form.Field>
    <form.Field name="password" validators={{ onBlur: ({ value }) => value.length < 8 ? 'Mínimo 8 caracteres' : undefined }}>{(field) => <label className="form-label">Contraseña<Input type="password" autoComplete="current-password" placeholder="••••••••" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur}/><span className="validation">{field.state.meta.errors.join(', ')}</span></label>}</form.Field>
    {error && <div className="alert-error" role="alert">{error}</div>}
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>{([canSubmit, isSubmitting]) => <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>{isSubmitting ? 'Ingresando…' : 'Ingresar →'}</Button>}</form.Subscribe>
  </form><p className="text-center mt-6 muted">¿No tenés una cuenta? <Link className="link" to="/register">Registrate gratis</Link></p></div></div>
}
