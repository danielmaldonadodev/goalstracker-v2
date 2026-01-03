'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-green-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">
              Dashboard
            </h1>
            <p className="text-slate-600">
              Hola, <span className="font-semibold text-green-600">{session.user.name}</span>! 👋
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-6 py-3 bg-white border-2 border-slate-200 rounded-xl font-semibold hover:border-red-500 hover:text-red-600 transition-all"
          >
            Cerrar Sesión
          </button>
        </div>
        
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-display font-bold mb-4">
              ¡Autenticación Funcionando!
            </h2>
            <p className="text-lg text-slate-600 mb-4">
              Has iniciado sesión correctamente.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-left">
              <p className="font-semibold text-green-800 mb-2">Información de sesión:</p>
              <p className="text-slate-700">Email: {session.user.email}</p>
              <p className="text-slate-700">ID: {session.user.id}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-xl font-display font-bold mb-4">
            Próximos pasos
          </h3>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <span>Configurar objetivos de tracking</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <span>Crear vista de registro diario</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <span>Implementar vista de rueda circular</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <span>Añadir analytics y estadísticas</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <span>Deploy a Vercel</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
