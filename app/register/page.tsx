'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authService } from '../services/auth'


export default function RegisterPage() {
    const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    usuario: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await authService.register(formData)
      router.push('/login?registered=true')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al registrar usuario')
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
          <p className="text-gray-600">Crea tu cuenta</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-2">
              Usuario
            </label>
            <input
              type="text"
              id="usuario"
              name="usuario"
              value={formData.usuario}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Nombre de usuario"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="tu@email.com"
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

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-md shadow-md text-lg transition active:translate-y-0.5 mt-6"
          >
            Crear cuenta
          </button>
        </form>
        
        <p className="mt-6 text-center text-gray-600 text-sm">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}