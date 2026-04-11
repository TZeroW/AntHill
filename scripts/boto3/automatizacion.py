import datetime
import os

import boto3
from botocore.exceptions import ClientError, NoCredentialsError


def generar_y_subir_reporte():
    timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    nombre_archivo = f"reporte_anthill_{timestamp}.txt"

    print(f"Iniciando auditoría de recursos...")

    try:
        s3 = boto3.client("s3", region_name="us-east-1")
        ec2 = boto3.client("ec2", region_name="us-east-1")

        buckets = s3.list_buckets()
        nombre_bucket = None
        for b in buckets["Buckets"]:
            if b["Name"].startswith("reportes-anthill"):
                nombre_bucket = b["Name"]
                break

        if not nombre_bucket:
            nombre_bucket = os.getenv(
                "BUCKET_NAME", "reportes-anthill-devops-590184134445"
            )

        contenido = f"=== REPORTE DE AUDITORÍA ANTHILL - {timestamp} ===\n\n"
        instances = ec2.describe_instances()
        contenido += "--- INSTANCIAS EC2 ---\n"
        for reservation in instances.get("Reservations", []):
            for inst in reservation.get("Instances", []):
                tags = {tag["Key"]: tag["Value"] for tag in inst.get("Tags", [])}
                name = tags.get("Name", "Sin Nombre")
                contenido += f"Nombre: {name} | ID: {inst['InstanceId']} | Estado: {inst['State']['Name']}\n"

        with open(nombre_archivo, "w") as f:
            f.write(contenido)

        print(f"Reporte generado localmente: {nombre_archivo}")
        print(f"Subiendo a S3 bucket: {nombre_bucket}...")

        s3.upload_file(nombre_archivo, nombre_bucket, f"reportes/{nombre_archivo}")
        print("✅ ¡Éxito! Reporte subido correctamente a S3.")

    except NoCredentialsError:
        print("❌ Error: No se encontraron credenciales.")
    except ClientError as e:
        print(f"❌ Error de AWS: {e}")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")


if __name__ == "__main__":
    generar_y_subir_reporte()
