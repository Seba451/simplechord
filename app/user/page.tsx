'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { UserIcon, LogOutIcon, LockIcon, LogInIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUserService, logoutService } from '../services/auth';

export default function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<{ usuario: string; email: string } | null>(null);

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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu.Root>
        

        <DropdownMenu.Content
          className="min-w-[200px] bg-white shadow-lg rounded-md border border-gray-200 p-2"
          sideOffset={8}
        >
          {user ? (
            <>
              <div className="px-3 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {user.usuario}
                </p>
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
  );
}