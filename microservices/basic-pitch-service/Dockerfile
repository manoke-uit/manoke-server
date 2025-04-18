FROM python:3.10-slim

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install CPU-only torch first to avoid CUDA
RUN pip install --no-cache-dir torch==2.1.0+cpu -f https://download.pytorch.org/whl/torch_stable.html

# Copy requirements and install rest
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all app code
COPY . .

# Expose port
EXPOSE 8000

# Run the FastAPI server
CMD ["uvicorn", "basic-pitch-server:app", "--host", "0.0.0.0", "--port", "8000"]
