# Configuração para Deploy no Vercel

## 📋 Pré-requisitos

1. **Vercel Account:** https://vercel.com
2. **GitHub:** Repositório pushado com branch `feat/phase1-webrtc`
3. **Firebase Project:** Credenciais prontas

---

## 🔧 Configuração de Variáveis de Ambiente

No Vercel Dashboard → Settings → Environment Variables, adicione:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDX_VLqlYi1ZUlY0CHY-RES1kClJyGof38
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tradutor-ia-21aee.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tradutor-ia-21aee
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tradutor-ia-21aee.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1084658164679
NEXT_PUBLIC_FIREBASE_APP_ID=1:1084658164679:web:e996ba4b2a82930fefefe2
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyBP6zGJL1bNNU7OZfc_R7lkBNlpTuGXxFQ
```

⚠️ **IMPORTANTE:** Essas variáveis começam com `NEXT_PUBLIC_` e são expostas no cliente (browser).
Para dados sensíveis, use variáveis sem `NEXT_PUBLIC_`.

---

## 🚀 Deploy Steps

### 1. Conectar GitHub ao Vercel

```bash
# No Vercel Dashboard:
1. New Project → Import Git Repository
2. Selecionar: danielgoi235/tradutor-ia-real
3. Framework: Next.js (detecção automática)
4. Root Directory: web/
5. Environment Variables: Colar acima
6. Deploy!
```

### 2. Build Configuration

Vercel automaticamente detectará:
- **Build Command:** `npm run build` (via vercel.json)
- **Start Command:** `npm start`
- **Install Command:** Customizado em vercel.json

### 3. Verificação Pós-Deploy

```bash
# URL será gerada automaticamente:
# https://tradutor-ia-real.vercel.app

# Testar:
1. Abrir app no navegador
2. Verificar console.log (DevTools F12)
3. Tentar criar sala
4. Validar Firestore (Firebase Console)
```

---

## 🧪 Testes Automatizados

### No Vercel (CI/CD)

O `buildCommand` está configurado para:

```bash
cd web && npm run build && npm test
```

**Fluxo:**
1. Build Next.js (`npm run build`)
2. Rodar testes Jest (`npm test`)
3. Se testes falharem → Deploy cancelado
4. Se testes passarem → Deploy prossegue

### Testes E2E (Playwright)

Atualmente **não executados** no Vercel. Para ativar:

```json
// vercel.json
{
  "buildCommand": "cd web && npm run build && npm test && npm run test:e2e"
}
```

Requer instalação de Playwright na máquina CI.

---

## 📊 Monitoramento

### Vercel Analytics
- Dashboard → Analytics
- Monitore: First Contentful Paint (FCP), Largest Contentful Paint (LCP)

### Firestore Quota
- Firebase Console → Firestore → Usage
- Monitore: Document reads/writes, storage

### Cloud Functions
- Firebase Console → Functions → Logs
- Verificar execução de `expireRooms` a cada 5 min

---

## ⚠️ Troubleshooting

### Erro: "Module not found: 'firebase/app'"

**Solução:** Verificar que `npm install firebase` foi executado:

```bash
cd web
npm list firebase
```

### Erro: Build falha com "ENOENT: no such file"

**Solução:** Limpar cache do Vercel:

```bash
# Vercel Dashboard → Project Settings → Git
# Clique: "Clear Build Cache"
```

### Variáveis de Ambiente não carregam

**Solução:** Verificar que estão sem `NEXT_PUBLIC_`:

```javascript
// ❌ ERRADO - não aparece no cliente
const apiKey = process.env.FIREBASE_API_KEY;

// ✅ CERTO - disponível no cliente
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
```

---

## 🔄 Deploy automático

Configurado para deploy automático:
- **Trigger:** Push para `main` (produção)
- **Preview:** PR comments com URL de staging

---

## 📝 Checklist Antes do Deploy

- [ ] Testes locais passando: `npm test` ✅
- [ ] Build local sucesso: `npm run build` ✅
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Firebase Rules permitem acesso anônimo
- [ ] Cloud Functions deployadas no Firebase
- [ ] Git push para branch feat/phase1-webrtc ✅
- [ ] PR criada em GitHub

---

**Status:** 🟢 Pronto para Deploy

Próximo: @devops ativa para git push + Vercel PR
