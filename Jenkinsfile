pipeline {
    agent any
    
    environment {
        DEV_SERVER = '13.59.240.130'
        QA_SERVER = '13.58.2.162'  
        PROD_SERVER = '18.117.193.239'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Deploy to Development') {
            when { branch 'staging' }
            steps {
                script {
                    deployToEnvironment('dev', env.DEV_SERVER, 'dev-server-key')
                }
            }
        }
        
        stage('Deploy to QA') {
            when { branch 'QA' }
            steps {
                script {
                    deployToEnvironment('qa', env.QA_SERVER, 'qa-server-key')
                }
            }
        }
        
        stage('Production Approval') {
            when { branch 'main' }
            steps {
                input message: 'Deploy to Production?', ok: 'Deploy'
            }
        }
        
        stage('Deploy to Production') {
            when { branch 'main' }
            steps {
                script {
                    deployToEnvironment('prod', env.PROD_SERVER, 'prod-server-key')
                }
            }
        }
    }
    
    post {
        success {
            echo "Deployment completed successfully for branch: ${env.BRANCH_NAME}"
        }
        failure {
            echo "Deployment failed for branch: ${env.BRANCH_NAME}"
        }
    }
}

def deployToEnvironment(String envName, String server, String credentials) {
    sshagent([credentials]) {
        sh """
            ssh -o StrictHostKeyChecking=no ec2-user@${server} '
                cd /opt/eventify/${envName}
                pm2 stop ecosystem.config.js || echo "No processes to stop"
                cd frontend
                git fetch origin
                git reset --hard origin/${env.BRANCH_NAME}
                npm ci
                cd ..
                pm2 start ecosystem.config.js
                pm2 status
            '
        """
    }
}
