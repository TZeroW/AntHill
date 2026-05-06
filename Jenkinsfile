pipeline {
    agent any

    environment {
        AWS_ACCESS_KEY_ID     = credentials('aws-access-key')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-key')
        AWS_SESSION_TOKEN     = credentials('aws-session-token')
        AWS_DEFAULT_REGION    = 'us-east-1'
        AWS_BIN = 'aws'
        STACK_NAME = 'anthill-stack'
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
                    ${AWS_BIN} cloudformation deploy \
                    --template-file infrastructure/template.yaml \
                    --stack-name ${STACK_NAME} \
                    --region ${AWS_DEFAULT_REGION} || true
                """
            }
        }

        stage('Reporte de Auditoría (Boto3)') {
            steps {
                sh 'echo "Corriendo script de automatización..."'
                sh """
                    export BUCKET_NAME=\$(${AWS_BIN} cloudformation describe-stacks \
                        --stack-name ${STACK_NAME} \
                        --query "Stacks[0].Outputs[?OutputKey=='ReportsBucketName'].OutputValue" \
                        --output text \
                        --region ${AWS_DEFAULT_REGION})
                    
                    python3 -m venv venv
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
