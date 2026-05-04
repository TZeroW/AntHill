# imagen liviana
FROM python:3.9-slim
WORKDIR /app

# curl necesario para los healthchecks de Docker Compose
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Instalar dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código de la aplicación
COPY app.py .

# Directorio para la base de datos SQLite
RUN mkdir -p /app/data

EXPOSE 5002

CMD ["python3", "app.py"]