FROM python:3.10-slim

# Install FFmpeg (required for Whisper)
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy app files
COPY . .

# Install dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Expose port for Uvicorn
EXPOSE 8000

# Run the app
CMD ["uvicorn", "whisper_server:app", "--host", "0.0.0.0", "--port", "8000"]
