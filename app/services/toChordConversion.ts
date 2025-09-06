const notasASemitonos: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1,
  'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4,
  'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11,
};

const semitonosANotas: Record<number, string> = {
  0: 'C', 1: 'C#', 2: 'D', 3: 'D#',
  4: 'E', 5: 'F', 6: 'F#', 7: 'G',
  8: 'G#', 9: 'A', 10: 'A#', 11: 'B',
};

const gradosMayores = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
const gradosMenores = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

function esMenor(grado: string) {
  return grado === grado.toLowerCase() || grado.includes('°');
}

function normalizarGrado(grado: string) {
  return grado.replace(/[^iIvV]/g, '').toLowerCase();
}

function convertirGradosAAcordes(grados: string[], tonalidad: string): string[] {
  const match = tonalidad.match(/^([A-G][b#]?)(?:\s*(major|minor))?$/i);
  if (!match) throw new Error('Tonalidad inválida');

  const tonica = match[1];
  const esTonalidadMenor = /minor/i.test(match[2] || '');
  const gradosRef = esTonalidadMenor ? gradosMenores : gradosMayores;
  const escalaBase = esTonalidadMenor
    ? [0, 2, 3, 5, 7, 8, 10] // menor natural
    : [0, 2, 4, 5, 7, 9, 11]; // mayor

  const semitonoTonica = notasASemitonos[tonica];
  if (semitonoTonica === undefined) throw new Error('Tónica no reconocida');

  return grados.map((grado) => {
    if (!grado || grado === '?') return '?';

    const alteraciones = grado.match(/^[#b]+/)?.[0] || '';
    const base = grado.replace(/^[#b]+/, '');
    const idx = gradosRef.findIndex(g => g.replace('°', '').toLowerCase() === base.toLowerCase());

    if (idx === -1) return '?';

    let semitono = escalaBase[idx];
    for (const char of alteraciones) {
      semitono += char === '#' ? 1 : -1;
    }

    const nota = semitonosANotas[(semitonoTonica + semitono + 12) % 12];
    const tipo = esMenor(base) ? (grado.includes('°') ? 'dim' : 'm') : '';

    console.log(`Convirtiendo grado ${grado} a acorde: ${nota}${tipo}`);
    return nota + tipo;
  });
}

export { convertirGradosAAcordes };