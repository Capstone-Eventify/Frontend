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
                // Checkout the branch that triggered the pipeline
                checkout scm
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
                sh """
                    echo "Deploying to Dev Server: ${DEV_SERVER}"
                    # Add your deployment commands here
                    # scp -r .next package.json ec2-user@${DEV_SERVER}:/path/to/app/
                    # ssh ec2-user@${DEV_SERVER} 'cd /path/to/app && npm install --production && pm2 restart app'
                """
            }
        }
        
        stage('Deploy to QA') {
            when { 
                branch 'QA' 
            }
            steps {
                sh """
                    echo "Deploying to QA Server: ${QA_SERVER}"
                    # Add your deployment commands here
                """
            }
        }
        
        stage('Deploy to Production') {
            when { 
                branch 'main' 
            }
            steps {
                sh """
                    echo "Deploying to Production Server: ${PROD_SERVER}"
                    # Add your deployment commands here
                """
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
        always {
            echo "Build finished for branch: ${env.BRANCH_NAME}"
        }
    }
}
