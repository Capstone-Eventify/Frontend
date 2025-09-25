node {
    stage('Checkout') {
        checkout scm
    }
    
    stage('Install') {
        sh 'npm ci'
    }
    
    stage('Build') {
        sh 'npm run build'
    }
