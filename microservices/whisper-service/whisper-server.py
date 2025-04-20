import os
from fastapi.responses import JSONResponse
import traceback
os.environ["XDG_CACHE_HOME"] = "/tmp/.cache"

from fastapi import FastAPI, UploadFile, File
import whisper

app = FastAPI()

model = whisper.load_model("base")  # try "base" for better words fetching

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        # Save temp file in /tmp (writable in Hugging Face)
        temp_file = f"/tmp/temp_{file.filename}"
        with open(temp_file, "wb") as f:
            f.write(await file.read())

        result = model.transcribe(temp_file)
        os.remove(temp_file)
        return {"transcription": result["text"]}

    except Exception as e:
        print("ERROR during transcription:")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})
