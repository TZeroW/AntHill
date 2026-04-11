import boto3
import os
from datetime import datetime

def generar_reporte():
    # Conectamos con los servicios (Boto3 usa las variables de entorno de tu Jenkins)
    ec2 = boto3.client('ec2', region_name='us-east-1')
    s3_client = boto3.client('s3', region_name='us-east-1')
    
    nombre_archivo = f"reporte_anthill_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    
    try:
        with open(nombre_archivo, "w") as f:
            f.write(f"=== REPORTE DE INFRAESTRUCTURA ANTHILL - {datetime.now()} ===\n\n")
            
            # Listar Instancias EC2
            f.write("--- Instancias EC2 ---\n")
            instances = ec2.describe_instances()
            for reservation in instances['Reservations']:
                for inst in reservation['Instances']:
                    f.write(f"ID: {inst['InstanceId']} | Estado: {inst['State']['Name']} | Tipo: {inst['InstanceType']}\n")
            
            # Listar Buckets S3
            f.write("\n--- Buckets S3 ---\n")
            buckets = s3_client.list_buckets()
            for bucket in buckets['Buckets']:
                f.write(f"Nombre: {bucket['Name']}\n")

        print(f"Reporte generado localmente: {nombre_archivo}")

        # Subir el reporte al S3
        bucket_destino = "reportes-anthill-devops" 
        
        print(f"Subiendo a S3 bucket: {bucket_destino}...")
        s3_client.upload_file(nombre_archivo, bucket_destino, nombre_archivo)
        print("Reporte subido con éxito!")

    except Exception as e:
        print(f"❌ Error durante la automatización: {e}")

if __name__ == "__main__":
    generar_reporte()