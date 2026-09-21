pipeline {
  agent any

  tools {
    nodejs 'Node20'
  }

  environment {
    IMAGE_NAME = "weather-monitor"
    IMAGE_TAG  = "${env.BUILD_NUMBER}"
  }

  stages {
    stage("Checkout") {
      steps {
        checkout scm
      }
    }

    stage("Install & Build") {
      steps {
        sh "npm ci"
        sh "VITE_APP_VERSION=${IMAGE_TAG} npm run build"
      }
    }

    stage("Docker Build") {
      steps {
        sh """
          docker build \
            --build-arg VITE_APP_VERSION=${IMAGE_TAG} \
            -t ${IMAGE_NAME}:${IMAGE_TAG} \
            -t ${IMAGE_NAME}:latest .
        """
      }
    }

    stage("Deploy to Kubernetes") {
      steps {
        sh """
          kubectl set image deployment/weather-monitor \
            weather-monitor=${IMAGE_NAME}:${IMAGE_TAG} --record || \
          kubectl apply -f k8s/deployment.yaml
          kubectl set image deployment/weather-monitor \
            weather-monitor=${IMAGE_NAME}:${IMAGE_TAG}
          kubectl rollout status deployment/weather-monitor
        """
      }
    }
  }
}
