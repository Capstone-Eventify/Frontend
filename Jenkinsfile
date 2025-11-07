pipeline {
    agent any
    
    environment {
        DEV_SERVER = '3.22.99.0'
        QA_SERVER = '3.21.163.196'  
        PROD_SERVER = '18.117.193.239'
        EMAIL_TO = 'thilakediga321@gmail.com'
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "Building branch: ${env.BRANCH_NAME}"
                    checkout scm
                    
                    try {
                        def commitMsg = sh(returnStdout: true, script: 'git log -1 --pretty=%B').trim()
                        def commitAuthor = sh(returnStdout: true, script: 'git log -1 --pretty=%an').trim()
                        def commitHash = sh(returnStdout: true, script: 'git log -1 --pretty=%h').trim()
                        
                        env.COMMIT_MSG = commitMsg
                        env.COMMIT_AUTHOR = commitAuthor
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
                
                // Email notification
                mail to: "${EMAIL_TO}",
                     subject: "✅ SUCCESS: ${environment} - Build #${env.BUILD_NUMBER}",
                     body: """Deployment successful!
                     
Job: ${env.JOB_NAME}
Branch: ${env.BRANCH_NAME}
Build Number: ${env.BUILD_NUMBER}
Environment: ${environment}
Duration: ${duration}

Commit Information:
- Message: ${commitMsg}
- Author: ${commitAuthor}
- Hash: ${commitHash}
                     
View build: ${env.BUILD_URL}
Console output: ${env.BUILD_URL}console
"""
                
                // Slack notification to #team1
                try {
                    slackSend(
                        channel: '#team1',
                        color: 'good',
                        tokenCredentialId: 'Slack',
                        message: ":white_check_mark: *Build Succeeded!* :tada:\n\n*Environment:* ${environment}\n*Branch:* `${env.BRANCH_NAME}`\n*Build:* <${env.BUILD_URL}|#${env.BUILD_NUMBER}>\n*Duration:* ${duration}\n\n*Commit Information:*\n:memo: *Message:* ${commitMsg}\n:bust_in_silhouette: *Author:* ${commitAuthor}\n:link: *Hash:* `${commitHash}`\n\n<${env.BUILD_URL}console|View Console Output>"
                    )
                    echo "✅ Slack notification sent to #team1"
                } catch (Exception e) {
                    echo "⚠️ Slack failed (email sent): ${e.getMessage()}"
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
                
                // Email notification
                mail to: "${EMAIL_TO}",
                     subject: "❌ FAILED: ${environment} - Build #${env.BUILD_NUMBER}",
                     body: """Deployment failed!
                     
Job: ${env.JOB_NAME}
Branch: ${env.BRANCH_NAME}
Build Number: ${env.BUILD_NUMBER}
Environment: ${environment}
Duration: ${duration}

Commit Information:
- Message: ${commitMsg}
- Author: ${commitAuthor}
- Hash: ${commitHash}

⚠️ Please check the console output for error details.
                     
View build: ${env.BUILD_URL}
Console output: ${env.BUILD_URL}console
"""
                
                // Slack notification
                try {
                    slackSend(
                        channel: '#team1',
                        color: 'danger',
                        tokenCredentialId: 'Slack',
                        message: ":x: *Build Failed!* :boom:\n\n*Environment:* ${environment}\n*Branch:* `${env.BRANCH_NAME}`\n*Build:* <${env.BUILD_URL}|#${env.BUILD_NUMBER}>\n*Duration:* ${duration}\n\n*Commit Information:*\n:memo: *Message:* ${commitMsg}\n:bust_in_silhouette: *Author:* ${commitAuthor}\n:link: *Hash:* `${commitHash}`\n\n:warning: *Action Required:* Check logs for error details\n<${env.BUILD_URL}console|View Console Output>"
                    )
                    echo "✅ Slack failure notification sent to #team1"
                } catch (Exception e) {
                    echo "⚠️ Slack failed (email sent): ${e.getMessage()}"
                }
            }
        }
        
        unstable {
            script {
                def environment = getEnvironmentName(env.BRANCH_NAME)
                
                def commitMsg = env.COMMIT_MSG ?: 'No commit message'
                def commitAuthor = env.COMMIT_AUTHOR ?: 'Unknown'
                def commitHash = env.COMMIT_HASH ?: 'N/A'
                
                // Slack notification
                try {
                    slackSend(
                        channel: '#team1',
                        color: 'warning',
                        tokenCredentialId: 'Slack',
                        message: ":warning: *Build Unstable!*\n\n*Environment:* ${environment}\n*Branch:* `${env.BRANCH_NAME}`\n*Build:* <${env.BUILD_URL}|#${env.BUILD_NUMBER}>\n\n*Commit Information:*\n:memo: *Message:* ${commitMsg}\n:bust_in_silhouette: *Author:* ${commitAuthor}\n:link: *Hash:* `${commitHash}`\n\nSome tests may have failed.\n<${env.BUILD_URL}console|View Console Output>"
                    )
                } catch (Exception e) {
                    echo "⚠️ Slack failed: ${e.getMessage()}"
                }
            }
        }
    }
}

// Helper function to get environment name from branch
def getEnvironmentName(String branch) {
    switch(branch) {
        case 'main':
            return ':rocket: Production'
        case 'QA':
            return ':test_tube: QA'
        case 'staging':
            return ':wrench: Development'
        default:
            return ':herb: ' + branch
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
