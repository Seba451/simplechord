// Mapeo de notas a números (semitonos desde C)
const notasASemitonos: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 
  'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 
  'A#': 10, 'Bb': 10, 'B': 11
};

// Grados romanos para escalas mayores y menores
const gradosMayores: string[] = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'VII'];
const gradosMenores: string[] = ['i', 'ii', 'III', 'iv', 'v', 'VI', 'VII'];

function extraerNotaRaiz(acorde: string): string | null {
  // Extraer la nota raíz del acorde (maneja sostenidos y bemoles)
  const match = acorde.match(/^([A-G][#b]?)/);
  return match ? match[1] : null;
}

function esAcordeMenor(acorde: string): boolean {
  // Detectar si es acorde menor (contiene 'm' pero no 'maj' o 'M')
  return /m(?!aj|A)/.test(acorde) || acorde.includes('min');
}

function esAcordeDisminuido(acorde: string): boolean {
  // Detectar acordes disminuidos para la UI, pero tratarlos igual en el sistema
  return acorde.includes('°') || acorde.includes('dim');
}

function convertirAcordesAGrados(acordes: string[], tonalidad: string): string[] {
  // Extraer la tónica y si es mayor o menor
  const tonicaMatch = tonalidad.match(/^([A-G][#b]?)\s*(major|minor|maj|min|M|m)?/i);
  
  if (!tonicaMatch) {
    throw new Error('Formato de tonalidad inválido');
  }
  

  
  const tonica = tonicaMatch[1];
  const tipoEscala = tonicaMatch[2] || '';
  const esMenor = /^(minor|min|m)$/i.test(tipoEscala);
  
  const semitonoTonica = notasASemitonos[tonica];
  const gradosEscala = esMenor ? gradosMenores : gradosMayores;

  console.log('Es menor:', esMenor);
  
  return acordes.map(acorde => {
    const notaRaiz = extraerNotaRaiz(acorde);
    
    if (!notaRaiz || !(notaRaiz in notasASemitonos)) {
      return '?'; // Acorde no reconocido
    }
    
    // Calcular el grado (distancia desde la tónica)
    let grado = (notasASemitonos[notaRaiz] - semitonoTonica + 12) % 12;
    
    // Mapear semitono a grado de escala (0-6)
  const semitonosEscala: number[] = esMenor 
      ? [0, 2, 3, 5, 7, 8, 10] // Escala menor natural
      : [0, 2, 4, 5, 7, 9, 11]; // Escala mayor
    
    const indiceGrado = semitonosEscala.indexOf(grado);
    
    if (indiceGrado === -1) {
      // Nota fuera de la escala, usar alteración
      const gradoCercano = semitonosEscala.reduce((prev: number, curr: number) => 
        Math.abs(curr - grado) < Math.abs(prev - grado) ? curr : prev
      );
      const indiceGradoCercano = semitonosEscala.indexOf(gradoCercano);
      const diferencia = grado - gradoCercano;
      
      

      let gradoBase = gradosEscala[indiceGradoCercano];
      
      console.log('grado', grado, 'grado cercano:', gradoCercano, 'diferencia:', diferencia, 'grado base:', gradoBase);
      // Agregar alteración
      if (diferencia > 0) {
        gradoBase = '#' + gradoBase;
      } else if (diferencia < 0) {
        gradoBase = 'b' + gradoBase;
      }
      console.log('2 grado', grado, 'grado cercano:', gradoCercano, 'diferencia:', diferencia, 'grado base:', gradoBase);
      return gradoBase;
    }

    
    
    let gradoResultante = gradosEscala[indiceGrado];
    
    // Ajustar según el tipo de acorde
    // Los disminuidos se tratan igual que otros acordes en el sistema
    if (esAcordeDisminuido(acorde)) {
      // Para disminuidos, usar el grado base sin notación especial
      return gradoResultante;
    } else if (esAcordeMenor(acorde)) {
      // Si el acorde es menor pero el grado esperado es mayor, convertir
      if (gradoResultante === gradoResultante.toUpperCase()) {
        gradoResultante = gradoResultante.toLowerCase();
      }
    } else {
      // Si el acorde es mayor pero el grado esperado es menor, convertir
      if (gradoResultante === gradoResultante.toLowerCase()) {
        gradoResultante = gradoResultante.toUpperCase();
      }
    }
    
    return gradoResultante;
  });
}


// Función exportable para usar en tu aplicación
export { convertirAcordesAGrados };
