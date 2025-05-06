pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'sukanth0021/portfolio'  // Your Docker Hub username/repo
        DOCKER_TAG = "${env.BUILD_ID}"
        DOCKER_CREDENTIALS_ID = 'docker-hub-sukanth' // Your Jenkins Docker Hub credentials
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
                '''
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    # Create test results directory
                    mkdir -p test-results
                    
                    # Run tests with JUnit reporting
                    CI=true npm test -- --watchAll=false --ci --reporters=default --reporters=jest-junit
                    
                    # Verify JUnit file exists
                    ls -la test-results/ || echo "Test results directory not found"
                '''
            }
            post {
                always {
                    junit 'test-results/junit.xml' 
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
                expression { currentBuild.resultIsBetterOrEqualTo('UNSTABLE') }
            }
            steps {
                sh 'npm run build'
                archiveArtifacts artifacts: 'build/**/*', fingerprint: true
            }
        }

        stage('Build Docker Image') {
            when {
                expression { currentBuild.resultIsBetterOrEqualTo('UNSTABLE') }
            }
            steps {
                script {
                    // Create Dockerfile if it doesn't exist
                    if (!fileExists('Dockerfile')) {
                        writeFile file: 'Dockerfile', text: """
                        FROM node:18-alpine as builder
                        WORKDIR /app
                        COPY package*.json ./
                        RUN npm install --legacy-peer-deps
                        COPY . .
                        RUN npm run build

                        FROM nginx:alpine
                        COPY --from=builder /app/build /usr/share/nginx/html
                        EXPOSE 80
                        CMD ["nginx", "-g", "daemon off;"]
                        """
                    }
                    
                    // Build and push Docker image
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS_ID) {
                        dockerImage = docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                        dockerImage.push()
                        dockerImage.push('latest')
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                if(currentBuild.result == 'SUCCESS') {
                    echo """
                    Pipeline succeeded!
                    Docker Image: ${DOCKER_IMAGE}:${DOCKER_TAG}
                    Build URL: ${env.BUILD_URL}
                    """
                } else {
                    echo """
                    Pipeline failed!
                    Build URL: ${env.BUILD_URL}console
                    """
                }
            }
            cleanWs()
        }
    }
}
