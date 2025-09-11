import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const saveProgressionService = async (progressionName, chords, mode, tonality, id?: number) => {
  try {
    const tonalidadFinal = mode === 'Menor' ? `${tonality}m` : tonality
    if(id){
        // Update existing progression
      const response = await axios.put(
      `${API_BASE_URL}/progresiones/${id}`,  
      {
        nombre: progressionName,
        acordes: chords.filter(Boolean),
        tonalidad: tonalidadFinal,
      },
      {
        withCredentials: true, 
      }
      );
      return response.data;
    } else {
    const response = await axios.post(
      `${API_BASE_URL}/progresiones`,  
      {
        nombre: progressionName,
        acordes: chords.filter(Boolean),
        tonalidad: tonalidadFinal,
      },
      {
        withCredentials: true, 
      }
    );

    console.log('Progresión guardada:', response.data);
    return response.data;
  } 
  } catch (error) {
    console.error('Error al guardar progresión:', error.response?.data || error.message);
  }
};

export const getProgressionsService = async () => {
  const response = await axios.get(`${API_BASE_URL}/progresiones/mis-progresiones`, {
    withCredentials: true, 
  });
  return response.data;
};

export const deleteProgressionService = async (id) => {
  await axios.delete(`${API_BASE_URL}/progresiones/${id}`, {
    withCredentials: true,
  });
};

export const editProgressionService = async (id, updatedData) => {
    const response = await axios.put(`${API_BASE_URL}/progresiones/${id}`, updatedData, {
        withCredentials: true,
    });
    return response.data;
    }
