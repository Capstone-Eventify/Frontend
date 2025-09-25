pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-22'
    }
    
    stages {
        stage('Test') {
            steps {
                echo "Hello World"
                echo "Branch: ${env.BRANCH_NAME}"
                sh 'node --version'
                sh 'npm --version'
            }
        }
        
        stage('Checkout') {
            steps {
                echo "Checking out code"
                checkout scm
            }
        }
        
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
    }
    
    post {
        always {
            echo "Pipeline completed"
        }
    }
}
