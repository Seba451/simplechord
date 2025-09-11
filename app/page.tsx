
"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white/100 backdrop-blur-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src="/logosimplechord1.png"
                alt="SimpleChord Logo"
                width={1000}
                height={1000}
                className="w-9 h-10"
              />
              <span className="ml-2 text-xl font-bold">
                <span className="text-green-600">Simple</span>
                <span className="text-black">Chord</span>
              </span>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md shadow-md transition-all active:translate-y-0.5"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      

      {/* Hero Section */}
      <main className="pt-20 min-h-[85vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
  {/* Imagen de fondo */}
  <div className="absolute inset-0 z-0">
    <Image
      src="/HowToMakeMusic_Feature.jpg"
      alt="Fondo musical"
      fill
      className="object-cover opacity-80"
      priority
    />
    <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/50" />
  </div>

  {/* Contenido por encima de la imagen */}
  <div className="relative z-10 max-w-5xl text-center">
    <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-white">
      LA <span className="text-green-500">COMPOSICIÓN MUSICAL</span><br />
      NUNCA FUE TAN SIMPLE
    </h1>
    <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
      Olvídate de la complejidad. Crea progresiones de acordes de manera intuitiva
      y descubre nuevas posibilidades musicales.
    </p>

    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <Link
        href="/studio"
        className="bg-green-500 hover:bg-green-600 text-white px-16 py-4 rounded-xl shadow-lg text-lg font-medium transition-all hover:shadow-xl active:translate-y-0.5 w-full sm:w-auto"
      >
        COMENZAR
      </Link>
      <Link
        href="/progressions"
        className="bg-white hover:bg-gray-300 text-black px-16 py-4 rounded-xl shadow-lg text-lg font-medium border border-gray-200 transition-all hover:shadow-xl active:translate-y-0.5 w-full sm:w-auto"
      >
        MIS PROGRESIONES
      </Link>
    </div>
  </div>
  
</main>
{/* Sección informativa adicional */}
<section className="bg-gradient-to-br from-green-50 via-white to-green-100 px-4 flex items-center justify-center min-h-[100px]">
  <div className="text-center">
    <p className="text-black text-base">
      ¿Nuevo en la composición musical?{" "}
      <Link
        href="/tutorial"
        className="text-green-500 underline hover:text-green-600 transition"
      >
        Comenzá con nuestro tutorial
      </Link>
    </p>
  </div>
</section>

    </div>
  );
}
