pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-22'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo "Checking out branch: ${env.BRANCH_NAME}"
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                    echo "Building commit: ${env.GIT_COMMIT_SHORT}"
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Deploy to Development') {
            when { 
                branch 'staging'
            }
            steps {
                echo "Deploying to Development server"
                deployToDev()
            }
        }
        
        stage('Deploy to QA') {
            when { 
                branch 'QA'
            }
            steps {
                echo "Deploying to QA server"
                deployToQA()
            }
        }
        
        stage('Production Approval') {
            when { 
                branch 'main'
            }
            steps {
                input message: 'Deploy to Production?', ok: 'Deploy'
            }
        }
        
        stage('Deploy to Production') {
            when { 
                branch 'main'
            }
            steps {
                echo "Deploying to Production server"
                deployToProd()
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo "Pipeline completed successfully for branch: ${env.BRANCH_NAME}"
        }
        failure {
            echo "Pipeline failed for branch: ${env.BRANCH_NAME}"
        }
    }
}

def deployToDev() {
    withCredentials([sshUserPrivateKey(credentialsId: 'dev-server-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
        sh """
            ssh -o StrictHostKeyChecking=no -i \${SSH_KEY} \${SSH_USER}@13.59.240.130 '
                echo "Connected to \$(hostname)"
                cd /opt/eventify/dev
                pm2 stop ecosystem.config.js || echo "No processes to stop"
                
                cd frontend
                git fetch origin
                git reset --hard origin/${env.BRANCH_NAME}
                npm ci
                
                cd ..
                pm2 start ecosystem.config.js
                sleep 5
                pm2 status
            '
        """
    }
}

def deployToQA() {
    withCredentials([sshUserPrivateKey(credentialsId: 'qa-server-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
        sh """
            ssh -o StrictHostKeyChecking=no -i \${SSH_KEY} \${SSH_USER}@13.58.2.162 '
                echo "Connected to \$(hostname)"
                cd /opt/eventify/qa
                pm2 stop ecosystem.config.js || echo "No processes to stop"
                
                cd frontend
                git fetch origin
                git reset --hard origin/${env.BRANCH_NAME}
                npm ci
                
                cd ..
                pm2 start ecosystem.config.js
                sleep 5
                pm2 status
            '
        """
    }
}

def deployToProd() {
    withCredentials([sshUserPrivateKey(credentialsId: 'prod-server-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
        sh """
            ssh -o StrictHostKeyChecking=no -i \${SSH_KEY} \${SSH_USER}@18.117.193.239 '
                echo "Connected to \$(hostname)"
                cd /opt/eventify/prod
                pm2 stop ecosystem.config.js || echo "No processes to stop"
                
                cd frontend
                git fetch origin
                git reset --hard origin/${env.BRANCH_NAME}
                npm ci
                
                cd ..
                pm2 start ecosystem.config.js
                sleep 5
                pm2 status
            '
        """
    }
}
