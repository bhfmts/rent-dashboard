'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const supabase = createClient()

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.')
      } else {
        router.push('/')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Revisa tu email para confirmar tu cuenta.')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏠</div>
          <h1 className="text-2xl font-bold text-gray-100">Rent Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Control de arriendos e hipotecarios</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex gap-2 mb-6 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors font-medium ${
                mode === 'login' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors font-medium ${
                mode === 'signup' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-900 rounded-lg px-3 py-2 text-red-400 text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-950/50 border border-green-900 rounded-lg px-3 py-2 text-green-400 text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
