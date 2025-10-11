pipeline {
    agent any
    
    environment {
        DEV_SERVER = '3.22.99.0'  // Removed trailing space
        QA_SERVER = '13.58.2.162'  
        PROD_SERVER = '18.117.193.239'
    }

    
    stages {
        stage('Checkout') {
            steps {
                echo "Building branch: ${env.BRANCH_NAME}"
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Deploy to Dev') {
            when { branch 'staging' }
            steps {
                script {
                    deployToServer(env.DEV_SERVER, 'dev-server-key', 'dev')
                }
            }
        }
        
        stage('Deploy to QA') {
            when { branch 'QA' }
            steps {
                script {
                    deployToServer(env.QA_SERVER, 'qa-server-key', 'qa')
                }
            }
        }
        
        stage('Deploy to Production') {
            when { branch 'main' }
            steps {
                input message: 'Deploy to Production?', ok: 'Deploy'
                script {
                    deployToServer(env.PROD_SERVER, 'prod-server-key', 'prod')
                }
            }
        }
    }
    
    post {
        success {
            echo "✅ Deployment successful"
        }
        failure {
            echo "❌ Deployment failed"
        }
    }
}

def deployToServer(String server, String credentials, String env) {
    sshagent([credentials]) {
        sh """
            ssh -o StrictHostKeyChecking=no ec2-user@${server} '
                cd /opt/eventify/${env}
                
                # Only stop frontend
                pm2 stop eventify-${env}-frontend || true
                
                if [ -d frontend ]; then
                    cd frontend
                    git pull origin ${BRANCH_NAME}
                else
                    git clone -b ${BRANCH_NAME} https://github.com/Capstone-Eventify/Frontend.git frontend
                    cd frontend
                fi
                
                # Install dependencies with memory optimization
                npm install --prefer-offline --no-audit || {
                    echo "npm install failed, retrying..."
                    sleep 5
                    npm install --prefer-offline --no-audit
                }
                
                
                cd ..
                
                # Only start/restart frontend
                pm2 restart eventify-${env}-frontend || pm2 start ecosystem.config.js --only eventify-${env}-frontend
                pm2 save
                
                
                echo "✅ Frontend is running successfully"
                pm2 status
            '
        """
    }
}
