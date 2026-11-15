import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'
import { registrarse } from '../api/auth'
import { useAuthStore } from '../../../store/authStore'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button, Input } from '../../../shared/ui'

export function RegisterPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const form = useForm({ defaultValues: { username: '', full_name: '', email: '', password: '' }, onSubmit: async ({ value }) => {
    setError('')
    try { await registrarse(value); await login(value.username, value.password); navigate('/') }
    catch (e) { setError(handleApiError(e)) }
  } })
  return <div className="auth-container"><div className="auth-promo"><span className="eyebrow">TU PRÓXIMO PEDIDO EMPIEZA ACÁ</span><h1>Comer rico es más fácil de lo que pensás.</h1><p>Creá tu cuenta y tené tus favoritos a unos pocos clics.</p><div className="promo-art">🍕 <span>✨</span> 🍔</div></div><div className="card auth-card"><h2 className="text-3xl font-extrabold">Creá tu cuenta</h2><p className="muted mb-6">Son unos pocos datos y listo.</p><form className="space-y-4" onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); void form.handleSubmit() }}>
    <form.Field name="full_name" validators={{ onBlur: ({ value }) => value.trim().length < 2 ? 'Ingresá tu nombre completo' : undefined }}>{(field) => <label className="form-label">Nombre completo<Input placeholder="Nombre y apellido" autoComplete="name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur}/><span className="validation">{field.state.meta.errors.join(', ')}</span></label>}</form.Field>
    <form.Field name="username" validators={{ onBlur: ({ value }) => value.trim().length < 3 ? 'Mínimo 3 caracteres' : undefined }}>{(field) => <label className="form-label">Usuario<Input placeholder="Elegí un usuario" autoComplete="username" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur}/><span className="validation">{field.state.meta.errors.join(', ')}</span></label>}</form.Field>
    <form.Field name="email" validators={{ onBlur: ({ value }) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Email inválido' : undefined }}>{(field) => <label className="form-label">Email<Input type="email" placeholder="correo@ejemplo.com" autoComplete="email" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur}/><span className="validation">{field.state.meta.errors.join(', ')}</span></label>}</form.Field>
    <form.Field name="password" validators={{ onBlur: ({ value }) => value.length < 8 ? 'Mínimo 8 caracteres' : undefined }}>{(field) => <label className="form-label">Contraseña<Input type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur}/><span className="validation">{field.state.meta.errors.join(', ')}</span></label>}</form.Field>
    {error && <div className="alert-error" role="alert">{error}</div>}
    <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>{([canSubmit, isSubmitting]) => <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>{isSubmitting ? 'Creando cuenta…' : 'Crear cuenta →'}</Button>}</form.Subscribe>
  </form><p className="text-center mt-5 muted">¿Ya tenés cuenta? <Link className="link" to="/login">Ingresá</Link></p></div></div>
}
