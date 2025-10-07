"use client";

import { Sparkle, Piano, UserIcon, LogOutIcon, LockIcon, LogInIcon } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUserService, logoutService } from '../app/services/auth';

const sidebarItems = [
  { icon: <Sparkle />, label: 'Componer', href: '/studio' },
  { icon: <Piano />, label: 'Mis Progresiones', href: '/progressions' },
];

export default function Sidebar({ active = 'Componer' }: { active?: string }) {
  const router = useRouter();
  const [user, setUser] = useState<{ usuario: string; email: string } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    getUserService()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    try {
      await logoutService();
      window.location.reload();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Mantener expandido si el menú de usuario está abierto
  const shouldExpand = isExpanded || isUserMenuOpen;

  return (
    <aside 
      className={`transition-all duration-300 min-h-screen bg-white/70 backdrop-blur-md border-r border-gray-200 flex flex-col items-center py-6 shadow-xl rounded-tr-3xl rounded-br-3xl justify-between relative z-20 ${
        shouldExpand ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        // Solo contraer si el menú de usuario no está abierto
        if (!isUserMenuOpen) {
          setIsExpanded(false);
        }
      }}
    >
      <div className="w-full flex flex-col items-center">
        {/* Logo */}
        <a href="/" className="w-full flex items-center mb-10 px-2 relative h-14">
        <span
          className="absolute left-0 top-0 h-full flex items-center justify-center"
          style={{ width: 80 }}
        >
          <img
            src="/logosimplechord.png"
            alt="SimpleChord Logo"
            className="w-14 h-14 rounded-xl hover:scale-105 transition-transform mx-auto"
            style={{ minWidth: 100 , minHeight: 100}}
          />
        </span> 
        <span
          className={`ml-[88px] text-2xl font-bold transition-opacity duration-300 whitespace-nowrap select-none ${
            shouldExpand ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="text-green-600 font-bold">Simple</span>
          <span className="text-black font-bold">Chord</span>
        </span>
      </a>

        {/* Items */}
        <nav className="flex flex-col gap-4 w-full items-center">
          {sidebarItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`group/item relative flex items-center w-full h-12 rounded-xl transition-all px-2 my-1
                ${active === item.label ? 'bg-green-100 shadow-lg' : 'hover:bg-green-100'}
              `}
            >
              <span className="absolute left-0 top-0 h-full flex items-center justify-center" style={{ width: 80 }}>
                <span className={`w-12 h-12 flex items-center justify-center mx-auto ${active === item.label ? 'text-green-600' : 'text-gray-500 group-hover:text-green-500'} transition-all`} style={{ minWidth: 48 }}>
                  {item.icon}
                </span>
              </span>
              <span className={`ml-[88px] text-base font-medium text-gray-800 transition-opacity duration-300 whitespace-nowrap select-none ${
                shouldExpand ? 'opacity-100' : 'opacity-0'
              }`}>
                {item.label}
              </span>
              {active === item.label && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-green-500 rounded-r-full"></span>
              )}
            </a>
          ))}
        </nav>
      </div>

      {/* Dropdown de Usuario */}
      <div className="mb-2 w-full flex items-center justify-center">
        <DropdownMenu.Root 
          onOpenChange={(open) => {
            setIsUserMenuOpen(open);
            // Si se cierra el menú, contraer el sidebar después de un breve delay
            if (!open) {
              setTimeout(() => {
                setIsExpanded(false);
              }, 150); // Pequeño delay para transición suave
            }
          }}
        >
          <DropdownMenu.Trigger asChild>
            <button
              className="group/item relative flex items-center w-full h-12 rounded-xl transition-all hover:bg-green-100 px-2 focus:outline-none focus:ring-0"
            >
              <span className="absolute left-0 top-0 h-full flex items-center justify-center" style={{ width: 80 }}>
                <span className="w-12 h-12 flex items-center justify-center mx-auto text-gray-500 group-hover/item:text-green-500 transition-all" style={{ minWidth: 48 }}>
                  <UserIcon />
                </span>
              </span>
              <span className={`ml-[88px] text-base font-medium text-gray-800 transition-opacity duration-300 whitespace-nowrap select-none ${
                shouldExpand ? 'opacity-100' : 'opacity-0'
              }`}>
                {user ? user.usuario : 'Usuario'}
              </span>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content
            className="min-w-[200px] bg-white shadow-lg rounded-md border border-gray-200 p-2 z-50"
            sideOffset={8}
            align="end"
          >
            {user ? (
              <>
                <div className="px-3 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user.usuario}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                <DropdownMenu.Label className="text-sm px-2 py-1 text-gray-500 mt-2">Mi cuenta</DropdownMenu.Label>

                <DropdownMenu.Item
                  className="flex items-center gap-2 px-2 py-2 text-sm hover:bg-gray-100 cursor-pointer rounded"
                  onClick={() => router.push('/user')}
                >
                  <LockIcon className="w-4 h-4" />
                  Cambiar contraseña
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-gray-200 my-2" />

                <DropdownMenu.Item
                  className="flex items-center gap-2 px-2 py-2 text-sm text-red-500 hover:bg-red-100 cursor-pointer rounded"
                  onClick={handleLogout}
                >
                  <LogOutIcon className="w-4 h-4" />
                  Cerrar sesión
                </DropdownMenu.Item>
              </>
            ) : (
              <DropdownMenu.Item
                className="flex items-center gap-2 px-2 py-2 text-sm hover:bg-gray-100 cursor-pointer rounded"
                onClick={() => router.push('/login')}
              >
                <LogInIcon className="w-4 h-4" />
                Iniciar sesión
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </aside>
  );
}