declare module 'jsmidgen' {
  // Minimal types to satisfy compilation
  namespace Midi {
    class Track {
      addNoteOn(channel: number, note: string, time?: number): void;
      addNoteOff(channel: number, note: string, time?: number): void;
    }
    class File {
      addTrack(track: Track): void;
      toBytes(): string;
    }
  }
  export = Midi;
}

