# Weather Monitor

React weather dashboard used to exercise a Jenkins → Docker → Kubernetes pipeline.

- Current conditions, 12-hour forecast, and 7-day outlook
- City search and browser geolocation
- Forecast data from [Open-Meteo](https://open-meteo.com/) (no API key)
- Nginx health endpoint at `/health`

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5174

## Docker

```bash
docker build --build-arg VITE_APP_VERSION=local -t weather-monitor:latest .
docker run --rm -p 8080:80 weather-monitor:latest
```

Open http://localhost:8080 and check http://localhost:8080/health

## Kubernetes

```bash
kubectl apply -f k8s/deployment.yaml
```

The Service is `NodePort` `30080`. Change the image name in `k8s/deployment.yaml` if your Jenkins job pushes to a registry.

## Jenkins

`Jenkinsfile` stages:

1. Checkout
2. `npm ci` and production build
3. Docker image build tagged with `BUILD_NUMBER`
4. Kubernetes rollout
