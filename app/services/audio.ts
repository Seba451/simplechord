'use client';
// utils/audio.ts (SSR-safe, lazy Tone import)
import { chordToNotes } from "./chords";

type ToneNS = typeof import('tone');
let ToneMod: ToneNS | null = null;
let piano: any = null;

async function getTone(): Promise<ToneNS> {
  if (typeof window === 'undefined') {
    throw new Error('Audio not available on server');
  }
  if (!ToneMod) {
    ToneMod = await import('tone');
  }
  return ToneMod;
}

async function ensurePiano() {
  if (piano) return piano;
  const Tone = await getTone();
  piano = new Tone.Sampler({
    urls: {
      A0: "A0.mp3",
      C1: "C1.mp3",
      "D#1": "Ds1.mp3",
      "F#1": "Fs1.mp3",
      A1: "A1.mp3",
      C2: "C2.mp3",
      "D#2": "Ds2.mp3",
      "F#2": "Fs2.mp3",
      A2: "A2.mp3",
      C3: "C3.mp3",
      "D#3": "Ds3.mp3",
      "F#3": "Fs3.mp3",
      A3: "A3.mp3",
      C4: "C4.mp3",
      "D#4": "Ds4.mp3",
      "F#4": "Fs4.mp3",
      A4: "A4.mp3",
      C5: "C5.mp3",
      "D#5": "Ds5.mp3",
      "F#5": "Fs5.mp3",
      A5: "A5.mp3",
      C6: "C6.mp3",
      "D#6": "Ds6.mp3",
      "F#6": "Fs6.mp3",
      A6: "A6.mp3",
      C7: "C7.mp3",
      "D#7": "Ds7.mp3",
      "F#7": "Fs7.mp3",
      A7: "A7.mp3",
      C8: "C8.mp3"
    },
    release: 1,
    baseUrl: "https://tonejs.github.io/audio/salamander/",
  }).toDestination();
  return piano;
}

export async function playChord(notes: string[]) {
  const Tone = await getTone();
  await Tone.start();
  const p = await ensurePiano();
  p.triggerAttackRelease(notes, "2n");
}

export const playProgression = async (
  chords: string[],
  setCurrentChordIndex: (i: number) => void
) => {
  const Tone = await getTone();
  const synth = new Tone.PolySynth(Tone.Synth).toDestination();
  await Tone.start();

  let time = 0;
  chords.forEach((chord, i) => {
    const notes = chordToNotes(chord);
    Tone.Transport.schedule((t) => {
      setCurrentChordIndex(i);
      synth.triggerAttackRelease(notes, "1n", t);
    }, time);
    time += 1; 
  });

  Tone.Transport.start("+0.1");
};
