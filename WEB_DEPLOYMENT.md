# Deployment da Web App no Vercel 🚀

Guia completo para colocar a app Next.js em produção no Vercel com PWA support.

## O Que Você Vai Ter

```
✅ Web app responsiva (mobile-first)
✅ Funciona como app nativo no celular
✅ Offline support com Service Worker
✅ Instalável (Add to Home Screen)
✅ Sincronização automática
✅ Push notifications
✅ Deploy automático no Vercel
✅ SSL/TLS grátis
✅ CDN global
```

## Pré-requisitos

1. **Conta Vercel** - https://vercel.com (grátis com GitHub)
2. **GitHub Account** - Para integração automática
3. **Repositório Git** - Com o código do projeto
4. **API Backend** - Já deployada (em servidor separado)

## Passo 1: Preparar o Repositório

```bash
# Clonar o repo
git clone seu-repo
cd seu-repo

# Verificar estrutura
tree -L 2 tradutor-ia-real/
# web/
# ├── app/
# ├── components/
# ├── public/
# ├── package.json
# └── next.config.js
```

## Passo 2: Configurar Variáveis de Ambiente

### Localmente (para testar)

```bash
cd tradutor-ia-real/web

# Criar .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF

# Testar localmente
npm install
npm run dev
# Abra http://localhost:3000 no navegador
```

### No Vercel (Produção)

Você vai configurar no dashboard do Vercel.

## Passo 3: Fazer Deploy no Vercel

### Opção A: Via GitHub (Recomendado)

1. **Push seu código para GitHub**
```bash
git add .
git commit -m "feat: add web app to vercel"
git push origin main
```

2. **Acessar Vercel**
   - Vá para https://vercel.com
   - Clique em "New Project"
   - Selecione seu repositório GitHub

3. **Configurar Build**
   ```
   Framework Preset: Next.js
   Root Directory: ./web
   Build Command: npm run build
   Output Directory: .next
   ```

4. **Adicionar Environment Variables**
   ```
   NEXT_PUBLIC_API_URL = https://seu-api-backend.vercel.app
   ```

5. **Deploy!**
   - Clique em "Deploy"
   - Aguarde ~2 minutos
   - Acesse seu URL automático

### Opção B: Via CLI do Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
cd web
vercel --prod

# Follow the prompts:
# - Set up and deploy "~/projeto"? Yes
# - Which scope? Your name
# - Link to existing project? No
# - Project name? tradutor-ia-app
# - In which directory? .
# - Want to override settings? No
```

## Passo 4: Configurar API URL

### No Dashboard do Vercel

1. Vá para seu projeto
2. Settings → Environment Variables
3. Adicione:
   ```
   NEXT_PUBLIC_API_URL = https://seu-backend.example.com
   ```
4. Clique em "Save"
5. Redeploy (vai automaticamente redeploy com novos env vars)

## Estrutura de Deploy Recomendada

```
Seu Domínio (Vercel)
├── Frontend: https://tradutor-ia.vercel.app (web app)
└─→ API Calls para Backend: https://api.seu-dominio.com

OU (mais simples)

Vercel
├── Frontend: https://seu-projeto.vercel.app
└── API Routes: /api/... (Next.js API routes)
    └─→ Proxy para backend em produção
```

## Dominios Customizados

### Conectar Domínio Próprio

1. **Comprar domínio**
   - Recomendado: Vercel Domains, Namecheap, GoDaddy

2. **No Dashboard Vercel**
   - Settings → Domains
   - Add Domain
   - Seguir instruções de DNS

3. **Esperar propagação** (até 48h)

### Exemplo: seu-tradutor.com

```bash
# Após adicionar no Vercel:
# seu-tradutor.com → https://seu-projeto.vercel.app
```

## Testing no Celular

### Android

1. **Chrome / Brave**
   - Abra https://seu-app.vercel.app
   - Menu (⋮) → "Instalar app"
   - Toque para confirmar
   - App aparece no home screen

2. **Testar offline**
   - Ative modo avião
   - App continua funcionando!

### iPhone / iPad

1. **Safari**
   - Abra https://seu-app.vercel.app
   - Compartilhar → "Adicionar à Tela de Início"
   - Toque para confirmar
   - App aparece como ícone

2. **PWA Install**
   - Alguns navegadores (como web.dev) mostram "Instalar"

## Monitorar Performance

### Vercel Analytics

1. Dashboard → Analytics
2. Ver métricas:
   - Requisições
   - Tempo de resposta
   - Erro rates
   - Países de origem

### Lighthouse Score

```bash
# Testar localmente
npm install -g lighthouse

lighthouse https://seu-app.vercel.app \
  --view \
  --chrome-flags="--headless"
```

**Score esperado:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

## CI/CD Pipeline

Vercel automaticamente:

```
git push → GitHub
    ↓
GitHub detecta push
    ↓
Vercel webhook acionado
    ↓
Build (npm run build)
    ↓
Test (se configurado)
    ↓
Deploy
    ↓
Preview URL gerado
    ↓
Status no GitHub PR
```

## Troubleshooting

### "Environment variable not set"

```bash
# Solução: Verificar Vercel dashboard
1. Settings → Environment Variables
2. Verificar NEXT_PUBLIC_API_URL está lá
3. Redeploy projeto
```

### "API calls 404"

```bash
# Solução 1: Verificar URL
echo $NEXT_PUBLIC_API_URL  # Deve ter URL completa

# Solução 2: Verificar CORS
# No backend, adicione:
# Access-Control-Allow-Origin: https://seu-app.vercel.app
```

### "Service Worker não registra"

```bash
# Solução: Verificar
1. /public/sw.js existe
2. /public/manifest.json existe
3. /public/register-sw.js carrega no HTML
4. HTTPS habilitado (Vercel faz por padrão)
```

### Slow performance

```bash
# Otimizar:
1. Ativar Image Optimization
   - Settings → Image Optimization
2. Usar Next.js Image component
3. Minificar assets
4. Usar regiões mais próximas
   - Settings → Edge Functions → Configure Regions
```

## Versionamento e Rollbacks

```bash
# Vercel mantém histórico
1. Dashboard → Deployments
2. Ver todas as versões
3. Clicar em qualquer uma para fazer rollback
4. "Promote to Production"
```

## Alertas e Monitoramento

### Configurar Alertas

1. Dashboard → Settings → Alerts
2. Adicionar webhook para Slack/Discord
3. Receber notificação em erros de deploy

### Logs em Tempo Real

```bash
# Via CLI
vercel logs seu-projeto --follow
```

## Escala e Limites Vercel Free

```
Free Tier:
├─ Bandwidth: Unlimited
├─ Builds: 24/dia
├─ Deployments: Unlimited
├─ Serverless Functions: 100 execuções/mês
├─ Data Transfer: 100 GB/mês
└─ Duration: 10 segundos por função

Próximo Tier (Pro):
├─ Tudo do free +
├─ 1000 execuções/mês
├─ Priority support
└─ Custom domains (ilimitados)
```

Se superar free tier, upgrade automático.

## Próximos Passos

1. ✅ Deploy no Vercel
2. ✅ Configurar API URL
3. ✅ Testar no celular
4. ✅ Instalar como app
5. ✅ Testar offline
6. ✅ Monitorar performance

## URLs Úteis

- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Status Page: https://vercel.statuspage.io
- Community: https://github.com/vercel/next.js/discussions

---

**Sua app está no ar!** 🎉

Acesse pelo celular: https://seu-app.vercel.app
