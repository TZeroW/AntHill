import os
import urllib.request
from datetime import datetime


def test_communication():
    results = []
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    results.append(f"--- Test de Comunicación AntHill - {timestamp} ---")

    # Usamos el nombre del servicio del compose
    targets = {
        "Auth Service": "http://auth-service:5001",
        "Posts Service": "http://posts-service:5002",
    }

    for name, url in targets.items():
        try:
            response = urllib.request.urlopen(url, timeout=5)
            status = response.getcode()
            results.append(f"[OK] {name} respondiendo en {url} (Status: {status})")
        except Exception as e:
            results.append(f"[ERROR] {name} no alcanzable en {url}. Motivo: {e}")

    # Guardar el resultado en un archivo de log
    log_name = f"test_results-{timestamp}.log"
    with open(log_name, "w") as f:
        f.write("\n".join(results))

    return log_name


if __name__ == "__main__":
    print("Iniciando pruebas de comunicación...")
    log_file = test_communication()
    print(f"Pruebas finalizadas. Resultados guardados en {log_file}")
