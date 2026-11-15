import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { AppRouter } from './routes/AppRouter'
export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession)
  useEffect(() => { void checkSession() }, [checkSession])
  return <AppRouter/>
}
