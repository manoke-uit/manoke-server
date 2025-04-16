from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from pydub import AudioSegment
from basic_pitch.inference import predict
import os
import tempfile

app = FastAPI()

@app.post("/analyze-pitch")
async def analyze_pitch(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_in:
        temp_in.write(await file.read())
        temp_in_path = temp_in.name

    temp_out_path = temp_in_path.replace(".mp3", ".wav")
    try:
        # Convert MP3 to WAV with proper settings
        try:
            audio = AudioSegment.from_file(temp_in_path)
        except Exception as e:
            return JSONResponse(status_code=400, content={"error": f"Invalid audio file: {str(e)}"})

        audio = audio.set_channels(1).set_frame_rate(22050).normalize()
        audio.export(temp_out_path, format="wav")

        #print("Duration:", audio.duration_seconds)
        #print("Channels:", audio.channels)
        #print("Sample Rate:", audio.frame_rate)

        # Run prediction
        output = predict(temp_out_path)
        #print("Prediction output:", output)

        # Extract note events
        pitch_data = output[2] if len(output) > 2 else None
        if not pitch_data or not isinstance(pitch_data, list) or len(pitch_data) == 0:
            return {"pitch_data": "No pitch data found."}

        # Format pitch data
        parsed_data = [
            {
                "start": float(p[0]),
                "end": float(p[1]),
                "pitch": int(p[2]),
                "confidence": float(p[3]),
            }
            for p in pitch_data
        ]

        return JSONResponse(content={"pitch_data": parsed_data})

    finally:
        if os.path.exists(temp_in_path):
            os.remove(temp_in_path)
        if os.path.exists(temp_out_path):
            os.remove(temp_out_path)
