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
                sh 'npm ci'
            }
        }
        
        stage('Deploy to Development') {
            when { branch 'staging' }
            steps {
                echo "Deploying to Development environment"
                script {
                    deployToEnvironment('dev', env.DEV_SERVER, 'dev-server-key', env.BRANCH_NAME)
                }
            }
        }
        
        stage('Deploy to QA') {
            when { branch 'QA' }
            steps {
                echo "Deploying to QA environment"
                script {
                    deployToEnvironment('qa', env.QA_SERVER, 'qa-server-key', env.BRANCH_NAME)
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
                    deployToEnvironment('prod', env.PROD_SERVER, 'prod-server-key', env.BRANCH_NAME)
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
    }
}

def deployToEnvironment(String envName, String server, String credentials, String branchName) {
    echo "Deploying to ${envName.toUpperCase()} on ${server}"
    
    sshagent([credentials]) {
        sh """
            ssh -o StrictHostKeyChecking=no ec2-user@${server} '
                echo "Connected to \$(hostname)"
                cd /opt/eventify/${envName}
                
                # Stop existing processes
                pm2 stop ecosystem.config.js || echo "No processes to stop"
                
                # Clone or update repository
                if [ -d "frontend" ]; then
                    cd frontend
                    git fetch origin
                    git reset --hard origin/${branchName}
                else
                    git clone -b ${branchName} https://github.com/Capstone-Eventify/Frontend.git frontend
                    cd frontend
                fi
                
                # Install dependencies
                npm ci
                
                # Return to parent directory and start PM2
                cd ..
                pm2 start ecosystem.config.js
                pm2 save
                
                # Wait and verify
                sleep 5
                pm2 status
                
                echo "✅ Deployment to ${envName} completed"
            '
        """
    }
}
