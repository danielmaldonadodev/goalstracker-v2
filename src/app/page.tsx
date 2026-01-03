export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-6xl font-display font-bold">
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Goals
          </span>
          <span className="text-slate-800">Tracker</span>
        </h1>
        
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Seguimiento profesional de hábitos
        </p>

        <div className="text-4xl">🎯</div>
        
        <p className="text-sm text-slate-500">
          App funcionando! Next.js + PostgreSQL + Redis ✅
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <a
            href="/login"
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            Iniciar Sesión
          </a>
          <a
            href="/register"
            className="px-8 py-4 bg-white text-slate-700 font-bold rounded-xl border-2 border-slate-200 hover:border-green-500 transition-all"
          >
            Registrarse
          </a>
        </div>
      </div>
    </main>
  )
}
