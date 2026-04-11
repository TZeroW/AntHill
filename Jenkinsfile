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
        stage('Clonar Repo') {
            steps {
                git branch: 'main', url: 'https://github.com/SalmuleFish/AntHill.git'
            }
        }

        stage('Docker Build Microservicios') {
            steps {
                sh 'echo "Construyendo imágenes para Auth y Posts..."'
                // Usamos el docker-compose que creamos para buildear todo junto
                sh 'docker-compose build'
            }
        }

        stage('Deploy Infra (CloudFormation)') {
            steps {
                sh 'echo "Lanzando la red y los servicios en AWS..."'
                // Apuntamos a la carpeta de infraestructura
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
                sh 'echo "Corriendo script de automatización..."'
                sh """
                    python3 -m venv venv
                    ./venv/bin/pip install boto3
                    ./venv/bin/python3 scripts/boto3/automatizacion.py
                """
            }
        }
    }

    post {
        success {
            echo 'Microservicios de AntHill funcionando'
        }
        failure {
            echo 'Fallo en el pipeline.'
        }
    }
}
