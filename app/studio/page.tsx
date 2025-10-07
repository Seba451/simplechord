"use client";
import { useState } from "react";
import { Music, Piano, Settings } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useRouter } from 'next/navigation';
import { useNotation } from "../context/notation";
import NotationToggle from "@/components/NotationToggle";


const modos = [
  { key: "mayor", label: "Mayor" },
  { key: "menor", label: "Menor" }
];

const notasAmericano = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];
const notasLatino = [
  "Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"
];

export default function Studio() {
  const { notation: notacion, toggleNotation: handleNotacionToggle } = useNotation();
  const [modo, setModo] = useState<string | null>(null);
  const [tonalidad, setTonalidad] = useState<string | null>(null);
  const [acordes, setAcordes] = useState<string[]>([]);
  const router = useRouter();

  const notas = notacion === 'latino' ? notasLatino : notasAmericano;
  const tonalidades = notas;

  const showModo = true;
  const showTonalidad = modo !== null;
  const showAcordes = modo !== null && tonalidad !== null;
  const showAcordesSeleccionados = showAcordes && acordes.length > 0;
  const showRecomendar = showAcordesSeleccionados;

  

  const tonalidadLabel = notacion === "latino"
    ? (modo === "mayor" ? "Mayor" : modo === "menor" ? "Menor" : "")
    : tonalidad && modo ? `${tonalidad} ${modo === "mayor" ? "Mayor" : "Menor"}` : "";

  const handleAcordeClick = (acorde: string) => {
    setAcordes((prev) => {
      if (prev.includes(acorde)) {
        return prev.filter((a) => a !== acorde);
      } else if (prev.length < 4) {
        return [...prev, acorde];
      } else {
        return prev;
      }
    });
  };

  function getScaleChords(tonality: string, mode: string, notation: string): string[] {
    const notas = notation === 'latino' ? notasLatino : notasAmericano;
    const mayor = [0, 2, 4, 5, 7, 9, 11];
    const menor = [0, 2, 3, 5, 7, 8, 10];
    const tiposMayor = ['', 'm', 'm', '', '', 'm', 'dim'];
    const tiposMenor = ['m', 'dim', '', 'm', 'm', '', ''];
    const formula = mode === 'menor' ? menor : mayor;
    const tipos = mode === 'menor' ? tiposMenor : tiposMayor;
    let idx = notas.indexOf(tonality);
    if (idx === -1) {
      idx = (notation === 'latino' ? notasAmericano : notasLatino).indexOf(tonality);
    }
    if (idx === -1) return [];
    return formula.map((intervalo, i) => {
      let nombre = notas[(idx + intervalo) % 12];
      if (tipos[i] === 'm') nombre += 'm';
      if (tipos[i] === 'dim') nombre += 'dim';
      return nombre;
    });
  }

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 relative">
      <Sidebar active="Componer" />

      <main className="flex-1 flex flex-col items-center py-10 px-4 overflow-x-hidden relative">
        {/* Toggle de notación arriba a la derecha */}
        <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
          <NotationToggle />
        </div>

        {/* MODO */}
        {showModo && (
          <div className="w-full max-w-3xl animate-fadein-slideup" style={{ animationDelay: '0s', animationFillMode: 'both' }}>
            <div className="rounded-2xl border-2 border-gray-200 bg-white/90 px-8 py-6 mb-8 shadow-xl">
              <h2 className="text-3xl font-bold mb-4">
                Seleccioná un <span className="text-green-600">Modo</span>
              </h2>
              <div className="flex gap-8">
                {modos.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setModo(m.key)}
                    className={`flex-1 rounded-xl border-2 px-6 py-4 text-xl font-normal transition ${
                      modo === m.key
                        ? "bg-green-500 text-white border-green-500 shadow-md"
                        : "bg-white text-black border-gray-300 hover:bg-green-100"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TONALIDAD */}
        {showTonalidad && (
          <div className="w-full max-w-3xl animate-fadein-slideup" style={{ animationDelay: '0s', animationFillMode: 'both' }}>
            <div className="rounded-2xl border-2 border-gray-200 bg-white/90 px-8 py-6 mb-8 shadow-xl">
              <h2 className="text-3xl font-bold mb-4">
                Seleccioná una <span className="text-green-600">Tonalidad</span>
              </h2>
              <div className="grid grid-cols-7 gap-4">
                {tonalidades.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTonalidad(t)}
                    className={`rounded-md border-2 px-6 py-3 text-xl font-normal transition ${
                      tonalidad === t
                        ? "bg-green-500 text-white border-green-500 shadow-md"
                        : "bg-white text-black border-gray-300 hover:bg-green-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ACORDES */}
        {showAcordes && (
          <div className="w-full max-w-3xl animate-fadein-slideup" style={{ animationDelay: '0s', animationFillMode: 'both' }}>
            <div className="rounded-2xl border-2 border-gray-200 bg-white/90 px-8 py-6 mb-8 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold">
                  Seleccioná <span className="text-green-600">Acorde/s</span>
                </h2>
                
              </div>
              <div className="grid grid-cols-7 gap-4 mb-2">
                {getScaleChords(tonalidad, modo, notacion).map((n) => (
                  <button
                    key={n}
                    onClick={() => handleAcordeClick(n)}
                    disabled={acordes.length >= 4 && !acordes.includes(n)}
                    className={`relative rounded-md border-2 px-6 py-3 text-xl font-normal transition
                      ${acordes.includes(n)
                        ? "bg-green-500 text-white border-green-500 shadow-md"
                        : "bg-white text-black border-gray-300 hover:bg-green-100"}
                      ${acordes.length >= 4 && !acordes.includes(n) ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    {n}
                    {acordes.includes(n) && (
                      <span className="absolute top-1 right-2 bg-white text-green-700 font-bold text-xs w-5 h-5 flex items-center justify-center rounded-full shadow">
                        {acordes.indexOf(n) + 1}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ACORDES SELECCIONADOS */}
        {showAcordesSeleccionados && (
          <div className="w-full max-w-3xl mb-8 animate-fadein-slideup" style={{ animationDelay: '0s', animationFillMode: 'both' }}>
            <div className="rounded-2xl border-2 border-gray-200 bg-white/90 px-8 py-4 flex gap-4 shadow-xl">
              {acordes.map((a) => (
                <div key={a} className="bg-green-500 text-white rounded-md px-8 py-2 text-xl font-medium shadow">
                  {a}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTÓN RECOMENDAR */}
        {showRecomendar && (
          <div className="w-full max-w-3xl flex justify-end animate-fadein-slideup" style={{ animationDelay: '0s', animationFillMode: 'both' }}>
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-12 py-4 rounded-xl shadow-xl text-xl font-semibold transition active:scale-95 duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={acordes.length === 0}
              onClick={() => {
                if (acordes.length > 0 && notacion && modo && tonalidad) {
                  const queryParams = new URLSearchParams({
                    progression: encodeURIComponent(acordes.join(",")),
                    notation: notacion,
                    mode: modo,
                    key: tonalidad
                  });
                  router.push(`/recommendations?${queryParams.toString()}`);
                }
              }}
            >
              Generar Recomendaciones
            </button>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadein-slideup {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: none; }
        }
        .animate-fadein-slideup {
          animation: fadein-slideup 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
      `}</style>
    </div>
  );
}
