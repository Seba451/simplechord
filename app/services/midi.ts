import Midi from 'jsmidgen';
import { saveAs } from 'file-saver';
import { chordToNotes } from '../services/chords';

export const exportProgressionToMidi = (chords: string[], filename: string) => {
  const file = new Midi.File();
  const track = new Midi.Track();
  file.addTrack(track);

  const duration = 180; // duración de cada acorde
  const pause = 30;     // pausa entre acordes (en ticks)

  chords.forEach(chord => {
    if (!chord) return;
    const notes = chordToNotes(chord); // ["C4", "E4", "G4"]

    // Todas las notas ON al mismo tiempo
    notes.forEach((note, idx) => {
      track.addNoteOn(0, note, idx === 0 ? 0 : 0);
    });

    // Todas las notas OFF al mismo tiempo, después de "duration"
    notes.forEach((note, idx) => {
      track.addNoteOff(0, note, idx === 0 ? duration : 0);
    });

    // En lugar de agregar un C4, simplemente agregamos un "silencio"
    // Avanzamos el tiempo usando una nota OFF dummy
    track.addNoteOff(0, notes[0], pause);
  });

  const midiData = file.toBytes();
  const blob = new Blob([new Uint8Array(midiData.split('').map(c => c.charCodeAt(0)))], { type: 'audio/midi' });
  saveAs(blob, filename);
};