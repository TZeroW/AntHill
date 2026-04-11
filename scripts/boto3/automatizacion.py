import datetime
import os

import boto3
from botocore.exceptions import ClientError, NoCredentialsError


def generar_y_subir_reporte():
    # Nombre estático sincronizado con el template.yaml
    nombre_bucket = "reportes-anthill-devops-smltp"

    timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    nombre_archivo = f"reporte_anthill_{timestamp}.txt"

    print(f"Iniciando auditoría de recursos en us-east-1...")

    try:
        s3 = boto3.client("s3", region_name="us-east-1")
        ec2 = boto3.client("ec2", region_name="us-east-1")

        # 1. Crear el cuerpo del reporte
        contenido = f"=== REPORTE DE AUDITORÍA ANTHILL ===\n"
        contenido += f"Fecha y Hora: {timestamp}\n"
        contenido += "------------------------------------------\n\n"

        # 2. Auditar Instancias EC2
        contenido += "--- DETALLE DE INSTANCIAS EC2 ---\n"
        instances = ec2.describe_instances()

        instancias_encontradas = 0
        for reservation in instances.get("Reservations", []):
            for inst in reservation.get("Instances", []):
                tags = {tag["Key"]: tag["Value"] for tag in inst.get("Tags", [])}
                nombre = tags.get("Name", "Sin Nombre")
                estado = inst["State"]["Name"]
                inst_id = inst["InstanceId"]
                ip_publica = inst.get("PublicIpAddress", "Sin IP Pública")

                linea = f"[*] {nombre} | ID: {inst_id} | Estado: {estado} | IP: {ip_publica}\n"
                contenido += linea
                instancias_encontradas += 1

        if instancias_encontradas == 0:
            contenido += "No se encontraron instancias activas.\n"

        # 3. Guardar archivo localmente
        with open(nombre_archivo, "w", encoding="utf-8") as f:
            f.write(contenido)

        print(f"Reporte generado localmente: {nombre_archivo}")

        # 4. Subir a S3
        print(f"Subiendo al bucket: {nombre_bucket}...")
        s3.upload_file(nombre_archivo, nombre_bucket, f"reportes/{nombre_archivo}")
        print("✅ ¡Éxito! Reporte subido correctamente a S3.")

    except NoCredentialsError:
        print("❌ Error: No se encontraron credenciales de AWS.")
    except ClientError as e:
        print(f"❌ Error de AWS: {e.response['Error']['Message']}")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")


if __name__ == "__main__":
    generar_y_subir_reporte()
