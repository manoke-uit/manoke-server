import os
import traceback
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.concurrency import run_in_threadpool
import whisper

# Set cache directory to Hugging Face writable temp folder
os.environ["XDG_CACHE_HOME"] = "/tmp/.cache"

app = FastAPI()

# Load Whisper model once globally to avoid reloading on every request
model = whisper.load_model("small")

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        # Save uploaded file to a temporary location
        temp_file_path = f"/tmp/temp_{file.filename}"
        with open(temp_file_path, "wb") as f:
            f.write(await file.read())

        print(f"Started transcription: {file.filename}")

        # Run Whisper in a separate thread to avoid FastAPI blocking
        result = await run_in_threadpool(model.transcribe, temp_file_path)

        print(f"Transcription done: {result['text'][:50]}...")

        # Clean up the temp file
        os.remove(temp_file_path)

        return {"transcription": result["text"]}

    except Exception as e:
        print("ERROR during transcription:")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})
