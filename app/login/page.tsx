'use client'
import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService } from '../services/auth'

function LoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      await authService.login(formData)
      console.log("redirect", redirect)
      router.push(redirect ?? '/studio')
      setTimeout(() => {
        window.location.reload();
      }, 100); // espera 100ms antes de recargar
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4">
      <div className="bg-white/90 p-8 rounded-xl shadow-lg w-full max-w-md backdrop-blur-sm border border-gray-200">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logosimplechord1.png"
            alt="Simplechord Logo"
            width={80}
            height={80}
            className="mb-4"
          />
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-green-600">Simple</span><span className="text-black">Chord</span>
          </h1>
          <p className="text-gray-600">Inicia sesión para continuar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Email o nombre de usuario
            </label>
            <input
              type="text"
              id="usernameOrEmail"
              name="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="tu@email.com o nombre de usuario"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-md shadow-md text-lg transition active:translate-y-0.5 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-gray-600 text-sm">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
