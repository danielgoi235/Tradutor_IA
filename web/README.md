# Tradutor IA - Web App 📱

Aplicação web responsiva e instalável para tradução de voz em chamadas internacionais.

## Features

- 🎤 **Tradução Bidirecional em Tempo Real**
- 📱 **Mobile-First Design** - Otimizado para celular
- 🔄 **PWA (Progressive Web App)** - Instável no home screen
- 📵 **Offline Support** - Funciona sem internet
- 🔔 **Push Notifications** - Notificações de chamadas
- 📊 **Dashboard de Estatísticas** - Acompanhe suas chamadas
- ⚙️ **Configurações Completas** - Personalize a app
- 💾 **Service Worker** - Carregamento rápido e caching

## Requisitos

- Node.js 18+
- npm ou yarn
- API Backend funcionando (em servidor separado)

## Instalação Local

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo de variáveis de ambiente
cp .env.example .env.local

# 3. Editar .env.local com a URL da sua API
# NEXT_PUBLIC_API_URL=http://localhost:3000

# 4. Iniciar servidor de desenvolvimento
npm run dev

# 5. Abrir no navegador
# http://localhost:3000
```

## Build para Produção

```bash
# Build
npm run build

# Start
npm start

# Será servido em http://localhost:3000
```

## Estrutura do Projeto

```
web/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Home page
│   └── globals.css        # Estilos globais
├── components/             # Componentes React
│   ├── Header.tsx         # Cabeçalho
│   ├── CallInterface.tsx  # Interface de chamadas
│   ├── Settings.tsx       # Configurações
│   └── Stats.tsx          # Estatísticas
├── public/                 # Arquivos estáticos
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service Worker
│   ├── register-sw.js     # Registro do SW
│   └── icons/             # Ícones (gerar com tools)
├── next.config.js         # Configuração Next.js
├── tailwind.config.ts     # Configuração Tailwind
└── package.json
```

## Variáveis de Ambiente

### Obrigatórias

```env
# URL da API de tradução
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Opcionais

```env
# Nome da app
NEXT_PUBLIC_APP_NAME=Tradutor IA

# Environment
NODE_ENV=production
```

## Deploy no Vercel

### Rápido e Simples

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
vercel --prod

# 3. Seguir prompts e responder as perguntas
```

Ou veja [WEB_DEPLOYMENT.md](../WEB_DEPLOYMENT.md) para instrções detalhadas.

## Uso como PWA

### Android

1. Abra a app no Chrome
2. Menu (⋮) → "Instalar app"
3. Confirme
4. Ícone aparece na home screen

### iPhone

1. Abra a app no Safari
2. Compartilhar → "Adicionar à Tela de Início"
3. Confirme
4. Ícone aparece como app

### Offline

- Service Worker cacheia todos os assets
- App funciona completamente offline
- Sincroniza quando volta online

## API Integration

A app comunica com a API em `/api/bidirectional/*`:

```typescript
// Exemplo: Iniciar chamada
const response = await axios.post('/api/bidirectional/initiate', {
  participant1Number: '+5511987654321',
  participant2Number: '+14155552671',
  participant1Name: 'João',
  participant2Name: 'John'
})
```

Ver [BIDIRECTIONAL_GUIDE.md](../BIDIRECTIONAL_GUIDE.md) para mais endpoints.

## Personalizações

### Trocar Tema/Cores

Edit `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: '#1e40af',      // Azul principal
      secondary: '#0ea5e9',    // Ciano
      accent: '#f59e0b',       // Âmbar
    }
  }
}
```

### Adicionar Novos Idiomas

Edit `components/CallInterface.tsx`:

```typescript
<option value="ja-JP">🇯🇵 Japonês</option>
```

### Customizar Ícones

Substituir ícones em `/public/`:
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)
- `apple-touch-icon.png` (180x180px)
- `favicon.ico`

Gerar ícones: https://realfavicongenerator.net

## Performance

Lighthouse scores esperados:

```
Performance:       90+  ✅
Accessibility:     95+  ✅
Best Practices:    95+  ✅
SEO:               90+  ✅
PWA:               ✅ Instalável
```

Testar localmente:

```bash
npm i -g lighthouse
lighthouse http://localhost:3000 --view
```

## Troubleshooting

### "Cannot GET /api/..."

**Problema:** API URL não está correta

**Solução:**
```bash
# Verificar .env.local
cat .env.local

# Deve ter:
NEXT_PUBLIC_API_URL=http://localhost:3000

# Reiniciar npm run dev
```

### "Service Worker não funciona"

**Problema:** Service Worker não está sendo registrado

**Solução:**
1. Abrir DevTools → Application
2. Verificar se `/public/sw.js` está sendo carregado
3. Certificar que está em HTTPS (ou localhost)
4. Limpar cache: Shift + Ctrl + Delete

### App lenta no celular

**Soluções:**
1. Limpar cache da app
2. Desinstalar e reinstalar
3. Verificar velocidade de internet
4. Reduzir tamanho de imagens em `/public`

## Scripts Disponíveis

```bash
npm run dev       # Start dev server
npm run build     # Build para produção
npm start         # Start production server
npm run lint      # ESLint
```

## Contribuindo

Para adicionar features:

1. Criar componente em `/components`
2. Importar em `app/page.tsx`
3. Adicionar rota na navegação
4. Testar no celular

## Suporte

Documentação completa:
- [BIDIRECTIONAL_GUIDE.md](../BIDIRECTIONAL_GUIDE.md) - Como usar
- [WEB_DEPLOYMENT.md](../WEB_DEPLOYMENT.md) - Deploy
- [COST_OPTIMIZATION.md](../COST_OPTIMIZATION.md) - Otimizar custos

## Licença

MIT License

---

**Desenvolvido com ❤️ para conectar pessoas globalmente**
