# GoalsTracker V2 - Automated Setup Script

Write-Host "🚀 Creating GoalsTracker V2 application structure..." -ForegroundColor Green

# Create directory structure
Write-Host "📁 Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "src/lib" | Out-Null
New-Item -ItemType Directory -Force -Path "src/components/ui" | Out-Null
New-Item -ItemType Directory -Force -Path "src/app/api/auth/[...nextauth]" | Out-Null
New-Item -ItemType Directory -Force -Path "src/app/(auth)/login" | Out-Null
New-Item -ItemType Directory -Force -Path "src/app/(auth)/register" | Out-Null
New-Item -ItemType Directory -Force -Path "src/app/(dashboard)/dashboard" | Out-Null

Write-Host "✅ Directories created" -ForegroundColor Green

# Create lib/utils.ts
Write-Host "📝 Creating lib/utils.ts..." -ForegroundColor Yellow
@"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}
"@ | Out-File -FilePath "src/lib/utils.ts" -Encoding utf8

# Create lib/prisma.ts
Write-Host "📝 Creating lib/prisma.ts..." -ForegroundColor Yellow
@"
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
"@ | Out-File -FilePath "src/lib/prisma.ts" -Encoding utf8

# Create lib/auth.ts
Write-Host "📝 Creating lib/auth.ts..." -ForegroundColor Yellow
@"
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"
import { compare } from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
      }

      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }

      return token
    }
  }
}
"@ | Out-File -FilePath "src/lib/auth.ts" -Encoding utf8

# Create app/layout.tsx
Write-Host "📝 Creating app/layout.tsx..." -ForegroundColor Yellow
@"
import type { Metadata } from "next"
import { Outfit, Space_Mono } from "next/font/google"
import "./globals.css"

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

const spaceMono = Space_Mono({ 
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "GoalsTracker - Track Your Habits",
  description: "Professional habit tracking with AI insights",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={``${outfit.variable} ``${spaceMono.variable}``}>
      <body className="font-body">
        {children}
      </body>
    </html>
  )
}
"@ | Out-File -FilePath "src/app/layout.tsx" -Encoding utf8

# Create app/page.tsx (Landing)
Write-Host "📝 Creating app/page.tsx..." -ForegroundColor Yellow
@"
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-display font-bold">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Goals
            </span>
            <span className="text-slate-800">Tracker</span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Track your habits professionally. Get AI insights. Build better routines.
          </p>

          <div className="flex gap-4 justify-center">
            
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              Get Started
            </a>
            
              href="/register"
              className="px-8 py-4 bg-white text-slate-700 font-bold rounded-xl border-2 border-slate-200 hover:border-green-500 transition-all"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
"@ | Out-File -FilePath "src/app/page.tsx" -Encoding utf8

# Create API route for NextAuth
Write-Host "📝 Creating API routes..." -ForegroundColor Yellow
@"
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
"@ | Out-File -FilePath "src/app/api/auth/[...nextauth]/route.ts" -Encoding utf8

# Create login page
Write-Host "📝 Creating login page..." -ForegroundColor Yellow
@"
'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h1 className="text-3xl font-display font-bold text-center mb-8">
          Welcome Back
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/register" className="text-sm text-green-600 hover:text-green-700 font-semibold">
            Don't have an account? Sign up
          </a>
        </div>

        <div className="mt-4">
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="w-full py-3 bg-white border-2 border-slate-200 rounded-xl font-semibold hover:border-green-500 transition-all"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  )
}
"@ | Out-File -FilePath "src/app/(auth)/login/page.tsx" -Encoding utf8

# Create dashboard page
Write-Host "📝 Creating dashboard page..." -ForegroundColor Yellow
@"
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-display font-bold mb-8">
          Dashboard
        </h1>
        
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <p className="text-lg text-slate-600">
            🎉 ¡Felicidades! La aplicación está funcionando.
          </p>
          <p className="mt-4 text-slate-500">
            Próximos pasos: Añadir componentes de tracking, objetivos, etc.
          </p>
        </div>
      </div>
    </div>
  )
}
"@ | Out-File -FilePath "src/app/(dashboard)/dashboard/page.tsx" -Encoding utf8

# Create types
Write-Host "📝 Creating types..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "src/types" | Out-Null
@"
import { User } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
    }
  }
}
"@ | Out-File -FilePath "src/types/next-auth.d.ts" -Encoding utf8

Write-Host ""
Write-Host "✅ ALL FILES CREATED SUCCESSFULLY!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm run dev -- -p 3001" -ForegroundColor White
Write-Host "2. Open: http://localhost:3001" -ForegroundColor White
Write-Host ""