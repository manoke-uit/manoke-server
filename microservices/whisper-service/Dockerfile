FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install ffmpeg only (no CUDA, no dev tools)
RUN apt-get update && apt-get install -y ffmpeg && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install CPU-only PyTorch first to avoid CUDA overhead
RUN pip install --no-cache-dir torch==2.1.0+cpu -f https://download.pytorch.org/whl/torch_stable.html

# Install Whisper and FastAPI-related stuff
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app files
COPY . .

# Expose port
EXPOSE 8001

# Launch server (adjust file name if needed)
CMD ["uvicorn", "whisper-server:app", "--host", "0.0.0.0", "--port", "8000"]