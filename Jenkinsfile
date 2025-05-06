pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'sukanth0021/my-react-app'
        DOCKER_TAG = "${env.BUILD_ID}"
        DOCKER_CREDENTIALS_ID = 'docker-hub-sukanth'
        CI = 'true'
        NODE_OPTIONS = '--max_old_space_size=4096'
    }

    stages {
        stage('Clone Repo') {
            steps {
                git branch: 'main',
                     url: 'https://github.com/Sukanth-R/devopspro.git',
                     credentialsId: ''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    npm install --legacy-peer-deps
                    npm install --save-dev --legacy-peer-deps \
                        @testing-library/react@^14.0.0 \
                        @testing-library/jest-dom@^6.0.0 \
                        @testing-library/user-event@^14.0.0 \
                        @babel/plugin-proposal-private-property-in-object@^7.21.0 \
                        jest-environment-jsdom@^29.0.0 \
                        jest-junit@^15.0.0
                '''
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    npm test -- --watchAll=false --detectOpenHandles --json --outputFile=test-results.json
                    npx jest-junit
                '''
            }
            post {
                always {
                    junit 'junit.xml'
                    publishHTML target: [
                        allowMissing: true,
                        reportDir: 'coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Test Coverage'
                    ]
                }
            }
        }

        stage('Build Project') {
            steps {
                sh 'npm run build'
                archiveArtifacts artifacts: 'build/**/*', fingerprint: true
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}", '''
                        --build-arg NODE_ENV=production 
                        --build-arg NEXT_PUBLIC_BASE_URL=${YOUR_BASE_URL}
                        .
                    ''')
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS_ID) {
                        dockerImage.push("${DOCKER_TAG}")
                        dockerImage.push('latest')
                    }
                }
            }
        }
    }

    post {
        success {
            mail to: 'team@example.com',
                 subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: "Build successful!\n${env.BUILD_URL}"
        }
        failure {
            mail to: 'team@example.com',
                 subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: "Build failed!\n${env.BUILD_URL}console"
        }
        always {
            cleanWs()
        }
    }
}
