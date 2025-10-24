pipeline {
    agent any
    
    environment {
        DEV_SERVER = '3.22.99.0'
        QA_SERVER = '13.58.2.162'  
        PROD_SERVER = '18.117.193.239'
        EMAIL_TO = 'thilakediga321@gmail.com'
        
        // These will be populated during checkout
        COMMIT_MSG = ''
        COMMIT_AUTHOR = ''
        COMMIT_HASH = ''
        COMMIT_EMAIL = ''
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "Building branch: ${env.BRANCH_NAME}"
                    checkout scm
                    
                    // Get commit information
                    env.COMMIT_MSG = sh(returnStdout: true, script: 'git log -1 --pretty=%B').trim()
                    env.COMMIT_AUTHOR = sh(returnStdout: true, script: 'git log -1 --pretty=%an').trim()
                    env.COMMIT_EMAIL = sh(returnStdout: true, script: 'git log -1 --pretty=%ae').trim()
                    env.COMMIT_HASH = sh(returnStdout: true, script: 'git log -1 --pretty=%h').trim()
                    env.COMMIT_HASH_FULL = sh(returnStdout: true, script: 'git log -1 --pretty=%H').trim()
                    
                    echo "Commit: ${env.COMMIT_MSG}"
                    echo "Author: ${env.COMMIT_AUTHOR}"
                    echo "Hash: ${env.COMMIT_HASH}"
                }
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
            script {
                def environment = getEnvironmentName(env.BRANCH_NAME)
                def duration = currentBuild.durationString.replace(' and counting', '')
                
                echo "✅ Deployment successful"
                
                mail to: "${EMAIL_TO}",
                     subject: "✅ SUCCESS: ${env.JOB_NAME} [${env.BRANCH_NAME}] - Build #${env.BUILD_NUMBER}",
                     body: """Deployment successful!
                     
Job: ${env.JOB_NAME}
Branch: ${env.BRANCH_NAME}
Build Number: ${env.BUILD_NUMBER}
Environment: ${environment}

Commit Information:
- Message: ${env.COMMIT_MSG}
- Author: ${env.COMMIT_AUTHOR}
- Hash: ${env.COMMIT_HASH}
                     
View build: ${env.BUILD_URL}
Console output: ${env.BUILD_URL}console
"""
                
                slackSend(
                    channel: '#jenkins-notify',
                    color: 'good',
                    message: """
✅ *Build Succeeded!* 🎉

*Environment:* ${environment}
*Branch:* \`${env.BRANCH_NAME}\`
*Build:* <${env.BUILD_URL}|#${env.BUILD_NUMBER}>
*Duration:* ${duration}

*Commit Information:*
📝 *Message:* ${env.COMMIT_MSG}
👤 *Author:* ${env.COMMIT_AUTHOR}
🔗 *Hash:* \`${env.COMMIT_HASH}\`

<${env.BUILD_URL}console|View Console Output>
""".stripIndent()
                )
            }
        }
        
        failure {
            script {
                def environment = getEnvironmentName(env.BRANCH_NAME)
                def duration = currentBuild.durationString.replace(' and counting', '')
                
                echo "❌ Deployment failed"
                
                mail to: "${EMAIL_TO}",
                     subject: "❌ FAILED: ${env.JOB_NAME} [${env.BRANCH_NAME}] - Build #${env.BUILD_NUMBER}",
                     body: """Deployment failed!
                     
Job: ${env.JOB_NAME}
Branch: ${env.BRANCH_NAME}
Build Number: ${env.BUILD_NUMBER}
Environment: ${environment}

Commit Information:
- Message: ${env.COMMIT_MSG}
- Author: ${env.COMMIT_AUTHOR}
- Hash: ${env.COMMIT_HASH}

⚠️ Please check the console output for error details.
                     
View build: ${env.BUILD_URL}
Console output: ${env.BUILD_URL}console
"""
                
                slackSend(
                    channel: '#jenkins-notify',
                    color: 'danger',
                    message: """
❌ *Build Failed!* 💥

*Environment:* ${environment}
*Branch:* \`${env.BRANCH_NAME}\`
*Build:* <${env.BUILD_URL}|#${env.BUILD_NUMBER}>
*Duration:* ${duration}

*Commit Information:*
📝 *Message:* ${env.COMMIT_MSG}
👤 *Author:* ${env.COMMIT_AUTHOR}
🔗 *Hash:* \`${env.COMMIT_HASH}\`

⚠️ *Action Required:* Check logs for error details
<${env.BUILD_URL}console|View Console Output>
""".stripIndent()
                )
            }
        }
        
        unstable {
            script {
                def environment = getEnvironmentName(env.BRANCH_NAME)
                
                slackSend(
                    channel: '#jenkins-notify',
                    color: 'warning',
                    message: """
⚠️ *Build Unstable!*

*Environment:* ${environment}
*Branch:* \`${env.BRANCH_NAME}\`
*Build:* <${env.BUILD_URL}|#${env.BUILD_NUMBER}>

*Commit Information:*
📝 *Message:* ${env.COMMIT_MSG}
👤 *Author:* ${env.COMMIT_AUTHOR}
🔗 *Hash:* \`${env.COMMIT_HASH}\`

Some tests may have failed.
<${env.BUILD_URL}console|View Console Output>
""".stripIndent()
                )
            }
        }
        
        notBuilt {
            script {
                slackSend(
                    channel: '#jenkins-notify',
                    color: '#808080',
                    message: """
🚫 *Build Not Executed!*

*Branch:* \`${env.BRANCH_NAME}\`
*Build:* <${env.BUILD_URL}|#${env.BUILD_NUMBER}>

<${env.BUILD_URL}console|View Console Output>
""".stripIndent()
                )
            }
        }
        
        aborted {
            script {
                def environment = getEnvironmentName(env.BRANCH_NAME)
                
                slackSend(
                    channel: '#jenkins-notify',
                    color: '#808080',
                    message: """
🛑 *Build Aborted!*

*Environment:* ${environment}
*Branch:* \`${env.BRANCH_NAME}\`
*Build:* <${env.BUILD_URL}|#${env.BUILD_NUMBER}>

*Commit Information:*
📝 *Message:* ${env.COMMIT_MSG}
👤 *Author:* ${env.COMMIT_AUTHOR}
🔗 *Hash:* \`${env.COMMIT_HASH}\`

<${env.BUILD_URL}console|View Console Output>
""".stripIndent()
                )
            }
        }
    }
}

// Helper function to get environment name from branch
def getEnvironmentName(String branch) {
    switch(branch) {
        case 'main':
            return '🚀 Production'
        case 'QA':
            return '🧪 QA'
        case 'staging':
            return '🔧 Development'
        default:
            return '🌿 ' + branch
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
