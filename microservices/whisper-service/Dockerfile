FROM python:3.9-slim

WORKDIR /app

# Install ffmpeg 
RUN apt-get update && apt-get install -y ffmpeg

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create writable cache directory for whisper
RUN mkdir -p /app/.cache/whisper

# Copy app code
COPY . .

# Run the app on port 7860 (required by Hugging Face)
CMD ["uvicorn", "whisper-server:app", "--host", "0.0.0.0", "--port", "7860"]
