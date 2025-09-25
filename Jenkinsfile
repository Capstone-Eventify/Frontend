node {
    // Configure NodeJS tool with timeout
    try {
        def nodejs = tool 'NodeJS-22'
        env.PATH = "${nodejs}/bin:${env.PATH}"
        echo "Using NodeJS tool: ${nodejs}"
    } catch (Exception e) {
        echo "NodeJS tool not found, using system NodeJS"
        sh 'which node && node --version || echo "NodeJS not found"'
        sh 'which npm && npm --version || echo "npm not found"'
    }
    
    stage('Checkout') {
        checkout scm
    }
    
    stage('Install') {
        timeout(time: 10, unit: 'MINUTES') {
            sh 'echo "Cleaning workspace..."'
            sh 'rm -rf node_modules package-lock.json || true'
            sh 'echo "Installing dependencies with npm install..."'
            sh 'npm install --no-optional --prefer-offline --progress=false'
        }
    }
    
    stage('Build') {
        timeout(time: 5, unit: 'MINUTES') {
            sh 'npm run build'
        }
    }
    
    stage('Deploy to Development') {
        if (env.BRANCH_NAME == 'staging') {
            echo "Deploying to Development server"
            deployToDev()
        }
    }
    
    stage('Deploy to QA') {
        if (env.BRANCH_NAME == 'QA') {
            echo "Deploying to QA server"
            deployToQA()
        }
    }
    
    stage('Production Approval') {
        if (env.BRANCH_NAME == 'main') {
            input message: 'Deploy to Production?', ok: 'Deploy'
        }
    }
    
    stage('Deploy to Production') {
        if (env.BRANCH_NAME == 'main') {
            echo "Deploying to Production server"
            deployToProd()
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
                npm install --no-optional
                
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
                npm install --no-optional
                
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
                npm install --no-optional
                
                cd ..
                pm2 start ecosystem.config.js
                sleep 5
                pm2 status
            '
        """
    }
}
