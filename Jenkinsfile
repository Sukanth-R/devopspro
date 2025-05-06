pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'sukanth0021/portfolio'
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
                    # Install with legacy peer deps for React 19 compatibility
                    npm install --legacy-peer-deps
                    
                    # Install test dependencies explicitly
                    npm install --save-dev --legacy-peer-deps \
                        @testing-library/react@^14.0.0 \
                        @testing-library/jest-dom@^6.0.0 \
                        @testing-library/user-event@^14.0.0 \
                        @babel/plugin-proposal-private-property-in-object@^7.21.0 \
                        jest-environment-jsdom@^29.0.0 \
                        jest-junit@^15.0.0
                    
                    # Verify installations
                    npm list @testing-library/react @testing-library/jest-dom
                '''
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    # Run tests with JUnit output
                    npm test -- --watchAll=false --detectOpenHandles --ci --reporters=default --reporters=jest-junit
                    
                    # Generate coverage reports
                    npm test -- --coverage --watchAll=false
                '''
            }
            post {
                always {
                    junit 'junit.xml'  // Default output location for jest-junit
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
            when {
                expression { 
                    // Only build if tests passed or were skipped
                    currentBuild.resultIsBetterOrEqualTo('UNSTABLE') 
                }
            }
            steps {
                sh 'npm run build'
                archiveArtifacts artifacts: 'build/**/*', fingerprint: true
            }
        }

        stage('Build Docker Image') {
            when {
                expression { 
                    currentBuild.resultIsBetterOrEqualTo('UNSTABLE') 
                }
            }
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
            when {
                expression { 
                    currentBuild.resultIsBetterOrEqualTo('UNSTABLE') 
                }
            }
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
        always {
            // Simple console output instead of email/slack
            script {
                if(currentBuild.result == 'SUCCESS') {
                    echo "Pipeline succeeded! Build URL: ${env.BUILD_URL}"
                } else {
                    echo "Pipeline failed! Build URL: ${env.BUILD_URL}console"
                }
            }
            cleanWs()
        }
    }
}
