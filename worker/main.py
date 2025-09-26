# from fastapi import FastAPI, HTTPException
# from fastapi.responses import StreamingResponse
# import cv2
# import asyncio
# import logging
# from fastapi.middleware.cors import CORSMiddleware

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# app = FastAPI()

# origins = ["*"]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# async def generate_frames():
#     rtsp_url = "rtsp://admin:admin@192.168.1.3:1935"
#     camera = cv2.VideoCapture(rtsp_url)
    
#     if not camera.isOpened():
#         logger.error(f"Failed to open RTSP stream: {rtsp_url}")
#         raise HTTPException(status_code=500, detail="Failed to connect to RTSP stream")

#     try:
#         while True:
#             success, frame = camera.read()
#             if not success:
#                 logger.warning("Failed to read frame from camera")
#                 break
#             ret, buffer = cv2.imencode('.jpg', frame)
#             if not ret:
#                 logger.warning("Failed to encode frame")
#                 continue
#             yield (b'--frame\r\n'
#                    b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
#             await asyncio.sleep(0.033)  
#     except Exception as e:
#         logger.error(f"Error in generate_frames: {e}")
#         raise HTTPException(status_code=500, detail="Error streaming video")
#     finally:
#         camera.release()
#         logger.info("Camera released")

# @app.get("/video_feed")
# async def video_feed():
#     return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

# @app.get("/")
# async def root():
#     return {"message": "RTSP Video Stream Server"}


from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import asyncio
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Allow CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def generate_frames(rtsp_url: str):
    camera = cv2.VideoCapture(rtsp_url)
    
    if not camera.isOpened():
        logger.error(f"Failed to open RTSP stream: {rtsp_url}")
        raise HTTPException(status_code=500, detail=f"Failed to connect to RTSP stream: {rtsp_url}")

    try:
        while True:
            success, frame = camera.read()
            if not success:
                logger.warning(f"Failed to read frame from RTSP stream: {rtsp_url}")
                break
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
        logger.info(f"Camera released for {rtsp_url}")

@app.get("/video_feed/{camera_id}")
async def video_feed(camera_id: int):
    # In a real app, fetch the RTSP URL from a database or config
    # For now, use a hardcoded mapping for demonstration
    rtsp_urls = {
        1: "rtsp://admin:admin@192.168.1.3:1935",
        2: "rtsp://admin:admin@192.168.1.4:1935",  # Example second camera
        # Add more camera IDs and RTSP URLs as needed
    }
    
    rtsp_url = rtsp_urls.get(camera_id)
    if not rtsp_url:
        raise HTTPException(status_code=404, detail=f"Camera ID {camera_id} not found")
    
    return StreamingResponse(generate_frames(rtsp_url), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/")
async def root():
    return {"message": "RTSP Video Stream Server"}