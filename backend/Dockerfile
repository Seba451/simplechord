# Use a TensorFlow base image matching training env
FROM tensorflow/tensorflow:2.19.0

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
ENV KERAS_BACKEND=tensorflow

WORKDIR /app

# System packages (optional, keep minimal)
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps; avoid reinstalling TF/Keras from requirements
COPY backend/requirements.txt /tmp/requirements.txt
RUN sed -i -E '/^(tensorflow(-cpu|-gpu)?|tf-nightly)(\[.*\])?([=~<].*)?$/Id' /tmp/requirements.txt \
    && sed -i -E '/^keras([=~<].*)?$/Id' /tmp/requirements.txt \
    && pip install --no-cache-dir -r /tmp/requirements.txt \
    && pip install --no-cache-dir "keras==3.11.1"

# Copy backend code
COPY backend/ /app/backend/

# Expose default port
EXPOSE 8000

# Start FastAPI with uvicorn; respect reverse-proxy headers and optional root path
ENV ROOT_PATH=""
CMD ["bash", "-lc", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips='*' ${ROOT_PATH:+--root-path \"$ROOT_PATH\"}"]
