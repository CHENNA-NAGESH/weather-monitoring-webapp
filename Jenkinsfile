pipeline {
  agent any

  environment {
    IMAGE_NAME = 'weather-monitor'
    IMAGE_TAG  = "${env.BUILD_NUMBER}"
  }

  stages {
    stage('Docker build') {
      steps {
        sh """
          docker build \
            --build-arg VITE_APP_VERSION=${IMAGE_TAG} \
            -t ${IMAGE_NAME}:${IMAGE_TAG} \
            -t ${IMAGE_NAME}:latest \
            .
        """
      }
    }

    stage('Run container') {
      steps {
        sh """
          docker rm -f weather-monitor || true
          docker run -d \
            --name weather-monitor \
            --restart unless-stopped \
            -p 30080:80 \
            ${IMAGE_NAME}:${IMAGE_TAG}
          docker ps --filter name=weather-monitor
        """
      }
    }
  }
}
