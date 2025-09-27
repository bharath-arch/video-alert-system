FROM python:3.11-slim

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*


RUN pip install uv
COPY pyproject.toml uv.lock* ./

RUN uv sync --no-cache

COPY . .

# CMD ["uv", "run", "python", "main.py"]
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

