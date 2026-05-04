import datetime
import os
import urllib.request
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

def health_check(ip, port, service_name):
    url = f"http://{ip}:{port}"
    try:
        # Reducimos el timeout para que el pipeline no espere demasiado si no hay respuesta
        response = urllib.request.urlopen(url, timeout=3)
        if response.getcode() == 200:
            # Usamos texto plano para el print (evita errores de consola en Windows)
            print(f"[OK] {service_name} en puerto {port}: FUNCIONANDO")
            return f"OK - {service_name}: Operacional (Puerto {port})\n"
    except Exception as e:
        # Imprimimos el error sin emojis para evitar el UnicodeEncodeError
        print(f"[ERROR] {service_name} en puerto {port}: FALLO ({str(e)})")
        return f"FALLO - {service_name}: No disponible en puerto {port}\n"
    return f"FALLO - {service_name}: Error desconocido\n"

def generar_y_subir_reporte():
    nombre_bucket = "reportes-anthill-devops-smltp-v4"
    timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    nombre_archivo = f"reporte_anthill_{timestamp}.txt"

    try:
        s3 = boto3.client("s3", region_name="us-east-1")
        ec2 = boto3.client("ec2", region_name="us-east-1")

        contenido = f"=== REPORTE DE AUDITORIA Y TESTS ANTHILL ===\n"
        contenido += f"Fecha: {timestamp}\n------------------------------------------\n\n"

        contenido += "--- ESTADO DE INFRAESTRUCTURA ---\n"
        
        # Obtenemos solo las instancias de AntHill que estén corriendo
        instances = ec2.describe_instances(
            Filters=[
                {"Name": "instance-state-name", "Values": ["running"]},
                {"Name": "tag:Name", "Values": ["AntHill-Production-Server"]}
            ]
        )

        target_ip = None
        found_instances = False
        
        for reservation in instances.get("Reservations", []):
            for inst in reservation.get("Instances", []):
                found_instances = True
                ip = inst.get("PublicIpAddress")
                if ip:
                    target_ip = ip
                contenido += f"[*] Instancia: {inst['InstanceId']} | IP: {ip if ip else 'N/A'} | Estado: OK\n"

        if not found_instances:
            contenido += "No se encontraron instancias en ejecucion.\n"

        if target_ip:
            contenido += "\n--- TEST DE INTEGRACION (SMOKE TEST) ---\n"
            print(f"Iniciando pruebas de conectividad sobre {target_ip}...")
            
            # Lógica de reintentos para dar tiempo al arranque de Docker (UserData)
            import time
            intentos = 5
            servicios_ok = False
            res_auth = ""
            res_posts = ""
            
            for i in range(intentos):
                print(f"Intento {i+1}/{intentos}...")
                res_auth = health_check(target_ip, 5001, "Servicio de Auth")
                res_posts = health_check(target_ip, 5002, "Servicio de Posts")
                
                if "OK" in res_auth and "OK" in res_posts:
                    contenido += res_auth + res_posts
                    servicios_ok = True
                    break
                else:
                    if i < intentos - 1:
                        print("Los servicios aun no responden. Esperando 30 segundos...")
                        time.sleep(30)
            
            if not servicios_ok:
                contenido += "\nERROR: Los servicios no arrancaron a tiempo tras 5 intentos.\n"
                contenido += res_auth + res_posts
        else:
            contenido += "\nAVISO: No se encontro IP publica para realizar pruebas.\n"

        # Guardamos el archivo localmente
        with open(nombre_archivo, "w", encoding="utf-8") as f:
            f.write(contenido)

        # Intentamos subir a S3
        try:
            s3.upload_file(nombre_archivo, nombre_bucket, f"reportes/{nombre_archivo}")
            print(f"[SUCCESS] Reporte con tests subido a S3: reportes/{nombre_archivo}")
        except Exception as s3_err:
            print(f"[WARN] No se pudo subir a S3 (verificar bucket/permisos): {s3_err}")
            print(f"El reporte local se guardo como: {nombre_archivo}")

    except Exception as e:
        # Convertimos el error a string para evitar problemas de codificacion
        print(f"[CRITICAL ERROR] {str(e)}")

if __name__ == "__main__":
    generar_y_subir_reporte()