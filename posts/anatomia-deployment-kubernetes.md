O **Deployment** é o recurso mais usado para rodar aplicações sem estado no Kubernetes. Ele declara quantas cópias da aplicação devem existir e como atualizá-las.

## O manifesto

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: ghcr.io/exemplo/api:1.4.0
          ports:
            - containerPort: 8080
          readinessProbe:
            httpGet:
              path: /health
              port: 8080
```

## Parte por parte

- `replicas`: quantos Pods devem estar rodando ao mesmo tempo.
- `selector`: quais Pods pertencem a este Deployment. Precisa bater com os `labels` do `template`.
- `template`: o modelo de Pod que será criado.
- `strategy`: como trocar a versão. Com `maxUnavailable: 0`, nenhum Pod antigo sai antes de um novo ficar pronto.
- `readinessProbe`: diz ao Kubernetes quando o Pod pode receber tráfego.

## Comandos úteis

```bash
kubectl apply -f deployment.yaml
kubectl rollout status deployment/api
kubectl rollout undo deployment/api
```

O `rollout undo` volta para a versão anterior, o que é útil quando uma atualização dá errado.
