import axios from 'axios';

export const saveProgressionService = async (progressionName, chords, mode, tonality, id?: number) => {
  try {
    const tonalidadFinal = mode === 'Menor' ? `${tonality}m` : tonality
    if(id){
        // Update existing progression
      const response = await axios.put(
      `http://localhost:8000/progresiones/${id}`,  
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
      'http://localhost:8000/progresiones',  
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
  const response = await axios.get('http://localhost:8000/progresiones/mis-progresiones', {
    withCredentials: true, 
  });
  return response.data;
};

export const deleteProgressionService = async (id) => {
  await axios.delete(`http://localhost:8000/progresiones/${id}`, {
    withCredentials: true,
  });
};

export const editProgressionService = async (id, updatedData) => {
    const response = await axios.put(`http://localhost:8000/progresiones/${id}`, updatedData, {
        withCredentials: true,
    });
    return response.data;
    }