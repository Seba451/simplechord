'use client';
import Image from "next/image";
import Link from "next/link";
import Sidebar from '../../components/Sidebar';
import { Pencil, Trash2, FileDown, Search} from 'lucide-react';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { deleteProgressionService, editProgressionService, getProgressionsService } from '../services/progressions';
import { useNotation } from "../context/notation";
import NotationToggle from '@/components/NotationToggle';
import { exportProgressionToMidi } from "../services/midi"; // importa tu función

interface Progression {
  id: number;
  nombre: string;
  acordes: string[];
  tonalidad: string;
}
const notasAmericano = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const notasLatino = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];

function toLatino(chord: string): string {
  const idx = notasAmericano.indexOf(chord);
  if (idx !== -1) return notasLatino[idx];
  if (chord.endsWith('m')) {
    const base = chord.slice(0, -1);
    const idx2 = notasAmericano.indexOf(base);
    if (idx2 !== -1) return notasLatino[idx2] + 'm';
  }
  return chord;
}

function convertIfNeeded(chord: string, notation: string): string {
  if (notation === 'latino') {
    return toLatino(chord);
  } else {
    return toAmericano(chord);
  }
}

function toAmericano(chord: string): string {
  const idx = notasLatino.indexOf(chord);
  if (idx !== -1) return notasAmericano[idx];
  if (chord.endsWith('m')) {
    const base = chord.slice(0, -1);
    const idx2 = notasLatino.indexOf(base);
    if (idx2 !== -1) return notasAmericano[idx2] + 'm';
  }
  return chord;
}

export default function ProgressionsPage() {
  const router = useRouter();
  const { notation, toggleNotation } = useNotation(); // Default to 'latino'
  // Leer progresiones guardadas en localStorage
  const [progressions, setProgressions] = useState<Progression[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
  const fetchProgressions = async () => {
    try {
      const data = await getProgressionsService();
      setProgressions(data); 
    } catch (error) {
      console.error('Error al obtener progresiones:', error);
      
    }
  };

  fetchProgressions();
}, []);
  // Eliminar progresión
  const handleDelete = async (id: number) => {
    try {
      await deleteProgressionService(id);
      setProgressions(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  // Guardar nombre editado
  const handleSaveName = async () => {
  const newName = editingName.trim();
  if (!newName || editingId === null) return;

  // Buscar la progresión actual
  const currentProgression = progressions.find(p => p.id === editingId);
  if (!currentProgression) return;

  const updatedProgression = {
    nombre: newName,
    acordes: currentProgression.acordes,
    tonalidad: currentProgression.tonalidad,
  };


  try {
    await editProgressionService(editingId, updatedProgression);

    setProgressions(prev =>
      prev.map(p =>
        p.id === editingId ? { ...p, nombre: newName } : p
      )
    );
  } catch (error) {
    console.error("Error al actualizar el nombre:", error);
  } finally {
    setEditingId(null);
    setEditingName("");
  }
};

  const splitTonality = (tonalidad: string) => {
  if (tonalidad.endsWith('m')) {
    return {
      key: tonalidad.slice(0, -1), 
      mode: 'menor'
    };
  }
  return {
    key: tonalidad,
    mode: 'mayor'
  };
};
  
  const filteredProgressions = progressions.filter((p: Progression) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

 

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <Sidebar active="Mis Progresiones" />
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-10 px-4 overflow-auto">
        <h1 className="text-6xl font-bold mb-2 text-center">
          <span className="text-black">Mis </span>
          <span className="text-green-600">Progresiones</span>
        </h1>
        <hr className="w-2/5 border-t-2 border-gray-300 mb-8 mt-4" />
        <Link href="/studio" className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-md shadow-md text-lg font-normal flex items-center gap-2 mb-8 transition active:translate-y-0.5">
          <span className="text-xl font-bold">+</span> Nueva Progresión
        </Link>
        {/* Notation Toggle */}
        <div className="absolute top-6 right-6 z-10 flex items-center gap-4">
          <NotationToggle />
        </div>
        {/* Contenedor scrolleable de progresiones */}
        <div className="w-full flex-1 max-w-6xl bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-y-auto" style={{ minHeight: 400, maxHeight: 450 }}>
          {/* Search Bar */}
          <div className="px-8 pt-8 pb-4">
            <div className="flex items-center bg-white rounded-md shadow border border-gray-200 px-4 py-2">
              <input
                type="text"
                placeholder="Buscar Progresión..."
                className="flex-1 outline-none bg-transparent text-lg text-gray-700 placeholder-gray-400"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-500" />
            </div>
          </div>
          {/* Progression Cards */}
          <div className="flex-1 flex flex-col gap-6 px-8 pb-8 overflow-y-auto">
            {filteredProgressions.length === 0 ? (
              <div className="text-center text-gray-400 text-lg mt-12">No hay progresiones guardadas.</div>
            ) : filteredProgressions.map((prog, id) => (
              <div
                key={id}
                className="grid grid-cols-[220px_1fr] bg-white rounded-2xl border border-gray-300 shadow px-6 py-4 items-center"
              >
                {/* Left: Name */}
                <div className="relative text-lg font-medium text-center border-r border-gray-300 pr-6 break-words max-w-[180px]">
                  {editingId === prog.id ? (
                    <div className="flex flex-col items-center gap-1">
                      <input
                        type="text"
                        className="border border-gray-300 rounded-md px-2 py-1 text-base w-full text-center"
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        maxLength={32}
                        autoFocus
                      />
                      <div className="flex gap-1 justify-center mt-1">
                        <button
                          className="text-green-600 hover:bg-green-100 rounded p-1"
                          onClick={() => handleSaveName()}
                          disabled={!editingName.trim()}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:bg-red-100 rounded p-1"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-400 text-right w-full">{editingName.length}/32</div>
                    </div>
                  ) : (
                    <>
                      {prog.nombre}
                      <button
                        className="absolute top-1 right-1 text-gray-400 hover:text-green-600 p-1"
                        onClick={() => {
                          setEditingId(prog.id);
                          setEditingName(prog.nombre);
                        }}
                        title="Editar nombre"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
                {/* Right: Progression, Key, Buttons */}
                <div className="flex items-center justify-between pl-6">
                  <div className="flex items-center gap-2 text-lg">
                    <span>{prog.acordes.map(a => convertIfNeeded(a, notation)).join(' - ')}</span>
                    <span className="mx-2 text-gray-300 text-xl">●<span className="align-middle text-gray-300">─────</span>●</span>
                    <span className="font-normal">Tonalidad:<span className="font-medium">{convertIfNeeded(prog.tonalidad, notation)}</span></span>
                  </div>
                  <div className="flex gap-2 ml-8">
                    <button
                      className="flex items-center gap-1 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white px-4 py-2 rounded-md text-base font-normal transition active:translate-y-0.5 shadow-lg"
                      onClick={() => {
                        const { key, mode } = splitTonality(prog.tonalidad);
                        router.push(`/recommendations?progression=${prog.acordes.map(encodeURIComponent).join(",")}&edit=${prog.id}&key=${encodeURIComponent(key)}&mode=${encodeURIComponent(mode)}&name=${encodeURIComponent(prog.nombre)}`);
                      }}
                    >
                      <Pencil className="w-5 h-5" /> Editar
                    </button>
                    {/* Botón Exportar */}
                    <button
                      className="flex items-center gap-1 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white px-4 py-2 rounded-md text-base font-normal transition active:translate-y-0.5 shadow-lg"
                      onClick={() =>
                        exportProgressionToMidi(prog.acordes, `${prog.nombre}.mid`)
                      }
                    >
                    <FileDown className="w-5 h-5" /> Exportar
                    </button>
                    <button
                      className="flex items-center gap-1 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white px-4 py-2 rounded-md text-base font-normal transition active:translate-y-0.5 shadow-lg"
                      onClick={() => handleDelete(prog.id)}
                    >
                      <Trash2 className="w-5 h-5" /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
