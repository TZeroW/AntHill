import boto3
import os

def listar_recursos():
    s3 = boto3.client('s3')
    response = s3.list_buckets()
    print("Buckets encontrados:")
    for bucket in response['Buckets']:
        print(f"  - {bucket['Name']}")

if __name__ == "__main__":
    listar_recursos()