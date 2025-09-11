import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

type Mode = 'Mayor' | 'Menor';
type ProgressionPayload = {
  nombre: string;
  acordes: string[];
  tonalidad: string;
};
const isString = (x: unknown): x is string => typeof x === 'string' && x.length > 0;

export const saveProgressionService = async (
  progressionName: string,
  chords: string[],
  mode: Mode,
  tonality: string,
  id?: number
): Promise<any> => {
  try {
    const tonalidadFinal = mode === 'Menor' ? `${tonality}m` : tonality;
    const acordes = chords.filter(isString);
    if(id){
        // Update existing progression
      const response = await axios.put(
      `${API_BASE_URL}/progresiones/${id}`,  
      { nombre: progressionName, acordes, tonalidad: tonalidadFinal } as ProgressionPayload,
      {
        withCredentials: true, 
      }
      );
      return response.data;
    } else {
    const response = await axios.post(
      `${API_BASE_URL}/progresiones`,  
      { nombre: progressionName, acordes, tonalidad: tonalidadFinal } as ProgressionPayload,
      {
        withCredentials: true, 
      }
    );

    console.log('Progresión guardada:', response.data);
    return response.data;
  } 
  } catch (error: any) {
    console.error('Error al guardar progresión:', error?.response?.data || error?.message || error);
  }
};

export const getProgressionsService = async (): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/progresiones/mis-progresiones`, {
    withCredentials: true, 
  });
  return response.data;
};

export const deleteProgressionService = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/progresiones/${id}`, {
    withCredentials: true,
  });
};

export const editProgressionService = async (
  id: number,
  updatedData: Partial<ProgressionPayload>
): Promise<any> => {
    const response = await axios.put(`${API_BASE_URL}/progresiones/${id}`, updatedData, {
        withCredentials: true,
    });
    return response.data;
    }
