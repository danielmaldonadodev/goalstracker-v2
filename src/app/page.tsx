export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-sm w-full mx-6">
        {/* Logo minimalista */}
        <div className="text-center mb-16">
          <h1 className="text-7xl font-light tracking-tighter mb-4">MyYear</h1>
          <p className="text-muted-foreground text-sm tracking-wide">
            Captura tu vida. Analiza tu año.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <a
            href="/login"
            className="block w-full bg-foreground text-background text-center py-4 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Iniciar Sesión
          </a>
          <a
            href="/register"
            className="block w-full border border-border text-foreground text-center py-4 rounded-xl font-medium hover:bg-muted/50 transition-colors"
          >
            Crear Cuenta
          </a>
        </div>

        {/* Footer sutil */}
        <div className="mt-16 text-center">
          <p className="text-xs text-muted-foreground">2025</p>
        </div>
      </div>
    </div>
  );
}
