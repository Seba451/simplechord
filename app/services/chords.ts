// utils/chords.ts
const NOTE_TO_MIDI = {
  C: 60, "C#": 61, D: 62, "D#": 63, E: 64, F: 65, "F#": 66,
  G: 55, "G#": 56, A: 57, "A#": 58, B: 59
};

function midiToNote(midi: number) {
  const names = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const name = names[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return name + octave;
}

export function chordToNotes(chord: string): string[] {
  const root = chord.replace("m", "");
  const isMinor = chord.includes("m");
  const rootMidi = NOTE_TO_MIDI[root] || 60;

  if (isMinor) {
    return [
      midiToNote(rootMidi),
      midiToNote(rootMidi + 3),
      midiToNote(rootMidi + 7),
    ];
  } else {
    return [
      midiToNote(rootMidi),
      midiToNote(rootMidi + 4),
      midiToNote(rootMidi + 7),
    ];
  }
}