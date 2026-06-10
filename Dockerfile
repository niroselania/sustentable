FROM python:3.11-alpine

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server.py index.html app.js icon.svg seed.xlsx ./

ENV APP_DIR=/app
ENV DATA_DIR=/data
ENV PORT=8000

EXPOSE 8000

CMD ["python", "server.py"]
