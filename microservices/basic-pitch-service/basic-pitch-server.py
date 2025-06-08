from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from pydub import AudioSegment
from basic_pitch.inference import predict
import os
import tempfile
import math

app = FastAPI()

# Helper: Group pitch data into windows of X seconds
def group_pitch_data(pitch_data, window_size=10.0):
    max_end_time = max(p["end"] for p in pitch_data)
    num_windows = math.ceil(max_end_time / window_size)

    grouped_data = []

    for window_index in range(num_windows):
        window_start = window_index * window_size
        window_end = (window_index + 1) * window_size

        pitches_in_window = [
            p for p in pitch_data if p["start"] < window_end and p["end"] > window_start
        ]

        if not pitches_in_window:
            continue  # Skip if no pitches in window

        avg_pitch = sum(p["pitch"] for p in pitches_in_window) / len(pitches_in_window)
        avg_confidence = sum(p["confidence"] for p in pitches_in_window) / len(pitches_in_window)

        grouped_data.append({
            "window_start": window_start,
            "window_end": window_end,
            "average_pitch": round(avg_pitch, 2),
            "average_confidence": round(avg_confidence, 2),
        })

    return grouped_data

@app.post("/analyze-pitch")
async def analyze_pitch(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_in:
        temp_in.write(await file.read())
        temp_in_path = temp_in.name

    temp_out_path = temp_in_path.replace(".mp3", ".wav")

    try:
        # Convert MP3 to WAV
        try:
            audio = AudioSegment.from_file(temp_in_path)
        except Exception as e:
            return JSONResponse(status_code=400, content={"error": f"Invalid audio file: {str(e)}"})

        audio = audio.set_channels(1).set_frame_rate(22050).normalize()
        audio.export(temp_out_path, format="wav")

        # Predict pitch
        output = predict(temp_out_path)
        pitch_data = output[2] if len(output) > 2 else None

        if not pitch_data or not isinstance(pitch_data, list) or len(pitch_data) == 0:
            return JSONResponse(content={"pitch_data": "No pitch data found."})

        # Parse
        parsed_data = [
            {
                "start": float(p[0]),
                "end": float(p[1]),
                "pitch": int(p[2]),
                "confidence": float(p[3]),
            }
            for p in pitch_data
        ]

        # Group into 5-second windows
        grouped_pitch_data = group_pitch_data(parsed_data, window_size=10.0)  # Change to 10.0 if you want

        return JSONResponse(content={"pitch_data": grouped_pitch_data})

    finally:
        if os.path.exists(temp_in_path):
            os.remove(temp_in_path)
        if os.path.exists(temp_out_path):
            os.remove(temp_out_path)