from typing import List
from . import schemas
from fastapi import FastAPI, HTTPException, APIRouter
from .schemas import ExplainRequest, ExplainResponse
#from tensorflow.keras.models import load_model
#from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np
import pickle
#import tensorflow as tf
from openai import OpenAI
import os
from threading import Lock
import time

router = APIRouter(
    prefix="/predictions",
    tags=["predictions"]
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Lazy assets: models and tokenizers
_assets_lock = Lock()
_assets_loaded = False
model_major = None
model_minor = None
tokenizer_major = None
tokenizer_minor = None
# Placeholders for lazy-imported keras utils
pad_sequences = None
load_model = None
max_seq_len = 4

def _resolve_keras_loaders():
    """Prefer Keras 3 loaders for .keras files; fallback to tf.keras."""
    try:
        from keras.models import load_model as _load_model
        try:
            from keras.utils import pad_sequences as _pad_sequences
        except Exception:
            from keras.preprocessing.sequence import pad_sequences as _pad_sequences
        return _load_model, _pad_sequences
    except Exception:
        from tensorflow.keras.models import load_model as _load_model
        from tensorflow.keras.preprocessing.sequence import pad_sequences as _pad_sequences
        return _load_model, _pad_sequences


def _first_existing(path_list):
    for p in path_list:
        full = os.path.join(BASE_DIR, p)
        if os.path.exists(full):
            return full
    return None


def ensure_assets_loaded():
    global _assets_loaded, model_major, model_minor, tokenizer_major, tokenizer_minor, pad_sequences, load_model
    if _assets_loaded:
        return
    with _assets_lock:
        if _assets_loaded:
            return
        try:
            t0 = time.time()
            # Lazy import heavy deps
            _load_model, _pad_sequences = _resolve_keras_loaders()
            load_model = _load_model
            pad_sequences = _pad_sequences

            # Resolve model/tokenizer paths (support multiple filenames)
            model_major_path = _first_existing([
                'lstm_model.keras', 'modelo_mayor.h5', 'lstm_model.h5', 'lstm_model_major.keras'
            ])
            model_minor_path = _first_existing([
                'lstm_model_minor.keras', 'modelo_menor.h5', 'lstm_model_minor.h5'
            ])
            tokenizer_mayor_path = os.path.join(BASE_DIR, 'tokenizer_mayor.pkl')
            tokenizer_menor_path = os.path.join(BASE_DIR, 'tokenizer_menor.pkl')

            if not model_major_path or not model_minor_path:
                raise FileNotFoundError("Model files not found in backend/app (expected lstm_model*.keras or modelo_*.h5)")
            if not os.path.exists(tokenizer_mayor_path) or not os.path.exists(tokenizer_menor_path):
                raise FileNotFoundError("Tokenizer files not found in backend/app/")

            model_major = load_model(model_major_path)
            model_minor = load_model(model_minor_path)

            with open(tokenizer_mayor_path, 'rb') as f:
                # nosec - loading trusted pickle artifacts packaged with the app
                tokenizer_major = pickle.load(f)
            with open(tokenizer_menor_path, 'rb') as f:
                tokenizer_minor = pickle.load(f)

            _assets_loaded = True
            print(f"Modelos y tokenizers cargados en {time.time()-t0:.2f}s")
        except Exception as e:
            print(f"Error cargando modelos/tokenizers: {e}")
            raise HTTPException(status_code=500, detail=f"Error cargando modelos: {e}")

# Lazy OpenAI client to avoid crashing at import time
def get_openai_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY no está configurada")
    return OpenAI(api_key=api_key)

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
                client = get_openai_client()
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
            client = get_openai_client()
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
        ensure_assets_loaded()
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
        print("Input chords:", input_chords)

        top_k_probs = [prediction[0][i] for i in top_k_indices]
        print("Predicted chords with probabilities:")
        for chord, prob in zip(top_k_chords, top_k_probs):
            print(f"  {chord}: {prob:.4f}")
        return top_k_chords
    except Exception as e:
        print("❌ Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/minor", response_model=List[str])
async def predict_chord_minor(request: schemas.PredictionRequest):
    try:
        ensure_assets_loaded()
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

        print("Predicted chords:", top_k_chords)
        return top_k_chords
    except Exception as e:
        print("❌ Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
