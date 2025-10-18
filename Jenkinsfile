pipeline {
    agent any
    
    environment {
        DEV_SERVER = '3.22.99.0'
        QA_SERVER = '13.58.2.162'  
        PROD_SERVER = '18.117.193.239'
        EMAIL_TO = 'thilakediga321@gmail.com'  
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
            mail to: "${EMAIL_TO}",
                 subject: "✅ SUCCESS: ${env.JOB_NAME} [${env.BRANCH_NAME}] - Build #${env.BUILD_NUMBER}",
                 body: """Deployment successful!
                 
Job: ${env.JOB_NAME}
Branch: ${env.BRANCH_NAME}
Build Number: ${env.BUILD_NUMBER}
                 
View build: ${env.BUILD_URL}
Console output: ${env.BUILD_URL}console
"""
            slackSend(channel: '#jenkins-notify', message: """
✅ *Build Succeeded!* 🎉
*Job:* ${env.JOB_NAME}
*Branch:* ${env.BRANCH_NAME}
*Build Number:* #${env.BUILD_NUMBER}
<${env.BUILD_URL}|View build details>
""")
        }
        failure {
            echo "❌ Deployment failed"
            mail to: "${EMAIL_TO}",
                 subject: "❌ FAILED: ${env.JOB_NAME} [${env.BRANCH_NAME}] - Build #${env.BUILD_NUMBER}",
                 body: """Deployment failed!
                 
Job: ${env.JOB_NAME}
Branch: ${env.BRANCH_NAME}
Build Number: ${env.BUILD_NUMBER}

⚠️ Please check the console output for error details.
                 
View build: ${env.BUILD_URL}
Console output: ${env.BUILD_URL}console
"""
            slackSend(channel: '#jenkins-notify', message: """
❌ *Build Failed!*
*Job:* ${env.JOB_NAME}
*Branch:* ${env.BRANCH_NAME}
*Build Number:* #${env.BUILD_NUMBER}
⚠️ Please check the logs for details.
<${env.BUILD_URL}|View build details>
""")
        }
        unstable {
            slackSend(channel: '#jenkins-notify', message: """
⚠️ *Build Unstable!*
*Job:* ${env.JOB_NAME}
*Branch:* ${env.BRANCH_NAME}
*Build Number:* #${env.BUILD_NUMBER}
Some tests may have failed.
<${env.BUILD_URL}|View build details>
""")
        }
        notBuilt {
            slackSend(channel: '#jenkins-notify', message: """
🚫 *Build Not Executed!*
*Job:* ${env.JOB_NAME}
*Branch:* ${env.BRANCH_NAME}
*Build Number:* #${env.BUILD_NUMBER}
<${env.BUILD_URL}|View build details>
""")
        }
        aborted {
            slackSend(channel: '#jenkins-notify', message: """
🛑 *Build Aborted!*
*Job:* ${env.JOB_NAME}
*Branch:* ${env.BRANCH_NAME}
*Build Number:* #${env.BUILD_NUMBER}
<${env.BUILD_URL}|View build details>
""")
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