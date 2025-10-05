pipeline {
    agent any
    
    environment {
        DEV_SERVER = '13.59.240.130'
        QA_SERVER = '13.58.2.162'  
        PROD_SERVER = '18.117.193.239'
    }
    
    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/Capstone-Eventify/Frontend.git'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Deploy to Dev') {
            when { 
                branch 'staging' 
            }
            steps {
                sh '''
                    echo "Deploying to Dev..."
                '''
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline completed!'
        }
    }
}
