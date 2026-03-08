# Deployment e Produção 🚀

Guia completo para colocar o Tradutor IA em produção em diferentes plataformas.

## Arquitetura de Produção

```
┌─────────────────────────────────────────────────────────────┐
│                    Usuários Globais                         │
│            (Brasil, EUA, Europa)                           │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ HTTPS
               ▼
┌─────────────────────────────────────────────────────────────┐
│                  CloudFlare/AWS CloudFront                  │
│              (CDN + DDoS Protection)                       │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│              Load Balancer (ALB/NLB)                         │
│          (distribuir tráfego por regiões)                  │
└────┬────────────────────┬────────────────────┬──────────────┘
     │                    │                    │
     ▼                    ▼                    ▼
┌──────────┐         ┌──────────┐         ┌──────────┐
│ App US   │         │ App EU   │         │ App BR   │
│ Container│         │ Container│         │ Container│
│ Port3000 │         │ Port3000 │         │ Port3000 │
└──────┬───┘         └──────┬───┘         └──────┬───┘
       │                    │                    │
       └────────┬───────────┴────────┬───────────┘
                │                    │
                ▼                    ▼
           ┌─────────┐          ┌─────────┐
           │  Twilio │          │  Google │
           │   API   │          │  Cloud  │
           └─────────┘          └─────────┘
                │                    │
                └────────┬───────────┘
                         │
                ┌────────▼────────┐
                │  Redis Cluster  │
                │  (Cache Global) │
                └─────────────────┘
```

## Opção 1: AWS Elastic Container Service (ECS) 🏗️

### 1. Criar Dockerfile Otimizado

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/credentials ./credentials

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["/sbin/dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

### 2. Build e Push para ECR

```bash
# Login na AWS
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Build
docker build -t tradutor-ia:latest .

# Tag
docker tag tradutor-ia:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/tradutor-ia:latest

# Push
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/tradutor-ia:latest
```

### 3. Criar Tarefa ECS

```json
{
  "family": "tradutor-ia",
  "networkMode": "awsvpc",
  "containerDefinitions": [
    {
      "name": "tradutor-ia",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/tradutor-ia:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "TWILIO_ACCOUNT_SID",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:twilio/account-sid"
        },
        {
          "name": "TWILIO_AUTH_TOKEN",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:twilio/auth-token"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/tradutor-ia",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048"
}
```

### 4. Criar ECS Service

```bash
aws ecs create-service \
  --cluster tradutor-ia-cluster \
  --service-name tradutor-ia-service \
  --task-definition tradutor-ia:1 \
  --desired-count 3 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789:targetgroup/tradutor-ia/xxx,containerName=tradutor-ia,containerPort=3000
```

## Opção 2: Google Cloud Run 🚀

### 1. Deploy com gcloud CLI

```bash
# Autenticar
gcloud auth login
gcloud config set project seu-projeto-id

# Build e deploy
gcloud run deploy tradutor-ia \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars TWILIO_ACCOUNT_SID=xxx \
  --set-env-vars TWILIO_AUTH_TOKEN=xxx \
  --set-env-vars GEMINI_API_KEY=xxx \
  --set-env-vars GOOGLE_APPLICATION_CREDENTIALS=/workspace/credentials/key.json \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600 \
  --max-instances 100
```

### 2. Multi-região com Load Balancer

```yaml
# cloud-lb.yaml
apiVersion: compute.cnrm.cloud.google.com/v1beta1
kind: ComputeBackendService
metadata:
  name: tradutor-ia-backend
spec:
  backends:
  - group: projects/seu-projeto/zones/us-central1-a/instanceGroups/tradutor-ia-us
    balancingMode: RATE
    maxRatePerEndpoint: 100
  - group: projects/seu-projeto/zones/europe-west1-b/instanceGroups/tradutor-ia-eu
    balancingMode: RATE
    maxRatePerEndpoint: 100
```

## Opção 3: Heroku (Rápido e Fácil)

### 1. Setup Heroku

```bash
# Instalar CLI
brew install heroku

# Login
heroku login

# Criar app
heroku create seu-app-name

# Adicionar buildpacks
heroku buildpacks:add heroku/nodejs
```

### 2. Configurar Variáveis de Ambiente

```bash
# Adicionar secrets
heroku config:set TWILIO_ACCOUNT_SID=xxx
heroku config:set TWILIO_AUTH_TOKEN=xxx
heroku config:set GEMINI_API_KEY=xxx
heroku config:set GOOGLE_APPLICATION_CREDENTIALS=./credentials/key.json

# Ver todas
heroku config
```

### 3. Deploy

```bash
# Adicionar remote Heroku
git remote add heroku https://git.heroku.com/seu-app-name.git

# Deploy
git push heroku main

# Ver logs
heroku logs --tail
```

## Opção 4: DigitalOcean App Platform

### 1. Criar app.yaml

```yaml
name: tradutor-ia
services:
- name: api
  github:
    repo: seu-usuario/tradutor-ia-real
    branch: main
  build_command: npm install && npm run build
  run_command: npm start
  http_port: 3000
  instance_count: 3
  instance_size_slug: basic-m
  envs:
  - key: NODE_ENV
    value: production
  - key: TWILIO_ACCOUNT_SID
    value: ${TWILIO_ACCOUNT_SID}
  - key: TWILIO_AUTH_TOKEN
    value: ${TWILIO_AUTH_TOKEN}
  - key: GEMINI_API_KEY
    value: ${GEMINI_API_KEY}

databases:
- name: redis
  engine: REDIS
  version: "7"
```

### 2. Deploy via CLI

```bash
# Instalar DigitalOcean CLI
brew install doctl

# Autenticar
doctl auth init

# Deploy
doctl apps create --spec app.yaml
```

## Configuração de Produção: .env

```env
# Environment
NODE_ENV=production
PORT=3000

# Twilio
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
TWILIO_PHONE_NUMBER=+1234567890
WEBHOOK_BASE_URL=https://seu-dominio.com

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=${GOOGLE_CREDENTIALS}
GOOGLE_CLOUD_PROJECT_ID=${PROJECT_ID}

# Gemini
GEMINI_API_KEY=${GEMINI_API_KEY}

# Redis
REDIS_URL=${REDIS_URL}

# Logging
LOG_LEVEL=info

# Performance
NODE_OPTIONS=--max-old-space-size=2048
```

## SSL/TLS com Let's Encrypt

```bash
# Instalar certbot
brew install certbot

# Obter certificado
certbot certonly --standalone -d seu-dominio.com

# Renovação automática (cron)
0 0 1 * * certbot renew --quiet

# Configurar no app
CERT_PATH=/etc/letsencrypt/live/seu-dominio.com/fullchain.pem
KEY_PATH=/etc/letsencrypt/live/seu-dominio.com/privkey.pem
```

## Monitoring e Logging

### 1. Datadog

```bash
# Instalar agente
DD_AGENT_MAJOR_VERSION=7 DD_API_KEY=xxx DD_SITE=datadoghq.com bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_mac_os.sh)"

# Configurar Node.js
npm install dd-trace

# No código (src/index.ts)
import tracer from 'dd-trace';
tracer.init();
```

### 2. Sentry (Error Tracking)

```bash
npm install @sentry/node

# No código
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: "https://xxx@sentry.io/xxx" });
```

## Health Checks e Auto-Scaling

### AWS Auto Scaling Group

```bash
aws autoscaling create-launch-configuration \
  --launch-configuration-name tradutor-ia-lc \
  --image-id ami-xxxxx \
  --instance-type t3.medium \
  --key-name seu-key

aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name tradutor-ia-asg \
  --launch-configuration-name tradutor-ia-lc \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 3 \
  --health-check-type ELB \
  --health-check-grace-period 300
```

## Checklist de Deployment 📋

- [ ] Build Docker testado localmente
- [ ] Variáveis de ambiente configuradas
- [ ] SSL/TLS certificado válido
- [ ] Database (Redis) configurado
- [ ] Backups configurados
- [ ] Monitoring (Datadog/CloudWatch)
- [ ] Logging centralizado
- [ ] Alertas configurados
- [ ] Load balancer testado
- [ ] Health checks funcionando
- [ ] Auto-scaling políticas definidas
- [ ] Disaster recovery plan
- [ ] Documentação atualizada

## Performance em Produção

### Otimizações Recomendadas

```env
# Node.js
NODE_OPTIONS=--max-old-space-size=2048 --enable-source-maps

# Application
CACHE_TTL=86400
MAX_CONCURRENT_CALLS=50
REQUEST_TIMEOUT=30000

# Database
REDIS_MAX_RETRIES=3
DB_POOL_SIZE=10
```

### Benchmark

```bash
# Teste de carga com k6
npm install -g k6

# script.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 100,
  duration: '30s',
};

export default function () {
  let res = http.get('https://seu-dominio.com/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}

# Executar
k6 run script.js
```

---

**Seu app está pronto para produção!** 🎉
