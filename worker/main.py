from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import cv2
import mediapipe as mp
import asyncio
import logging
import time
import aiohttp
import os
import json

print("OpenCV version:", cv2.__version__)
print("Mediapipe version:", mp.__version__)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Serve static snapshots
os.makedirs('snapshots', exist_ok=True)
app.mount("/snapshots", StaticFiles(directory="snapshots"), name="snapshots")

# Allow CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def generate_frames(rtsp_url: str, camera_id: int):
    camera = cv2.VideoCapture(rtsp_url)
    
    if not camera.isOpened():
        logger.error(f"Failed to open RTSP stream: {rtsp_url}")
        raise HTTPException(status_code=500, detail=f"Failed to connect to RTSP stream: {rtsp_url}")

    # Initialize Mediapipe Face Detection
    mp_face_detection = mp.solutions.face_detection
    face_detection = mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5)
    
    last_alert_time = 0
    start_time = time.time()
    frame_count = 0

    try:
        while True:
            success, frame = camera.read()
            if not success:
                logger.warning(f"Failed to read frame from RTSP stream: {rtsp_url}")
                break

            frame_count += 1
            current_time = time.time()
            fps = frame_count / (current_time - start_time)

            # Draw overlay text
            cv2.putText(frame, f"Camera ID: {camera_id}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(frame, f"FPS: {int(fps)}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

            # Face detection with Mediapipe
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = face_detection.process(frame_rgb)
            bboxes = []
            if results.detections:
                for detection in results.detections:
                    bbox = detection.location_data.relative_bounding_box
                    h, w, _ = frame.shape
                    x, y = int(bbox.xmin * w), int(bbox.ymin * h)
                    width, height = int(bbox.width * w), int(bbox.height * h)
                    cv2.rectangle(frame, (x, y), (x + width, y + height), (255, 0, 0), 2)
                    bboxes.append({"x": x, "y": y, "w": width, "h": height})

            # Send alert if faces detected and cooldown passed
            if len(bboxes) > 0 and current_time - last_alert_time > 5:  # 5-second cooldown
                last_alert_time = current_time
                ret, buffer = cv2.imencode('.jpg', frame)
                if ret:
                    # Save snapshot to storage
                    timestamp = int(current_time)
                    filename = f"snapshot_{camera_id}_{timestamp}.jpg"
                    snapshot_path = f"snapshots/{filename}"
                    with open(snapshot_path, 'wb') as f:
                        f.write(buffer.tobytes())
                    snapshot_url = f"http://127.0.0.1:8000/snapshots/{filename}"

                    # Build alert object
                    alert = {
                        "camera_id": camera_id,
                        "timestamp": timestamp,
                        "snapshot_url": snapshot_url,
                        "bbox": bboxes,
                        "meta": {}  # Add any additional metadata here if needed
                    }

                    # POST alert to backend API
                    try:
                        async with aiohttp.ClientSession() as session:
                            async with session.post('http://127.0.0.1:4000/api/cameras/alerts', json=alert) as resp:
                                if resp.status != 200:
                                    logger.warning(f"Failed to post alert: {resp.status}")
                    except Exception as e:
                        logger.error(f"Error posting alert: {e}")

            # Encode and yield the processed frame for MJPEG streaming
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                logger.warning("Failed to encode frame")
                continue
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            await asyncio.sleep(0.033)  # ~30 FPS
    except Exception as e:
        logger.error(f"Error in generate_frames for {rtsp_url}: {e}")
        raise HTTPException(status_code=500, detail="Error streaming video")
    finally:
        camera.release()
        face_detection.close()
        logger.info(f"Camera released for {rtsp_url}")

@app.get("/video_feed/{camera_id}")
async def video_feed(camera_id: int, rtsp_url: str = Query(...)):
    return StreamingResponse(generate_frames(rtsp_url, camera_id), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/")
async def root():
    return {"message": "RTSP Video Stream Server"}