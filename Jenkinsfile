pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'sukianth0021/my-react-app'
        DOCKER_CREDENTIALS_ID = 'docker-hub-creds' // Set this in Jenkins credentials
    }

    stages {
        stage('Clone Repo') {
            steps {
                git 'https://github.com/Sukanth-R/devopspro.git'
            }
        }

        stage('Install & Test') {
            steps {
                sh 'npm install'
                sh 'npm run test' // optional
            }
        }

        stage('Build React App') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build(DOCKER_IMAGE)
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS_ID) {
                        dockerImage.push('latest')
                    }
                }
            }
        }

        stage('Deploy (Optional)') {
            steps {
                sh 'echo "Deploy logic here - e.g., SSH into server and run docker pull + run"'
            }
        }
    }
}
