import os
import traceback
import torchaudio
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.concurrency import run_in_threadpool
import whisper

os.environ["XDG_CACHE_HOME"] = "/tmp/.cache"

app = FastAPI()
model = whisper.load_model("small")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        temp_file = f"/tmp/temp_{file.filename}"
        with open(temp_file, "wb") as f:
            f.write(await file.read())

        # Step 1: Check if the audio is valid and long enough
        waveform, sample_rate = torchaudio.load(temp_file)
        duration = waveform.shape[1] / sample_rate
        if duration < 1.0:
            os.remove(temp_file)
            return JSONResponse(status_code=400, content={"error": "Audio too short to transcribe."})

        # Step 2: Transcribe safely
        result = await run_in_threadpool(model.transcribe, temp_file)
        os.remove(temp_file)

        return {"transcription": result["text"]}

    except Exception as e:
        print("ERROR during transcription:")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})
