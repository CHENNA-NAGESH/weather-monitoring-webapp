pipeline {
  agent any

  environment {
    IMAGE_NAME = 'weather-monitor'
    IMAGE_TAG  = "${env.BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

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

    stage('Load image into k3s') {
      steps {
        sh """
          docker save ${IMAGE_NAME}:${IMAGE_TAG} | sudo k3s ctr images import - \
          || docker save ${IMAGE_NAME}:${IMAGE_TAG} | k3s ctr images import -
        """
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        sh """
          KCTL='kubectl'
          command -v kubectl >/dev/null 2>&1 || KCTL='k3s kubectl'
          \$KCTL apply -f k8s/deployment.yaml
          \$KCTL set image deployment/weather-monitor weather-monitor=${IMAGE_NAME}:${IMAGE_TAG}
          \$KCTL rollout status deployment/weather-monitor --timeout=120s
        """
      }
    }
  }
}
