pipeline {
    agent any

    environment {
        AWS_ACCESS_KEY_ID     = credentials('aws-access-key')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-key')
        AWS_SESSION_TOKEN     = credentials('aws-session-token')
        AWS_DEFAULT_REGION    = 'us-east-1'
        AWS_PATH = '/home/salmule/.local/bin/aws'
    }

    stages {

        stage('Docker Build Microservicios') {
            steps {
                sh 'echo "Construyendo imágenes para Auth y Posts..."'
                sh 'docker-compose build'
            }
        }

        stage('Deploy Infra (CloudFormation)') {
            steps {
                sh 'echo "Lanzando la red y los servicios en AWS..."'
                sh """
                    ${AWS_PATH} cloudformation deploy \
                    --template-file infrastructure/template.yaml \
                    --stack-name anthill-stack \
                    --region ${AWS_DEFAULT_REGION} || true
                """
            }
        }

        stage('Reporte de Auditoría (Boto3)') {
            steps {
                script {
                    // Calculamos el ID de cuenta para pasárselo al script de Python
                    def accountId = sh(script: "${AWS_PATH} sts get-caller-identity --query Account --output text", returnStdout: true).trim()
                    env.BUCKET_NAME = "reportes-anthill-devops-${accountId}"
                }
                sh 'echo "Corriendo script de automatización..."'
                sh """
                    python3 -m venv venv || true
                    ./venv/bin/pip install boto3
                    ./venv/bin/python3 scripts/boto3/automatizacion.py
                """
            }
        }
    }

    post {
        success {
            echo 'Microservicios de AntHill desplegados y reporte generado.'
        }
        failure {
            echo 'Fallo en el pipeline. Revisar el error de Git o S3.'
        }
    }
}
