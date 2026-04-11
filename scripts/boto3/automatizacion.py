import datetime
import os

import boto3
from botocore.exceptions import ClientError, NoCredentialsError


def generar_y_subir_reporte():
    # Nombre estático, el mismo que pusimos en el YAML
    nombre_bucket = "reportes-anthill-devops-smltp"

    timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    nombre_archivo = f"reporte_anthill_{timestamp}.txt"

    print(f"Iniciando auditoría de recursos...")

    try:
        s3 = boto3.client("s3", region_name="us-east-1")
        ec2 = boto3.client("ec2", region_name="us-east-1")

        contenido = f"=== REPORTE DE AUDITORÍA ANTHILL - {timestamp} ===\n\n"

        # ... (resto del código de EC2 igual) ...

        with open(nombre_archivo, "w") as f:
            f.write(contenido)

        print(f"Reporte generado localmente: {nombre_archivo}")
        print(f"Subiendo al bucket: {nombre_bucket}...")

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
