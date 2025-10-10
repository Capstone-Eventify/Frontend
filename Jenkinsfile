pipeline {
    agent any
    
    environment {
        DEV_SERVER = '13.59.240.130'
        QA_SERVER = '13.58.2.162'  
        PROD_SERVER = '18.117.193.239'
        SSH_TIMEOUT = '600' // 10 minutes timeout
        
        // SSH Credential IDs
        DEV_CREDENTIALS = 'dev-server-key'
        QA_CREDENTIALS = 'qa-server-key'
        PROD_CREDENTIALS = 'prod-server-key'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo "Building branch: ${env.BRANCH_NAME}"
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                    echo "Commit: ${env.GIT_COMMIT_SHORT}"
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Deploy to Development') {
            when { branch 'staging' }
            steps {
                echo "Deploying to Development environment"
                script {
                    deployToEnvironment('dev', env.DEV_SERVER, env.DEV_CREDENTIALS, env.BRANCH_NAME)
                }
            }
        }
        
        stage('Deploy to QA') {
            when { branch 'QA' }
            steps {
                echo "Deploying to QA environment"
                script {
                    deployToEnvironment('qa', env.QA_SERVER, env.QA_CREDENTIALS, env.BRANCH_NAME)
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
                echo "Deploying to Production environment"
                script {
                    deployToEnvironment('prod', env.PROD_SERVER, env.PROD_CREDENTIALS, env.BRANCH_NAME)
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo "✅ Deployment completed successfully for branch: ${env.BRANCH_NAME}"
        }
        failure {
            echo "❌ Deployment failed for branch: ${env.BRANCH_NAME}"
        }
        aborted {
            echo "⚠️ Deployment was aborted for branch: ${env.BRANCH_NAME}"
        }
    }
}

def deployToEnvironment(String envName, String server, String credentials, String branchName) {
    echo "Deploying to ${envName.toUpperCase()} on ${server}"
    echo "Using credentials: ${credentials}"
    
    sshagent([credentials]) {
        try {
            sh """
                ssh -o StrictHostKeyChecking=no \
                    -o ConnectTimeout=30 \
                    -o ServerAliveInterval=60 \
                    ec2-user@${server} 'set -e && \
                    echo "=== Connected to \\$(hostname) ===" && \
                    echo "=== Deploying to ${envName} environment ===" && \
                    cd /opt/eventify/${envName} && \
                    echo "=== Stopping PM2 processes ===" && \
                    (pm2 stop ecosystem.config.js || echo "No processes to stop") && \
                    echo "=== Updating repository ===" && \
                    if [ -d "frontend" ]; then \
                        cd frontend && \
                        echo "Repository exists, updating..." && \
                        git fetch origin && \
                        git reset --hard origin/${branchName} && \
                        git clean -fd; \
                    else \
                        echo "Cloning repository..." && \
                        git clone -b ${branchName} https://github.com/Capstone-Eventify/Frontend.git frontend && \
                        cd frontend; \
                    fi && \
                    echo "=== Installing dependencies ===" && \
                    npm config set prefer-offline true && \
                    npm config set progress false && \
                    npm install --loglevel=error && \
                    echo "=== Starting PM2 processes ===" && \
                    cd .. && \
                    (pm2 delete ecosystem.config.js || echo "No processes to delete") && \
                    pm2 start ecosystem.config.js && \
                    pm2 save && \
                    echo "=== Waiting for processes to start ===" && \
                    sleep 5 && \
                    pm2 status && \
                    if pm2 list | grep -q "online"; then \
                        echo "✅ Deployment to ${envName} completed successfully"; \
                    else \
                        echo "❌ Processes are not running properly" && \
                        pm2 logs --err --lines 20 && \
                        exit 1; \
                    fi'
            """
        } catch (Exception e) {
            echo "❌ Deployment failed: ${e.getMessage()}"
            throw e
        }
    }
}
