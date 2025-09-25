pipeline {
    agent any
    
    environment {
        DEV_SERVER = '13.59.240.130'
        QA_SERVER = '13.58.2.162'  
        PROD_SERVER = '18.117.193.239'
    }
    
    tools {
        nodejs 'NodeJS-22'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo "Checking out branch: ${env.BRANCH_NAME}"
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
        
        stage('Deploy to Development') {
            when { branch 'staging' }
            steps {
                echo "Deploying to Development server"
                script {
                    deployToEnvironment('dev', env.DEV_SERVER, 'dev-server-key')
                }
            }
        }
        
        stage('Deploy to QA') {
            when { branch 'QA' }
            steps {
                echo "Deploying to QA server"
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
                echo "Deploying to Production server"
                script {
                    deployToEnvironment('prod', env.PROD_SERVER, 'prod-server-key')
                }
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

def deployToEnvironment(String env, String server, String credentials) {
    echo "Deploying to ${env.toUpperCase()} environment on ${server}"
    
    sshagent([credentials]) {
        sh """
            ssh -o StrictHostKeyChecking=no ec2-user@${server} '
                echo "Connected to \$(hostname)"
                cd /opt/eventify/${env}
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
    
    echo "Deployment to ${env.toUpperCase()} completed"
}
