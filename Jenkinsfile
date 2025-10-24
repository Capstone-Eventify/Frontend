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
                script {
                    echo "Building branch: ${env.BRANCH_NAME}"
                    checkout scm
                    
                    // Get commit information
                    try {
                        def commitMsg = sh(returnStdout: true, script: 'git log -1 --pretty=%B').trim()
                        def commitAuthor = sh(returnStdout: true, script: 'git log -1 --pretty=%an').trim()
                        def commitEmail = sh(returnStdout: true, script: 'git log -1 --pretty=%ae').trim()
                        def commitHash = sh(returnStdout: true, script: 'git log -1 --pretty=%h').trim()
                        
                        env.COMMIT_MSG = commitMsg
                        env.COMMIT_AUTHOR = commitAuthor
                        env.COMMIT_EMAIL = commitEmail
                        env.COMMIT_HASH = commitHash
                        
                        echo "Commit: ${env.COMMIT_MSG}"
                        echo "Author: ${env.COMMIT_AUTHOR}"
                        echo "Hash: ${env.COMMIT_HASH}"
                    } catch (Exception e) {
                        echo "Could not fetch commit info: ${e.getMessage()}"
                        env.COMMIT_MSG = "Unable to fetch commit message"
                        env.COMMIT_AUTHOR = "Unknown"
                        env.COMMIT_HASH = "N/A"
                    }
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
                
                def commitMsg = env.COMMIT_MSG ?: 'No commit message'
                def commitAuthor = env.COMMIT_AUTHOR ?: 'Unknown'
                def commitHash = env.COMMIT_HASH ?: 'N/A'
                
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
                
                try {
                    slackSend(
                        channel: '#jenkins-notify',
                        color: 'good',
                        tokenCredentialId: 'Slack integration',
                        message: """✅ *Build Succeeded!* 🎉

*Environment:* ${environment}
*Branch:* `${env.BRANCH_NAME}`
*Build:* <${env.BUILD_URL}|#${env.BUILD_NUMBER}>
*Duration:* ${duration}

*Commit Information:*
📝 *Message:* ${commitMsg}
👤 *Author:* ${commitAuthor}
🔗 *Hash:* `${commitHash}`

<${env.BUILD_URL}console|View Console Output>"""
                    )
                    echo "✅ Slack notification sent successfully"
                } catch (Exception e) {
                    echo "❌ Slack notification failed: ${e.getMessage()}"
                }
            }
        }
        
        failure {
            script {
                def environment = getEnvironmentName(env.BRANCH_NAME)
                def duration = currentBuild.durationString.replace(' and counting', '')
                
                def commitMsg = env.COMMIT_MSG ?: 'No commit message'
                def commitAuthor = env.COMMIT_AUTHOR ?: 'Unknown'
                def commitHash = env.COMMIT_HASH ?: 'N/A'
                
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
                
                try {
                    slackSend(
                        channel: '#jenkins-notify',
                        color: 'danger',
                        tokenCredentialId: 'Slack integration',
                        message: """❌ *Build Failed!* 💥

*Environment:* ${environment}
*Branch:* `${env.BRANCH_NAME}`
*Build:* <${env.BUILD_URL}|#${env.BUILD_NUMBER}>
*Duration:* ${duration}

*Commit Information:*
📝 *Message:* ${commitMsg}
👤 *Author:* ${commitAuthor}
🔗 *Hash:* `${commitHash}`

⚠️ *Action Required:* Check logs for error details
<${env.BUILD_URL}console|View Console Output>"""
                    )
                    echo "✅ Slack failure notification sent"
                } catch (Exception e) {
                    echo "❌ Slack notification failed: ${e.getMessage()}"
                }
            }
        }
        
        unstable {
            script {
                def environment = getEnvironmentName(env.BRANCH_NAME)
                
                def commitMsg = env.COMMIT_MSG ?: 'No commit message'
                def commitAuthor = env.COMMIT_AUTHOR ?: 'Unknown'
                def commitHash = env.COMMIT_HASH ?: 'N/A'
                
                try {
                    slackSend(
                        channel: '#jenkins-notify',
                        color: 'warning',
                        tokenCredentialId: 'Slack integration',
                        message: """⚠️ *Build Unstable!*

*Environment:* ${environment}
*Branch:* `${env.BRANCH_NAME}`
*Build:* <${env.BUILD_URL}|#${env.BUILD_NUMBER}>

*Commit Information:*
📝 *Message:* ${commitMsg}
👤 *Author:* ${commitAuthor}
🔗 *Hash:* `${commitHash}`

Some tests may have failed.
<${env.BUILD_URL}console|View Console Output>"""
                    )
                    echo "✅ Slack unstable notification sent"
                } catch (Exception e) {
                    echo "❌ Slack notification failed: ${e.getMessage()}"
                }
            }
        }
        
        notBuilt {
            script {
                try {
                    slackSend(
                        channel: '#jenkins-notify',
                        color: '#808080',
                        tokenCredentialId: 'Slack integration',
                        message: """🚫 *Build Not Executed!*

*Branch:* `${env.BRANCH_NAME}`
*Build:* <${env.BUILD_URL}|#${env.BUILD_NUMBER}>

<${env.BUILD_URL}console|View Console Output>"""
                    )
                } catch (Exception e) {
                    echo "❌ Slack notification failed: ${e.getMessage()}"
                }
            }
        }
        
        aborted {
            script {
                def environment = getEnvironmentName(env.BRANCH_NAME)
                
                def commitMsg = env.COMMIT_MSG ?: 'No commit message'
                def commitAuthor = env.COMMIT_AUTHOR ?: 'Unknown'
                def commitHash = env.COMMIT_HASH ?: 'N/A'
                
                try {
                    slackSend(
                        channel: '#jenkins-notify',
                        color: '#808080',
                        tokenCredentialId: 'Slack integration',
                        message: """🛑 *Build Aborted!*

*Environment:* ${environment}
*Branch:* `${env.BRANCH_NAME}`
*Build:* <${env.BUILD_URL}|#${env.BUILD_NUMBER}>

*Commit Information:*
📝 *Message:* ${commitMsg}
👤 *Author:* ${commitAuthor}
🔗 *Hash:* `${commitHash}`

<${env.BUILD_URL}console|View Console Output>"""
                    )
                } catch (Exception e) {
                    echo "❌ Slack notification failed: ${e.getMessage()}"
                }
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
