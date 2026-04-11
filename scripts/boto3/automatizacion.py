import datetime
import os

import boto3
from botocore.exceptions import ClientError, NoCredentialsError


def generar_y_subir_reporte():
    # 1. Configuración de nombres y variables
    # Prioriza la variable BUCKET_NAME que inyectamos desde Jenkins
    nombre_bucket = os.getenv("BUCKET_NAME", "reportes-anthill-devops-590184134445")

    # Formato de fecha seguro para nombres de archivo (sin espacios ni dos puntos)
    timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    nombre_archivo = f"reporte_anthill_{timestamp}.txt"

    print(f"Iniciando auditoría de recursos...")

    # 2. Inicializar clientes de AWS
    try:
        ec2 = boto3.client("ec2", region_name="us-east-1")
        s3 = boto3.client("s3", region_name="us-east-1")

        # 3. Recolectar información de la infraestructura (Auditoría)
        contenido = f"=== REPORTE DE AUDITORÍA ANTHILL - {timestamp} ===\n\n"

        # Listar Instancias EC2
        instances = ec2.describe_instances()
        contenido += "--- INSTANCIAS EC2 ---\n"
        for reservation in instances.get("Reservations", []):
            for inst in reservation.get("Instances", []):
                tags = {tag["Key"]: tag["Value"] for tag in inst.get("Tags", [])}
                name = tags.get("Name", "Sin Nombre")
                contenido += f"Nombre: {name} | ID: {inst['InstanceId']} | Estado: {inst['State']['Name']}\n"

        # 4. Guardar el reporte localmente
        with open(nombre_archivo, "w") as f:
            f.write(contenido)
        print(f"Reporte generado localmente: {nombre_archivo}")

        # 5. Subir a S3
        print(f"Subiendo a S3 bucket: {nombre_bucket}...")
        s3.upload_file(nombre_archivo, nombre_bucket, f"reportes/{nombre_archivo}")
        print("✅ ¡Éxito! Reporte subido correctamente a S3.")

    except NoCredentialsError:
        print("❌ Error: No se encontraron credenciales de AWS.")
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchBucket":
            print(f"❌ Error: El bucket '{nombre_bucket}' no existe.")
        else:
            print(f"❌ Error de AWS: {e}")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")


if __name__ == "__main__":
    generar_y_subir_reporte()
