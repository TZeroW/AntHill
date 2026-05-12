# AntHill

> Plataforma social tipo comunidad para publicar contenido por colonias, interactuar con otros usuarios y administrar perfiles desde una interfaz web construida en Next.js y conectada a microservicios en Python.

## Qué hace la aplicación

AntHill funciona como una red social interna donde los usuarios pueden registrarse, iniciar sesión, crear publicaciones, comentar, dar like, repostear, explorar colonias y revisar su propio perfil. La interfaz principal vive en Next.js y actúa como capa de presentación; la lógica de negocio y persistencia se reparte entre microservicios especializados.

La página web no es solo una vista estática: consume datos reales de los microservicios, mantiene la sesión del usuario en localStorage y sincroniza el feed, el perfil y las colonias con el backend.

## Arquitectura general

El proyecto está organizado en tres capas principales:

1. Frontend en Next.js, encargado de renderizar las páginas, manejar la navegación y consumir la API.
2. Microservicio de autenticación, responsable de registro, login y actualización de perfil.
3. Microservicio de publicaciones, responsable de posts, comentarios, likes, reposts y colonias.

```text
AntHill/
├── app/                   # Páginas de Next.js
├── components/            # Componentes reutilizables de UI
├── lib/                   # Cliente API y hooks de estado
├── microservices/
│   ├── auth/              # Servicio de autenticación en Flask
│   └── posts/             # Servicio de publicaciones en Flask
├── infrastructure/        # Infraestructura como código con CloudFormation
├── scripts/               # Automatizaciones y utilidades
└── docker-compose.yml     # Orquestación local de servicios
```

## Función de la página

La interfaz web centraliza la experiencia del usuario:

- La ruta principal muestra el feed general o el feed filtrado por colonia.
- Login y registro conectan con el servicio de autenticación.
- Perfil muestra publicaciones propias, likes y reposts.
- Settings permite editar información del usuario.
- Explore permite descubrir colonias.
- Post detail muestra el contenido y sus interacciones.

En resumen, la página es el cliente visual de todo el sistema: renderiza la experiencia, pero delega los datos y la lógica de negocio a los microservicios.

## Cómo se mezcla con los microservicios

Next.js no llama directamente a las bases de datos. En su lugar, usa una capa de API centralizada en [lib/api.ts](lib/api.ts), y esa capa apunta a rutas internas como /api/auth y /api/posts. Luego, [next.config.ts](next.config.ts) reescribe esas rutas hacia los microservicios reales:

- /api/auth/* → auth-service en el puerto 5001
- /api/posts/* → posts-service en el puerto 5002
- /api/colonias/* → posts-service en el puerto 5002

Esto evita problemas de CORS y mantiene al frontend desacoplado de las URLs físicas del backend.

### Flujo de datos

1. El usuario interactúa con una página de Next.js.
2. Los hooks de [lib/hooks/useAuth.ts](lib/hooks/useAuth.ts) y [lib/hooks/usePosts.ts](lib/hooks/usePosts.ts) llaman a [lib/api.ts](lib/api.ts).
3. Next.js reescribe la petición hacia el microservicio correspondiente.
4. El microservicio responde con JSON.
5. El frontend actualiza el estado de React y la UI se refresca.

## Páginas principales

### Autenticación

- [app/(auth)/login/page.tsx](app/%28auth%29/login/page.tsx): inicia sesión y guarda la sesión en localStorage.
- [app/(auth)/register/page.tsx](app/%28auth%29/register/page.tsx): registra nuevos usuarios.

### Área principal

- [app/(main)/page.tsx](app/%28main%29/page.tsx): feed general y por colonia, creación, edición, búsqueda y eliminación de posts.
- [app/(main)/profile/page.tsx](app/%28main%29/profile/page.tsx): publicaciones del usuario, likes y reposts.
- [app/(main)/settings/page.tsx](app/%28main%29/settings/page.tsx): edición de perfil.
- [app/(main)/explore/page.tsx](app/%28main%29/explore/page.tsx): exploración de colonias.
- [app/(main)/post/[id]/page.tsx](app/%28main%29/post/%5Bid%5D/page.tsx): vista detallada de un post.

## Microservicios

### auth-service

Ubicado en [microservices/auth/app.py](microservices/auth/app.py), expone endpoints para registro, login, consulta de usuario y actualización de perfil. Usa SQLite para persistencia local y devuelve información de usuario sin exponer contraseñas.

### posts-service

Ubicado en [microservices/posts/app.py](microservices/posts/app.py), maneja posts, comentarios, likes, reposts y colonias. También usa SQLite y conserva el historial local de contenido e interacciones.

## Integración técnica del frontend

El frontend usa hooks para separar la UI del acceso a datos:

- [useAuth](lib/hooks/useAuth.ts) carga, guarda y actualiza la sesión.
- [usePosts](lib/hooks/usePosts.ts) carga feeds, crea posts y gestiona ediciones/eliminaciones.

Además, el cliente de API centraliza las rutas y evita repetir lógica de fetch en cada componente.

## Desarrollo local

### Requisitos

- Node.js
- Python 3.9 o superior para los microservicios
- Docker y Docker Compose

### Frontend

```bash
npm install
npm run dev
```

### Microservicios con Docker

```bash
docker compose up --build
```

### Variables de entorno útiles

- NEXT_PUBLIC_AUTH_API: URL base del microservicio de auth
- NEXT_PUBLIC_POSTS_API: URL base del microservicio de posts
- AUTH_DB_PATH: ruta de la base SQLite de auth
- POSTS_DB_PATH: ruta de la base SQLite de posts

## Docker Compose

El archivo [docker-compose.yml](docker-compose.yml) levanta los servicios de auth y posts, define sus puertos y monta volúmenes locales para persistir los datos de SQLite.

### Servicios expuestos

| Servicio | Puerto | Responsabilidad |
|----------|--------|-----------------|
| auth-service | 5001 | Registro, login y perfil |
| posts-service | 5002 | Posts, comentarios, likes, reposts y colonias |

## Infraestructura AWS

El archivo [infrastructure/template.yaml](infrastructure/template.yaml) define la infraestructura como código con CloudFormation.



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

## Automatización

El script [scripts/boto3/automatizacion.py](scripts/boto3/automatizacion.py) genera reportes de infraestructura y los sube a S3. Está pensado para ejecutarse como parte de un pipeline de CI/CD.

## Despliegue

El flujo general del proyecto es este:

1. Se realiza un push al repositorio.
2. Jenkins detecta el cambio.
3. CloudFormation actualiza la infraestructura.
4. Docker Compose levanta los microservicios.
5. Next.js consume la API reescrita hacia esos servicios.
6. Las automatizaciones generan reportes y los publican en S3.

## Notas

- La sesión del usuario se mantiene en localStorage con la key anthill_user.
- El frontend trabaja con URLs relativas para que el proxy de Next resuelva el backend correcto.
- Las imágenes y estilos están organizados en public/ y app/styles/ para mantener la interfaz separada de la lógica.

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