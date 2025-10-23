"use client";

import { exportProgressionToMidi } from '../services/midi';
import { playChord, playProgression } from "../services/audio";
import { chordToNotes } from "../services/chords";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  HomeIcon,
  Music,
  ChevronDownIcon,
  PlusIcon,
  PlayIcon,
  SaveIcon,
  VolumeIcon, 
  FileDown,
  Star,
  Trash2,
  Loader2,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { saveProgressionService } from '../services/progressions';
import { useNotation } from '../context/notation'; 
import NotationToggle from '@/components/NotationToggle';
import { convertirAcordesAGrados } from '../services/toGradeConversion';
import { getChordRecommendations } from '../services/predictions';
import { convertirGradosAAcordes } from '../services/toChordConversion';
import { getUserService } from '../services/auth';
import ExplanationToggle from '@/components/ExplanationToggle';



const isString = (x: unknown): x is string => typeof x === 'string' && x.length > 0;

const notasAmericano = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];
const notasLatino = [
  "Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"
];

function convertTextNotation(text: string, notation: "latino" | "americano") {
  if (notation === "americano") return text;

  // Map de americano -> latino
  const map: Record<string, string> = {
    "C": "Do",
    "C#": "Do#",
    "D": "Re",
    "D#": "Re#",
    "E": "Mi",
    "F": "Fa",
    "F#": "Fa#",
    "G": "Sol",
    "G#": "Sol#",
    "A": "La",
    "A#": "La#",
    "B": "Si",
  };

  // Reemplaza los acordes exactos en el texto
  const regex = new RegExp(`\\b(${Object.keys(map).join("|")})\\b`, "g");

  return text.replace(regex, (match) => map[match]);
}

function toLatino(chord: string) {
  const idx = notasAmericano.indexOf(chord);
  if (idx !== -1) return notasLatino[idx];
  if (chord.endsWith('m')) {
    const base = chord.slice(0, -1);
    const idx2 = notasAmericano.indexOf(base);
    if (idx2 !== -1) return notasLatino[idx2] + 'm';
  }
  return chord;
}
function toAmericano(chord: string) {
  const idx = notasLatino.indexOf(chord);
  if (idx !== -1) return notasAmericano[idx];
  if (chord.endsWith('m')) {
    const base = chord.slice(0, -1);
    const idx2 = notasLatino.indexOf(base);
    if (idx2 !== -1) return notasAmericano[idx2] + 'm';
  }
  return chord;
}

type Notation = 'latino' | 'americano';
type Mode = 'Mayor' | 'Menor';

interface HeaderProps {
  notation: Notation;
  mode: Mode;
  setMode: (m: Mode) => void;
  tonality: string;
  setTonality: (t: string) => void;
  toggleNotation?: () => void;
}

// Header Component
const Header = ({ notation, mode, setMode, tonality, setTonality }: HeaderProps) => {
  const notas = notation === 'latino' ? notasLatino : notasAmericano;
  return (
    <div className="flex justify-start gap-[80px] mb-8">
      <div>
        <h2 className="text-gray-800 font-medium mb-2">Modo</h2>
        <div className="relative">
          <select
            value={mode}
            onChange={e => setMode(e.target.value as Mode)}
            className="appearance-none flex items-center justify-between w-[230px] px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900"
          >
            <option value="Mayor">Mayor</option>
            <option value="Menor">Menor</option>
          </select>
          <ChevronDownIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
        </div>
      </div>
      <div>
        <h2 className="text-gray-800 font-medium mb-2">Tonalidad</h2>
        <div className="relative">
          <select
            value={tonality}
            onChange={e => setTonality(e.target.value)}
            className="appearance-none flex items-center justify-between w-[230px] px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900"
          >
            {notas.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <ChevronDownIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
        </div>
      </div>
    </div>
  )
}

interface ChordProgressionProps {
  chords: (string | null)[];
  activeChord: number;
  setActiveChord: (n: number) => void;
  onDeleteChord: (newChords: (string | null)[], newActiveChord: number) => void;
  notation: Notation;
  onSelectChord: (index: number) => void;
  fetchRecommendations: (index: number) => void;
  playingChordIndex?: number | null;
}

// ChordProgression Component
const ChordProgression = ({ chords, activeChord, setActiveChord, onDeleteChord, notation, onSelectChord, fetchRecommendations, playingChordIndex}: ChordProgressionProps) => {
  const handleDeleteChord = (indexToDelete: number) => {
    const newChords = chords.filter((_, index) => index !== indexToDelete);
    
    let newActiveChord = activeChord;
    if (indexToDelete <= activeChord && activeChord > 0) {
      newActiveChord = activeChord - 1;
    } else if (indexToDelete < activeChord) {
      newActiveChord = activeChord;
    } else if (newChords.length === 0) {
      newActiveChord = -1;
    }
    onDeleteChord(newChords, newActiveChord);
  };

  return (
    <div className="flex items-center mb-8 overflow-x-auto">
      {chords.map((chord, index) => (
        <div key={index} className="flex items-center">
          {chord === null ? (
            <div className="relative group">
              <button
                className={`flex items-center justify-center w-[220px] h-[169px] border border-dashed rounded-xl text-4xl font-medium transition-all
                  ${index === activeChord ? 'bg-green-100 border-[#33B249]' : 'bg-white border-gray-300 hover:bg-green-100'}
                `}
                onClick={() => onSelectChord(index)}
              >
              </button>
              <button
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 rounded-full"
                onClick={() => handleDeleteChord(index)}
              >
                <Trash2 className="w-4 h-4 text-black" />
              </button>
            </div>
          ) : (
            <div className="relative group">
              <button
                className={`flex items-center justify-center w-[220px] h-[169px] text-4xl font-medium rounded-xl border transition-all ${
                  index === (playingChordIndex ?? activeChord) 
                    ? 'bg-[#33B249] text-white border-[#33B249]' 
                    : 'bg-[#f9f9f9] text-black border-gray-300 hover:bg-green-100'
                }`}
                onClick={() => {
                  onSelectChord(index);
                  if (chord) {
                    const notes = chordToNotes(chord);
                    playChord(notes); 
                  }
                }} 
              >
                {notation === 'latino' ? toLatino(chord) : toAmericano(chord)}
              </button>
              <button 
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 rounded-full"
                onClick={() => handleDeleteChord(index)}
              >
                <Trash2 className="w-4 h-4 text-black" />
              </button>
            </div>
          )}
          <div className="w-[1px] h-16 bg-[#BFBFBF] mx-4"></div>
        </div>
      ))}
      {chords.length < 5 && !chords.includes(null) && (
        <button
          className="flex items-center justify-center w-[220px] h-[169px] text-4xl font-medium bg-[#f9f9f9] border border-gray-300 rounded-xl hover:bg-green-100 transition-all"
          onClick={() => {
            const newIndex = chords.length;
            onDeleteChord([...chords, null], newIndex);
            fetchRecommendations(newIndex); 
          }}
        >
          <PlusIcon className="w-8 h-8" />
        </button>
      )}
    </div>
  )
}

// ActionButtons Component
// ActionButtons Component
interface ActionButtonsProps {
  onSave: () => void;
  onPlay: () => void | Promise<void>;
  selectedChords: (string | null)[];
  progressionName: string;
  nameParam: string | null;
}

const ActionButtons = ({ onSave, onPlay, selectedChords, progressionName, nameParam }: ActionButtonsProps) => {
  return (
    <div className="flex gap-4 mb-8">
      <button 
        className="flex items-center gap-2 px-6 py-3 bg-[#33B249] text-white font-medium rounded-md shadow-md hover:bg-[#26993d] transition-all"
        onClick={onPlay}
      >
        <PlayIcon className="w-5 h-5" />
        <span>Reproducir Progresión</span>
      </button>
      <button
        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 font-medium border border-gray-200 rounded-md shadow-md hover:bg-gray-200 transition-all"
        onClick={onSave}
      >
        <SaveIcon className="w-5 h-5" />
        <span>Guardar Progresión</span>
      </button>
      <button
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-md hover:bg-blue-800 transition-all"
        onClick={() => {
        
          const chords = selectedChords.filter(Boolean) as string[];
          const fileName =
            (progressionName?.trim() || nameParam?.trim() || "progresion") + ".mid";

          exportProgressionToMidi(chords, fileName);
        }}
      >
        <FileDown className="w-5 h-5" />
        <span>Exportar Progresión</span>
      </button>
    </div>
  )
}

// Tabs Component
type TabKey = 'recommendations' | 'selector';
interface TabsProps { activeTab: TabKey; setActiveTab: (t: TabKey) => void }
const Tabs = ({ activeTab, setActiveTab }: TabsProps) => {
  return (
    <div className="flex mb-0 ml-[50px]">
      <button
        className={`px-6 py-3 font-medium rounded-t-lg transition-all ${activeTab === 'recommendations' ? 'bg-[#33B249] text-white' : 'bg-white text-gray-800 border border-gray-200 hover:bg-green-100'}`}
        onClick={() => setActiveTab('recommendations')}
      >
        Recomendaciones
      </button>
      <button
        className={`px-6 py-3 font-medium rounded-t-lg transition-all ml-6 ${activeTab === 'selector' ? 'bg-[#33B249] text-white' : 'bg-white text-gray-800 border border-gray-200 hover:bg-green-100'}`}
        onClick={() => setActiveTab('selector')}
      >
        Selector de Acordes
      </button>
    </div>
  )
}

// RecommendationsView Component
interface RecommendationItem { chord: string; text: string; rating: number }
interface RecommendationsViewProps {
  onSelectChord: (chord: string) => void;
  recommendations: RecommendationItem[];
  notation: Notation;
}
const RecommendationsView = ({ onSelectChord, recommendations, notation }: RecommendationsViewProps) => {
  const getCardStyle = (index: number) => {
    const opacities = [0.7, 0.4, 0.2];
    const opacity = opacities[index];
    return {
      backgroundColor: `rgba(0, 255, 13, ${opacity})`,
      border: '2px solid rgba(205, 205, 205, 0.5)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    };
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(recommendations ?? []).map((rec, index) => (
          <div
            key={index}
            className="p-6 rounded-lg transition-all flex flex-col h-full hover:shadow-lg hover:scale-105 cursor-pointer"
            style={getCardStyle(index)}
            onClick={() => onSelectChord(rec.chord)}
          >
            <div className="flex justify-between mb-4">
              <div className="text-5xl font-bold text-black">
                {notation === 'latino' ? toLatino(rec.chord) : toAmericano(rec.chord)}
              </div>
              <div className="flex gap-2 items-center">
                {[...Array(rec.rating)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-black rounded-full flex items-center justify-center"
                  >
                    <Star className="w-5 h-5 text-white fill-white" />
                  </div>
                ))}
              </div>
            </div>
            <p className="mb-8 text-black flex-grow">
              {notation === 'latino' ? convertTextNotation(rec.text, 'latino') : rec.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Utilidad para obtener los acordes de la escala
function getScaleChords(tonality: string, mode: Mode, notation: Notation): string[] {
  const notas = notation === 'latino' ? notasLatino : notasAmericano;
  const mayor = [0, 2, 4, 5, 7, 9, 11];
  const menor = [0, 2, 3, 5, 7, 8, 10];
  const mayorFormula = ["", "m", "m", "", "", "m", "dim"];
  const menorFormula = ["m", "dim", "", "m", "m", "", ""];
  const formula = mode === 'Menor' ? menor : mayor;
  const cualidades = mode === 'Menor' ? menorFormula : mayorFormula;

  let idx = notas.indexOf(tonality);
  if (idx === -1) {
    idx = (notation === 'latino' ? notasAmericano : notasLatino).indexOf(tonality);
  }
  if (idx === -1) return [];

  return formula.map((intervalo, i) => {
    const nota = notas[(idx + intervalo) % 12];
    return nota + cualidades[i];
  });
}

// ChordSelectorView Component
interface ChordSelectorViewProps {
  onSelectChord: (chord: string) => void;
  notation: Notation;
  tonality: string;
  mode: Mode;
}
const ChordSelectorView = ({ onSelectChord, notation, tonality, mode }: ChordSelectorViewProps) => {
  const scaleChords = getScaleChords(tonality, mode, notation);
  const [selectedScaleChord, setSelectedScaleChord] = useState<string | null>(null);
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-medium mb-6">Acordes de la escala</h2>
      <div className="flex gap-4 mb-6 overflow-x-auto">
        {scaleChords.map((chord, index) => (
          <button
            key={index}
            className={`flex items-center justify-center w-[130px] h-[100px] text-4xl font-bold rounded-lg transition-all border border-gray-200
              ${selectedScaleChord === chord ? 'bg-[#33B249] text-white' : 'bg-white text-black hover:bg-green-100'}`}
            onClick={() => {
              setSelectedScaleChord(chord);
              onSelectChord(chord);
            }}
          >
            {chord}
          </button>
        ))}
      </div>
    </div>
  )
}

// Main App Component
function RecommendationsInner() {
  
  const [enableExplanations, setEnableExplanations] = useState(false);
  const [playingChordIndex, setPlayingChordIndex] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const nameParam = searchParams.get('name');
  const progressionParam = decodeURIComponent(searchParams.get('progression') || "");
  const editParam = searchParams.get('edit');
  const isEditing = editParam !== null && editParam !== undefined;
  let initialChords: (string|null)[] = ['C', 'G', 'Am', 'F'];
  if (progressionParam) {
    initialChords = progressionParam.split(',').filter(Boolean);
    if (!isEditing && initialChords.length < 4) {
      initialChords.push(null);
    }
  }
  
  const [activeTab, setActiveTab] = useState<TabKey>('recommendations');
  const [selectedChords, setSelectedChords] = useState<(string|null)[]>(initialChords);
  const [activeChord, setActiveChord] = useState(initialChords.length - 1);
  const notationParam = searchParams.get('notation');
  const keyParam = searchParams.get('key');
  const modeParam = searchParams.get('mode');
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);

  useEffect(() => {
    if (activeTab === 'recommendations') {
      fetchRecommendations(activeChord);
    }
  }, [activeTab]);

  let initialMode = 'Mayor';
  let initialTonality = 'C';
  if (keyParam) {
    if (keyParam.endsWith('m')) {
      initialMode = 'Menor';
      initialTonality = keyParam.slice(0, -1);
    } else {
      initialTonality = keyParam;
    }
  }
  if (modeParam) {
    if (modeParam.toLowerCase() === 'menor') initialMode = 'Menor';
    if (modeParam.toLowerCase() === 'mayor') initialMode = 'Mayor';
  }

  const [mode, setMode] = useState<Mode>(initialMode as Mode);
  const [tonality, setTonality] = useState(initialTonality);
  const [loadingExplanations, setLoadingExplanations] = useState<boolean>(false);

  const handleSelectChord = (index: number) => {
    setActiveChord(index);
    fetchRecommendations(index);
  };

  const fetchRecommendations = async (activeIndex: number, acordes?: (string|null)[]) => {
  
  if (activeIndex < 0) return;

  const acordesContexto = (acordes ?? selectedChords)
    .slice(0, activeIndex)
    .filter(isString)
    .map(toAmericano);


  const tonalidadCompleta = toAmericano(tonality) + (mode === 'Menor' ? ' minor' : ' major');
  const grados = convertirAcordesAGrados(acordesContexto, tonalidadCompleta);

  setLoadingExplanations(true);

  try {
    const response = await getChordRecommendations(acordesContexto, tonalidadCompleta, grados, mode, enableExplanations);

   
  

    const recomendaciones = response.map((acorde, i) => ({
      chord: acorde.chord,
      text: enableExplanations ? acorde.explanation : "", 
      rating: 3 - i,
    }));


    console.log("🔍 Recomendaciones formateadas:", recomendaciones);

    setRecommendations(recomendaciones);
  } catch (error) {
    console.error("Error obteniendo recomendaciones:", error);
    setRecommendations([]);
  }finally {
    setLoadingExplanations(false); 
  }
};

  const { notation, toggleNotation } = useNotation();
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [progressionName, setProgressionName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (notation === "latino") {
      setTonality(toLatino(tonality));
    } else {
      setTonality(toAmericano(tonality));
    }
  }, [notation]);

  const handleSaveProgression = async () => {
    try {
      const user = await getUserService();
      if (!user) {
        setShowLoginModal(true);
        return;
      }

      if (isEditing) {
        handleModalOk();
      } else {
        setShowSaveModal(true);
      }
    } catch (error) {
      console.log("No autenticado");
      setShowLoginModal(true);
    }
  };

  const handleModalOk = async () => {
    try {
      const progressionNameFinal: string = (progressionName?.trim() || nameParam || 'progresion');
      const progression = {
        name: progressionNameFinal,
        chords: selectedChords.filter(isString).map(toAmericano),
      };

      await saveProgressionService(progression.name, progression.chords, mode, toAmericano(tonality), editParam ? parseInt(editParam) : undefined);

      setShowSaveModal(false);
      setProgressionName("");
      router.push('/progressions');
    } catch (error) {
      console.error('Error al guardar:', error);
      setError('Error al guardar la progresión');
    }
  };

  const handleModalCancel = () => {
    setShowSaveModal(false);
    setProgressionName("");
  };
  
  const handleAddChord = (chord: string) => {
    const notes = chordToNotes(chord);
    playChord(notes); 
    if (activeChord >= 0 && activeChord < selectedChords.length) {
      const newChords = [...selectedChords];
      newChords[activeChord] = chord;
      setSelectedChords(newChords);
    } else {
      setSelectedChords([...selectedChords, chord]);
    }
  };
  
  const handleDeleteChord = (newChords: (string|null)[], newActiveChord: number) => {
  setSelectedChords(newChords);
  setActiveChord(newActiveChord);
  fetchRecommendations(newActiveChord, newChords); 
};

  

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <Sidebar active="Componer" />
      <div className="absolute top-6 right-6 z-10 flex items-center gap-4">
    <NotationToggle />
    <ExplanationToggle 
      showExplanations={enableExplanations}
      toggleExplanations={() => setEnableExplanations(!enableExplanations)}
    />
  </div>
      <div className="flex-1 p-6">
        <Header
          notation={notation}
          toggleNotation={toggleNotation}
          mode={mode}
          setMode={setMode}
          tonality={tonality}
          setTonality={setTonality}
        />
        <ChordProgression
          chords={selectedChords}
          activeChord={activeChord}
          setActiveChord={setActiveChord}
          onDeleteChord={handleDeleteChord}
          notation={notation}
          onSelectChord={handleSelectChord} 
          fetchRecommendations={fetchRecommendations} 
          playingChordIndex={playingChordIndex}
        />
        <ActionButtons 
        onSave={handleSaveProgression}
        selectedChords={selectedChords}
        onPlay={async () => {
          const chordsToPlay = selectedChords.filter(isString);

          for (let i = 0; i < chordsToPlay.length; i++) {
            const chord = chordsToPlay[i];
            setPlayingChordIndex(i); // Acorde activo
            const notes = chordToNotes(chord);
            playChord(notes); // reproducir acorde
            await new Promise(resolve => setTimeout(resolve, 1250)); // espera 2s antes del siguiente acorde
          }

          setPlayingChordIndex(null); // fin de reproducción
        }}
        progressionName={progressionName}
        nameParam={nameParam}
        
        />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === 'recommendations' ? (
          loadingExplanations ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-600">Generando Recomendaciones...</span>
            </div>
          ) : (
            <RecommendationsView
              onSelectChord={handleAddChord}
              recommendations={recommendations}
              notation={notation}
            />
          )
        ) : (
          <ChordSelectorView onSelectChord={handleAddChord} notation={notation} tonality={tonality} mode={mode} />
        )}
        {/* Modal para guardar progresión */}
        {showSaveModal && !isEditing && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-4">
              <h2 className="text-2xl font-bold mb-2 text-center">Nombrar Progresión</h2>
              <input
                type="text"
                className="border border-gray-300 rounded-md px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Nombre de la progresión"
                value={progressionName}
                onChange={e => setProgressionName(e.target.value)}
                autoFocus
                maxLength={32}
              />
              <div className="text-right text-xs text-gray-500">{progressionName.length}/32</div>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  className="px-6 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                  onClick={handleModalCancel}
                >
                  Cancelar
                </button>
                <button
                  className="px-6 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition disabled:opacity-50"
                  onClick={handleModalOk}
                  disabled={!progressionName.trim() || progressionName.length > 32}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-2 text-center">Iniciar sesión requerido</h2>
            <p className="text-center text-gray-600">
              Tienes que iniciar sesión para poder guardar tus progresiones.
            </p>
            <div className="flex justify-end gap-4 mt-4">
              <button
                className="px-6 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                onClick={() => setShowLoginModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-6 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition"
                onClick={() => {
                  const chordsParam = encodeURIComponent(selectedChords.filter(isString).join(','));
                  const key = toAmericano(tonality);
                  const currentUrl = `/recommendations?progression=${chordsParam}&key=${key}&mode=${mode}`;
                  router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
                }}
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



export default function Page() {
  return (
    <Suspense fallback={null}>
      <RecommendationsInner />
    </Suspense>
  );
}
