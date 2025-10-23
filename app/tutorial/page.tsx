"use client";

import React, { useState } from "react";
import { ChevronDown as ChevronDownIcon } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { AnimatePresence, motion } from "framer-motion";
import NotationToggle from "@/components/NotationToggle"; 
import { useNotation } from "../context/notation";     

type Item = { id: string; title: string; body: string };

const LAT = ["Do","Do#","Re","Re#","Mi","Fa","Fa#","Sol","Sol#","La","La#","Si"];
const AME = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

function latToAm(root: string) { const i = LAT.indexOf(root); return i >= 0 ? AME[i] : root; }
function amToLat(root: string) { const i = AME.indexOf(root); return i >= 0 ? LAT[i] : root; }

function convertTextNotation(text: string, notation: "latino" | "americano") {
  if (notation === "americano") {
    return text.replace(/\b(Do|Re|Mi|Fa|Sol|La|Si)(#)?(m)?\b/g, (_m, base, sharp, minor) => {
      const rootLat = base + (sharp || "");
      const rootAm = latToAm(rootLat);
      return rootAm + (minor ? "m" : "");
    });
  }
  return text.replace(/\b([A-G])(#)?(m)?\b/g, (_m, base, sharp, minor) => {
    const rootAm = base + (sharp || "");
    const rootLat = amToLat(rootAm);
    return rootLat + (minor ? "m" : "");
  });
}

const ITEMS: Item[] = [
  {
    id: "notas",
    title: "Notas musicales",
    body:
      "La música se basa en 12 notas que se repiten en diferentes octavas. Una octava significa que la nota vuelve a sonar más aguda o más grave, pero mantiene su identidad. Por ejemplo, un Do grave y un Do agudo son la misma nota, solo en alturas distintas. Cada nota es un sonido único (Do, Do#, Re, etc.) y sirve como base para todo lo demás.",
  },
  {
    id: "intervalos",
    title: "Intervalos",
    body:
      "Un intervalo es la distancia entre dos notas. Por ejemplo, en la escala de Do Mayor (Do Re Mi Fa Sol La Si), de Do a Mi hay un intervalo de tercera. Los intervalos permiten construir escalas y acordes.",
  },
  {
    id: "escalas",
    title: "Escalas y tonalidades",
    body:
      "Una escala es una sucesión ordenada de notas, formada generalmente por siete notas distintas. La tonalidad la define la primera nota de la escala: si empieza en Do, es Do mayor o Do menor, y a partir de esa nota se definen las demás notas que forman la escala. Cuando se toca una nota que no pertenece a la escala, suele sonar “fuera de lugar” o inestable.",
  },
  {
    id: "modos",
    title: "Modos (Mayor y menor)",
    body:
      "Un modo es una forma de organizar los intervalos dentro de una escala, lo que le da un carácter particular a su sonido. El modo mayor tiene un sonido brillante y estable, mientras que el modo menor suena más oscuro o melancólico. Son las dos formas más utilizadas en que se organizan las escalas y los acordes.",
  },
  {
    id: "acordes",
    title: "Acordes básicos",
    body:
      "Un acorde, en su forma más básica, es la combinación de 1ª, 3ª y 5ª de una escala (triada). Cuando la 3ª es mayor, el acorde es mayor; Cuando es menor, el acorde es menor. Ej.: Do mayor (C) suena más estable y brillante; Do menor (Cm) suena más oscuro o nostálgico.",
  },
  {
    id: "progresiones",
    title: "Progresiones de acordes",
    body:
      "Una progresión es una secuencia de acordes tocados uno después del otro. Son la base de la mayoría de las canciones, ya que dan dirección y movimiento a la música.",
  },
];


function TheoryCard({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(false);
  const { notation } = useNotation(); 
  const panelId = title.replace(/\s+/g, "-").toLowerCase();
  const bodyConverted = convertTextNotation(body, notation);

  return (
    <motion.div
      layout
      className={`rounded-2xl border bg-white ${open ? "border-[#33B249]" : "border-gray-300"} self-start overflow-hidden`}
      transition={{ layout: { type: "spring", stiffness: 260, damping: 26 } }}
    >
      <button
        className="w-full flex items-center justify-between px-5 py-4"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="text-lg font-semibold text-gray-900">{title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="h-5 w-5"
        >
          <ChevronDownIcon className="h-5 w-5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            id={panelId}
            layout
            initial={{ opacity: 0, height: 0, clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ opacity: 1, height: "auto", clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ opacity: 0, height: 0, clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{
              height: { type: "spring", stiffness: 240, damping: 28 },
              opacity: { duration: 0.18 },
              clipPath: { type: "spring", stiffness: 260, damping: 28 },
            }}
            className="overflow-hidden will-change-transform will-change-opacity"
          >
            <motion.div
              initial={{ y: -6 }}
              animate={{ y: 0 }}
              exit={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="px-5 pb-5 text-gray-700 leading-relaxed"
            >
              {bodyConverted}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TheoryPage() {
  return (
    <div className="relative flex w-full min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <Sidebar active="Teoría" />

      <main className="flex-1 p-6">
        {/* Toggle arriba a la derecha */}
        <div className="absolute right-6 top-6 z-10">
          <NotationToggle />
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold">
              <span className="text-gray-900">Teoría </span>
              <span className="text-[#33B249]">Básica</span>
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Leé estos conceptos clave en pocos minutos, para entender mejor cómo funciona la música y aprovechar al máximo la app.
            </p>

            <motion.div layout className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {ITEMS.map((it) => (
                <TheoryCard key={it.id} title={it.title} body={it.body} />
              ))}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}