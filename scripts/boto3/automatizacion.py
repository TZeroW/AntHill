import datetime
import os
import urllib.request  # Para no instalar más librerías

import boto3
from botocore.exceptions import ClientError, NoCredentialsError


def health_check(ip, port, service_name):
    url = f"http://{ip}:{port}"
    try:
        response = urllib.request.urlopen(url, timeout=5)
        if response.getcode() == 200:
            print(f"✅ {service_name} en puerto {port}: FUNCIONANDO")
            return f"✅ {service_name}: Operacional (Puerto {port})\n"
    except Exception as e:
        print(f"❌ {service_name} en puerto {port}: FALLÓ ({e})")
        return f"❌ {service_name}: No disponible en puerto {port}\n"


def generar_y_subir_reporte():
    def generar_y_subir_reporte():
    s3_resource = boto3.resource("s3")
        bucket_list = [b.name for b in s3_resource.buckets.all() if "reportes-anthill" in b.name]
        
        if not bucket_list:
            print("❌ No se encontró ningún bucket con el nombre 'reportes-anthill'")
            return
        
        nombre_bucket = bucket_list[0] 
        print(f" usando el bucket: {nombre_bucket}")
    timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    nombre_archivo = f"reporte_anthill_{timestamp}.txt"

    try:
        s3 = boto3.client("s3", region_name="us-east-1")
        ec2 = boto3.client("ec2", region_name="us-east-1")

        contenido = f"=== REPORTE DE AUDITORÍA Y TESTS ANTHILL ===\n"
        contenido += (
            f"Fecha: {timestamp}\n------------------------------------------\n\n"
        )

        contenido += "--- ESTADO DE INFRAESTRUCTURA ---\n"
        instances = ec2.describe_instances(
            Filters=[{"Name": "instance-state-name", "Values": ["running"]}]
        )

        target_ip = None
        for reservation in instances.get("Reservations", []):
            for inst in reservation.get("Instances", []):
                ip = inst.get("PublicIpAddress")
                target_ip = ip  # Usaremos la última encontrada para el test
                contenido += (
                    f"[*] Instancia: {inst['InstanceId']} | IP: {ip} | Estado: OK\n"
                )

        if target_ip:
            contenido += "\n--- TEST DE INTEGRACIÓN (SMOKE TEST) ---\n"
            print(f"Iniciando pruebas de conectividad sobre {target_ip}...")

            contenido += health_check(target_ip, 5001, "Servicio de Auth")
            contenido += health_check(target_ip, 5002, "Servicio de Posts")
        else:
            contenido += (
                "\n⚠️ No se encontró IP pública para realizar pruebas de comunicación.\n"
            )

        with open(nombre_archivo, "w", encoding="utf-8") as f:
            f.write(contenido)

        s3.upload_file(nombre_archivo, nombre_bucket, f"reportes/{nombre_archivo}")
        print(f"✅ Reporte con tests subido a S3.")

    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    generar_y_subir_reporte()
