# AntHill — Infraestructura y Despliegue

> Documentación sobre la arquitectura de contenedores, infraestructura en AWS y automatización del proyecto AntHill.

---

## Arquitectura General

El proyecto sigue una **arquitectura de microservicios** donde cada servicio corre en su propio contenedor Docker. La comunicación entre servicios se realiza a través de la red interna que crea Docker Compose, y la infraestructura en la nube se gestiona con **AWS CloudFormation**.

```
AntHill/
├── microservices/
│   ├── auth/            ← Servicio de autenticación (Docker)
│   ├── posts/           ← Servicio de publicaciones (Docker)
│   └── welcome/         ← Notificación de bienvenida (AWS Lambda)
├── infrastructure/
│   └── template.yaml    ← CloudFormation (VPC, EC2, S3, DynamoDB)
├── scripts/
│   └── boto3/
│       └── automatizacion.py  ← Script de reportes automatizados
└── docker-compose.yml   ← Orquestación de contenedores
```

---

## Docker

### Servicios Containerizados

Cada microservicio que corre en Docker tiene su propio `Dockerfile` dentro de su directorio.

| Servicio | Puerto | Imagen Base | Ruta |
|----------|--------|-------------|------|
| **auth-service** | `5001` | `python:3.9-slim` | `microservices/auth/` |
| **posts-service** | `5002` | `python:3.9-slim` | `microservices/posts/` |

### Dockerfiles

Ambos servicios usan una imagen liviana de Python 3.9. Ejemplo (`microservices/auth/Dockerfile`):

```dockerfile
# imagen liviana
FROM python:3.9-slim
WORKDIR /app

# contenedor vivo
CMD ["python3", "-m", "http.server", "5001"]

EXPOSE 5001
```

> **Nota:** Actualmente los servicios exponen un servidor HTTP básico. Conforme se desarrolle la lógica en `app.py`, se deberá actualizar el `CMD` para correr la aplicación real (por ejemplo con Flask/FastAPI).

---

## Docker Compose

El archivo `docker-compose.yml` orquesta ambos contenedores y define la red interna entre ellos.

```yaml
version: '3.8'
services:
  auth-service:
    build: ./microservices/auth
    ports:
      - "5001:5001"
    environment:
      - APP_ENV=development

  posts-service:
    build: ./microservices/posts
    ports:
      - "5002:5002"
    environment:
      - AUTH_SERVICE_URL=http://auth-service:5001
    depends_on:
      - auth-service
```

### Conceptos clave

- **`depends_on`**: Garantiza que `auth-service` arranca antes que `posts-service`.
- **Red interna de Docker**: Los servicios se comunican entre sí usando el **nombre del servicio** como hostname (ej. `http://auth-service:5001`), sin necesidad de exponer puertos al exterior para la comunicación interna.
- **Variables de entorno**: `AUTH_SERVICE_URL` le indica al servicio de posts dónde encontrar al servicio de auth dentro de la red de Docker.

### Comandos útiles

```bash
# Construir y levantar todos los servicios
docker-compose up --build

# Levantar en segundo plano (detached)
docker-compose up --build -d

# Ver logs en tiempo real
docker-compose logs -f

# Detener todos los servicios
docker-compose down

# Reconstruir un servicio específico
docker-compose build auth-service

# Ver el estado de los contenedores
docker-compose ps
```

---

## Infraestructura AWS

El archivo `infrastructure/template.yaml` define toda la infraestructura en AWS como **Infrastructure as Code (IaC)** usando CloudFormation.

### Recursos desplegados

| Recurso | Tipo AWS | Descripción |
|---------|----------|-------------|
| **AntHill-VPC** | `AWS::EC2::VPC` | Red virtual privada (`10.0.0.0/16`) |
| **Internet Gateway** | `AWS::EC2::InternetGateway` | Salida a internet para la VPC |
| **Subred Pública** | `AWS::EC2::Subnet` | Subred `10.0.1.0/24` con IP pública automática |
| **Tabla de Rutas** | `AWS::EC2::RouteTable` | Enrutamiento del tráfico hacia el Internet Gateway |
| **Security Group** | `AWS::EC2::SecurityGroup` | Permite tráfico HTTP (80) y puertos de microservicios (5001-5002) |
| **AntHill-Web-Server** | `AWS::EC2::Instance` | Instancia `t2.micro` con Amazon Linux 2 |
| **Bucket S3** | `AWS::S3::Bucket` | Almacenamiento de reportes con versionado habilitado |
| **DynamoDB** | `AWS::DynamoDB::Table` | Tabla `AntHill-Posts` (clave: `PostId`, modo PAY_PER_REQUEST) |

### Diagrama de red

```
Internet
    │
    ▼
┌──────────────────────────────────────────┐
│  VPC (10.0.0.0/16)                       │
│  ┌─────────────────────────────────────┐ │
│  │  Subred Pública (10.0.1.0/24)       │ │
│  │  ┌───────────────────────────┐      │ │
│  │  │  EC2 (t2.micro)           │      │ │
│  │  │  ┌─────────┐ ┌─────────┐ │      │ │
│  │  │  │ Auth    │ │ Posts   │ │      │ │
│  │  │  │ :5001   │ │ :5002   │ │      │ │
│  │  │  └─────────┘ └─────────┘ │      │ │
│  │  └───────────────────────────┘      │ │
│  └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
         │                    │
    ┌────┘                    └────┐
    ▼                              ▼
┌─────────┐                ┌──────────────┐
│  S3     │                │  DynamoDB    │
│ Reportes│                │ AntHill-Posts│
└─────────┘                └──────────────┘
```

### Desplegar la infraestructura

```bash
# Validar el template
aws cloudformation validate-template \
  --template-body file://infrastructure/template.yaml

# Crear el stack
aws cloudformation create-stack \
  --stack-name AntHill-Infra \
  --template-body file://infrastructure/template.yaml \
  --capabilities CAPABILITY_IAM

# Ver el estado del stack
aws cloudformation describe-stacks --stack-name AntHill-Infra

# Eliminar el stack
aws cloudformation delete-stack --stack-name AntHill-Infra
```

### Outputs

Al desplegarse correctamente, CloudFormation retorna:

| Output | Descripción |
|--------|-------------|
| `InstancePublicIP` | IP pública de la instancia EC2 |
| `BucketName` | Nombre del bucket S3 de reportes |

---

## AWS Lambda (Welcome Service)

El microservicio `welcome` está diseñado para correr como una **función Lambda** (serverless), a diferencia de los otros servicios que corren en contenedores Docker.

Se encuentra en `microservices/welcome/handler.py` y retorna un mensaje de bienvenida aleatorio con formato JSON.

```python
# Ejemplo de respuesta
{
    "notificacion": "¡Bienvenido a AntHill! Gracias por unirte.",
    "timestamp": "2026-04-10"
}
```

> Para consumir esta Lambda desde el frontend, se debe configurar un **API Gateway** que exponga la función como endpoint HTTP.

---

## 🤖 Automatización con Boto3

El script `scripts/boto3/automatizacion.py` genera reportes automáticos de la infraestructura y los sube a S3.

### ¿Qué hace?

1. Se conecta a AWS usando las credenciales del entorno (pensado para correr desde Jenkins).
2. Lista todas las instancias EC2 (ID, estado, tipo).
3. Lista todos los buckets S3.
4. Genera un archivo `.txt` con el reporte.
5. Sube el reporte al bucket `reportes-anthill-devops`.

### Ejecutar manualmente

```bash
# Asegurar que las variables de entorno de AWS están configuradas
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...

# Ejecutar
python scripts/boto3/automatizacion.py
```

### Integración con Jenkins

Este script está diseñado para ejecutarse dentro de un pipeline de CI/CD. Las credenciales las toma de las variables de entorno que Jenkins inyecta automáticamente.

---

## 🚀 Flujo de Despliegue Completo

```
1. Desarrollador hace push al repositorio
                │
                ▼
2. Jenkins detecta el cambio (webhook/polling)
                │
                ▼
3. CloudFormation despliega/actualiza la infraestructura
   (VPC, EC2, S3, DynamoDB)
                │
                ▼
4. Docker Compose construye y levanta los contenedores
   en la instancia EC2
                │
                ▼
5. Lambda se despliega de forma independiente (serverless)
                │
                ▼
6. Boto3 genera un reporte de la infraestructura
   y lo sube a S3
```

---

## Requisitos Previos

| Herramienta | Versión mínima | Necesaria para |
|-------------|----------------|----------------|
| **Docker** | 20.x+ | Contenedores de microservicios |
| **Docker Compose** | 2.x+ | Orquestación local |
| **AWS CLI** | 2.x+ | Despliegue de CloudFormation |
| **Python** | 3.9+ | Scripts de automatización y Lambdas |
| **Boto3** | 1.26+ | Script de reportes |

---

## Notas Importantes

- Los `Dockerfile` actuales usan `http.server` como placeholder. Cuando se desarrolle la lógica de cada microservicio en `app.py`, actualizar el `CMD` correspondiente.
- El Security Group permite tráfico abierto (`0.0.0.0/0`) en los puertos 80 y 5001-5002. **Restringir en producción**.
- La AMI `ami-0c101f26f147fa7fd` es específica de la región `us-east-1`. Si se cambia de región, actualizar este valor.
- El bucket S3 del template usa `${AWS::AccountId}` en el nombre para garantizar unicidad global.
