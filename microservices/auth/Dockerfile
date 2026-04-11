# imagen liviana
FROM python:3.9-slim
WORKDIR /app

# curl necesario para los healthchecks de Docker Compose
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# contenedor vivo
CMD ["python3", "-m", "http.server", "5001"]

EXPOSE 5001