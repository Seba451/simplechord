from typing import List
from . import schemas
from fastapi import FastAPI, HTTPException, APIRouter
from .schemas import ExplainRequest, ExplainResponse
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np
import pickle
import tensorflow as tf
from openai import OpenAI
import os

client = OpenAI(
  api_key=""  # Replace with your actual API key or use environment variables
)

router = APIRouter(
    prefix="/predictions",
    tags=["predictions"]
)

model_major= load_model('/Users/sebastian.aversa/Documents/simplechord/simplechord-2/backend/app/lstm_model.keras')
model_minor= load_model('/Users/sebastian.aversa/Documents/simplechord/simplechord-2/backend/app/lstm_model_minor.keras')

with open('/Users/sebastian.aversa/Documents/simplechord/simplechord-2/backend/app/tokenizer_mayor.pkl', 'rb') as f:
    tokenizer_major = pickle.load(f)

with open('/Users/sebastian.aversa/Documents/simplechord/simplechord-2/backend/app/tokenizer_menor.pkl', 'rb') as f:
    tokenizer_minor = pickle.load(f)

max_seq_len = 4
vocab_size_major = len(tokenizer_major.word_index) + 1
vocab_size_minor = len(tokenizer_minor.word_index) + 1

@router.post("/explain", response_model=ExplainResponse)
async def explain_chords(request: ExplainRequest):
    try:
        if not request.progression or len(request.progression) == 0:
                prompt = f"""
                Eres un profesor de teoría musical. Explica de manera clara y concisa por qué, en la tonalidad de {request.tonalidad}, 
                recomendar el    acorde {request.chord} después de una progresión vacía (o sea que aún no hay acordes)
                es musicalmente correcto. Señala la función de cada acorde (tónica, subdominante, dominante, relativo menor, etc.), 
                cómo se conectan entre sí y por qué {request.chord} encaja en la progresión. 
                Usa un lenguaje sencillo, comprensible para principiantes, y resume la explicación en un párrafo de 3–4 líneas.
                """
                

                # Llamada a la API de OpenAI
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}]
                )

                explanation = response.choices[0].message.content.strip()

                return ExplainResponse(explanation=explanation)
        else:
        # Construimos el prompt
        
            prompt = f"""
            Eres un profesor de teoría musical. Explica de manera clara y concisa por qué, en la tonalidad de {request.tonalidad}, 
            recomendar el    acorde {request.chord} después de la progresión {request.progression} 
            es musicalmente correcto. Señala la función de cada acorde (tónica, subdominante, dominante, relativo menor, etc.), 
            cómo se conectan entre sí y por qué {request.chord} encaja en la progresión. 
            Usa un lenguaje sencillo, comprensible para principiantes, y resume la explicación en un párrafo de 3–4 líneas.
            """

            # Llamada a la API de OpenAI
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}]
            )

            explanation = response.choices[0].message.content.strip()

            return ExplainResponse(explanation=explanation)
    
    except Exception as e:
        print("❌ Error en /explain:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/major", response_model=List[str])
async def predict_chord_major(request: schemas.PredictionRequest):
    try:
         # Fallback si no hay input
        if not request.input_sequence or request.input_sequence.strip() == "":
            fallback_chords = [][:request.top_k]
            print("Fallback used:", fallback_chords)
            return fallback_chords

        sequence = tokenizer_major.texts_to_sequences([request.input_sequence])

        padded_sequence = pad_sequences(sequence, maxlen=max_seq_len, padding='pre')

        prediction = model_major.predict(np.array(padded_sequence))

        top_k_indices = np.argsort(prediction[0])[-request.top_k:][::-1]
        top_k_chords = [tokenizer_major.index_word.get(i, f"<UNK:{i}>") for i in top_k_indices]

        #Acordes ingresados por el usuario
        input_chords = request.input_sequence.split()
        print("📝 Input chords:", input_chords)

        top_k_probs = [prediction[0][i] for i in top_k_indices]
        print("🔮 Predicted chords with probabilities:")
        for chord, prob in zip(top_k_chords, top_k_probs):
            print(f"  {chord}: {prob:.4f}")
        return top_k_chords
    except Exception as e:
        print("❌ Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/minor", response_model=List[str])
async def predict_chord_minor(request: schemas.PredictionRequest):
    try:
         # Fallback si no hay input
        if not request.input_sequence or request.input_sequence.strip() == "":
            fallback_chords = [][:request.top_k]
            print("⚡ Fallback used:", fallback_chords)
            return fallback_chords

        sequence = tokenizer_minor.texts_to_sequences([request.input_sequence])

        padded_sequence = pad_sequences(sequence, maxlen=max_seq_len, padding='pre')

        prediction = model_minor.predict(np.array(padded_sequence))

        top_k_indices = np.argsort(prediction[0])[-request.top_k:][::-1]
        top_k_chords = [tokenizer_minor.index_word.get(i, f"<UNK:{i}>") for i in top_k_indices]

        print("🔮 Predicted chords:", top_k_chords)
        return top_k_chords
    except Exception as e:
        print("❌ Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))