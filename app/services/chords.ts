const NOTE_TO_MIDI: Record<string, number> = {
  C: 60, "C#": 61, D: 62, "D#": 63, E: 64, F: 53, "F#": 54,
  G: 55, "G#": 56, A: 57, "A#": 58, B: 59
};

const LATINO_TO_AMERICANO: Record<string, string> = {
  "Do": "C",
  "Re": "D",
  "Mi": "E",
  "Fa": "F",
  "Sol": "G",
  "La": "A",
  "Si": "B",
};



function toAmericanRoot(root: string): string {

  const mLat = root.match(/^(Do|Re|Mi|Fa|Sol|La|Si)(#|b)?$/i);
  if (mLat) {
    const base = LATINO_TO_AMERICANO[mLat[1][0].toUpperCase() + mLat[1].slice(1).toLowerCase()];
    const acc = (mLat[2] || "");
    return base + acc;
  }

  const mAm = root.match(/^([A-Ga-g])(#{1}|b{1})?$/);
  if (mAm) {
    const base = mAm[1].toUpperCase();
    const acc = (mAm[2] || "");
    return base + acc;
  }

  return "C";
}

function midiToNote(midi: number) {
  const names = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const name = names[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return name + octave;
}

export function chordToNotes(chord: string): string[] {
  const m = chord.trim().match(/^(.+?)(m)?$/i);
  const rawRoot = m ? m[1] : chord;
  const isMinor = !!(m && m[2]);

  const rootAmerican = toAmericanRoot(rawRoot);
  const rootMidi = NOTE_TO_MIDI[rootAmerican] ?? 60; // default C4

  const third = isMinor ? 3 : 4;
  const fifth = 7;

  return [
    midiToNote(rootMidi),
    midiToNote(rootMidi + third),
    midiToNote(rootMidi + fifth),
  ];
}
