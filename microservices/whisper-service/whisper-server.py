from fastapi import FastAPI, File, UploadFile
import whisper
import os

app = FastAPI()
model = whisper.load_model("base")

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    os.makedirs("temp", exist_ok=True)
    file_path = f"temp/{file.filename}"

    with open(file_path, "wb") as f:
        f.write(await file.read())

    result = model.transcribe(file_path)
    os.remove(file_path)

    return {"text": result["text"]}
