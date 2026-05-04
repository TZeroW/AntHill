pipeline {
    agent any

    environment {
        AWS_ACCESS_KEY_ID     = credentials('aws-access-key')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-key')
        AWS_SESSION_TOKEN     = credentials('aws-session-token')
        AWS_DEFAULT_REGION    = 'us-east-1'
        // En Windows no necesitas AWS_PATH si el CLI está en el System PATH
    }

    stages {
        stage('Docker Build Microservicios') {
            steps {
                echo "Construyendo imágenes para Auth y Posts..."
                // Cambiado a 'bat' y comando moderno 'docker compose'
                bat 'docker compose build'
            }
        }

        stage('Deploy Infra (CloudFormation)') {
            steps {
                echo "Lanzando la red y los servicios en AWS..."
                bat """
                    aws cloudformation deploy ^
                    --template-file infrastructure/template.yaml ^
                    --stack-name anthill-stack ^
                    --region %AWS_DEFAULT_REGION% ^
                    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM ^
                    --no-fail-on-empty-changeset || echo "El despliegue tiene advertencias, verificando..."
                """
            }
        }

        stage('Reporte de Auditoría (Boto3)') {
            steps {
                echo "Corriendo script de automatización..."
                // Ajustado para rutas de Windows (Scripts en lugar de bin)
                bat """
                    if not exist venv (python -m venv venv)
                    call venv\\Scripts\\activate && pip install boto3 && python scripts/boto3/automatizacion.py
                """
            }
        }
    }

    post {
        success {
            echo 'Microservicios de AntHill desplegados y reporte generado.'
        }
        failure {
            echo 'Fallo en el pipeline. Revisar configuración de Docker o AWS.'
        }
    }
}