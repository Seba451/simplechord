import axios from 'axios';
import { convertirGradosAAcordes } from './toChordConversion';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function getChordRecommendations(acordes: string[], tonalidad: string, grados: string[], mode: String, enableExplanations: boolean, topK: number = 3) {
  try {
    console.log('modo: ', mode);
    const input_sequence = grados.join(" "); // ["I", "IV", "V"] => "I IV V"
    console.log('secuencia de entrada: ', input_sequence);

    console.log('tonalidad: ', tonalidad);
    console.log('acordes: ', acordes);
    const modePath = mode === 'Menor' ? 'minor' : 'major';
    
    const response = await axios.post(`${API_BASE_URL}/predictions/${modePath}`, {
      input_sequence,
      top_k: topK
    });

    console.log("wacl", response.data);

    const recommendations: string[] = response.data;

    let recommendationsChords: string[] = [];

    if (recommendations.length === 0) {
      if(mode === 'Mayor') {
        recommendationsChords = convertirGradosAAcordes(["I", "IV", "V"], tonalidad);
      } else {
        recommendationsChords = convertirGradosAAcordes(["i", "iv", "v"], tonalidad);
      }
    }else{
      recommendationsChords = convertirGradosAAcordes(recommendations, tonalidad);
    }
  

    let explanations = [];

    if (enableExplanations) {
      explanations = await Promise.all(
        recommendationsChords.map(async (chord) => {
          try {
            const expResponse = await axios.post(`${API_BASE_URL}/predictions/explain`, {
              chord,
              progression: acordes, // 👈 ojo, acá mandá progression, no "acordes"
              tonalidad,
            });
            return { chord, explanation: expResponse.data.explanation };
          } catch (err) {
            console.error(`Error explicando acorde ${chord}:`, err);
            return { chord, explanation: "No se pudo generar explicación." };
          }
        })
      );
    } else {
      explanations = recommendationsChords.map((chord) => ({
        chord,
        explanation: "", 
      }));
    }

    return explanations;

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
}
