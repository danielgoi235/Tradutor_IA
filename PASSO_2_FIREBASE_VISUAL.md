# 🚀 PASSO 2 - Firebase Setup (Visual Guia Completo)

**Tempo:** 30 minutos | **Dificuldade:** 🟢 FÁCIL

---

## ✅ CHECKLIST RÁPIDO

Ao final, você terá:
- [ ] Projeto Firebase "tradutor-ia" criado
- [ ] Firestore Database ativo
- [ ] Cloud Functions habilitado
- [ ] Firebase Hosting habilitado
- [ ] `firebaseConfig` copiado
- [ ] Arquivo `.env.local` preenchido
- [ ] Gemini API habilitado
- [ ] API Key do Gemini copiada

---

## 📍 ETAPA 1: Abrir Firebase Console

```
1. Abra seu navegador
2. Vá para: https://console.firebase.google.com
3. Faça login com sua conta Google
```

**Você vai ver isso:**

```
┌─────────────────────────────────────────┐
│ Firebase Console                        │
├─────────────────────────────────────────┤
│ □ Seus projetos                         │
│ ┌─────────────────────────────────────┐ │
│ │ + Criar projeto                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ □ Projetos recentes (vazio)             │
└─────────────────────────────────────────┘
```

---

## 📍 ETAPA 2: Criar Projeto Firebase

```
1. Clique no botão "+ Criar projeto"
```

**Você vai ver:**

```
┌─────────────────────────────────────────┐
│ Criar projeto do Firebase               │
├─────────────────────────────────────────┤
│ Nome do projeto:                        │
│ ┌─────────────────────────────────────┐ │
│ │ [tradutor-ia________________]        │ │ ← Digite aqui
│ └─────────────────────────────────────┘ │
│                                         │
│ □ Ativar Google Analytics (opcional)   │
│                                         │
│       [Continuar]     [Cancelar]        │
└─────────────────────────────────────────┘
```

**O que fazer:**
```
2. No campo "Nome do projeto", digite: tradutor-ia
3. Deixe Google Analytics desmarcado (não precisa)
4. Clique "Continuar"
```

---

## 📍 ETAPA 3: Configurar Projeto

```
Você verá um formulário de configuração.
Aceite os termos e clique "Criar projeto"
```

**Você vai ver:**

```
┌─────────────────────────────────────────┐
│ ✓ Projeto "tradutor-ia" foi criado!   │
│                                         │
│ Inicializando... ⏳                      │
│ (Aguarde ~2 minutos)                    │
└─────────────────────────────────────────┘
```

⏳ **Aguarde enquanto o projeto é criado** (2 minutos)

Você verá uma tela como:

```
┌─────────────────────────────────────────┐
│ Bem-vindo ao Firebase!                  │
│                                         │
│ Selecione um produto para começar:      │
│                                         │
│ Build (↓)                               │
│ ├─ Firestore Database                  │
│ ├─ Cloud Functions                      │
│ ├─ Hosting                              │
│ ├─ Authentication                       │
│ └─ Storage                              │
│                                         │
│ Analyze                                 │
│ ├─ Analytics                            │
│ └─ ...                                  │
└─────────────────────────────────────────┘
```

---

## 📍 ETAPA 4: Criar Firestore Database

```
1. Na tela, clique em "Firestore Database" (sob "Build")
```

**Você vai ver:**

```
┌─────────────────────────────────────────┐
│ Firestore Database                      │
│                                         │
│ [Criar banco de dados]                  │
│                                         │
│ (Explicação sobre Firestore)            │
└─────────────────────────────────────────┘
```

```
2. Clique no botão "Criar banco de dados"
```

**Pop-up vai aparecer:**

```
┌─────────────────────────────────────────┐
│ Criar um banco de dados                 │
├─────────────────────────────────────────┤
│                                         │
│ Modo de segurança:                      │
│ ○ Modo de produção                      │
│ ● Modo de teste              ← Selecione│
│                                         │
│ Local:                                  │
│ ┌─────────────────────────────────────┐ │
│ │ us-central1           [Alterar]     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│       [Criar]     [Cancelar]            │
└─────────────────────────────────────────┘
```

**O que fazer:**
```
3. Selecione "Modo de teste" (já deve estar selecionado)
4. Verifique localização: "us-central1" (está certo)
5. Clique "Criar"
```

⏳ **Aguarde ~1 minuto enquanto o banco é criado**

Você verá:

```
┌─────────────────────────────────────────┐
│ ✓ Firestore Database criado com sucesso│
│                                         │
│ (Mostra interface do banco vazio)       │
└─────────────────────────────────────────┘
```

---

## 📍 ETAPA 5: Habilitar Cloud Functions

```
1. Na esquerda, clique em "Cloud Functions"
   (está em "Build" → "Functions")
```

**Você vai ver:**

```
┌─────────────────────────────────────────┐
│ Cloud Functions                         │
│                                         │
│ [Habilitar a API]                       │
│                                         │
│ (Mensagem explicando o que é)           │
└─────────────────────────────────────────┘
```

```
2. Clique em "Habilitar a API" ou "HABILITAR"
```

⏳ **Aguarde alguns segundos**

Quando pronto:

```
┌─────────────────────────────────────────┐
│ ✓ Cloud Functions habilitado            │
│                                         │
│ (Mostra lista de functions vazia)       │
└─────────────────────────────────────────┘
```

---

## 📍 ETAPA 6: Habilitar Hosting

```
1. Na esquerda, clique em "Hosting"
   (está em "Build" → "Hosting")
```

**Você vai ver:**

```
┌─────────────────────────────────────────┐
│ Firebase Hosting                        │
│                                         │
│ [Começar]                               │
│                                         │
│ (Mensagem sobre deploy)                 │
└─────────────────────────────────────────┘
```

```
2. Clique em "Começar"
```

Você verá instruções de CLI. **Por enquanto, pode ignorar e fechar**.

---

## 📍 ETAPA 7: Copiar firebaseConfig

Este é o **PASSO CRÍTICO**!

```
1. Na esquerda, clique em "Configurações do projeto"
   (ícone de ⚙️ engrenagem, quase no final)
```

**Você vai ver:**

```
┌─────────────────────────────────────────┐
│ Configurações do projeto                │
│                                         │
│ Geral | Integrações | Chaves de API   │
│                                         │
│ Nome do projeto: tradutor-ia            │
│ ID: tradutor-ia                         │
│ Região padrão: us-central1              │
│                                         │
│ ... (mais conteúdo)                     │
└─────────────────────────────────────────┘
```

```
2. Role para BAIXO até "Seus aplicativos"
```

**Você vai ver:**

```
┌─────────────────────────────────────────┐
│ Seus aplicativos                        │
│                                         │
│ Aplicativos da web:                    │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ <> Aplicativo web 1                │ │ ← Clique aqui
│ │                                     │ │
│ │ const firebaseConfig = {            │ │
│ │   apiKey: "AIzaSy...",              │ │
│ │   authDomain: "...",                │ │
│ │   ...                               │ │
│ │ }                                   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ (Se não existir, clique "<>" para criar)│
└─────────────────────────────────────────┘
```

Se **não houver nenhum app**, faça isso:

```
3. Clique no ícone "<>" para registrar um novo app web
4. Clique "Registrar app"
5. Aceite os termos
```

Quando houver um app:

```
6. Você vai ver o firebaseConfig completo:

   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "tradutor-ia.firebaseapp.com",
     projectId: "tradutor-ia",
     storageBucket: "tradutor-ia.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123def456"
   };

7. COPIE TUDO ISSO (Ctrl+C ou triple-click)
```

---

## 📍 ETAPA 8: Habilitar Gemini API (Google Cloud)

```
1. Abra novo navegador: https://console.cloud.google.com
2. Faça login se pedido
```

**Você vai ver:**

```
┌─────────────────────────────────────────┐
│ Google Cloud Console                    │
│                                         │
│ Meus projetos... ↓                      │
│ Pesquisa...     [🔍 Pesquisar...]       │
└─────────────────────────────────────────┘
```

```
3. Na pesquisa, digite: Gemini API
```

**Resultados:**

```
┌─────────────────────────────────────────┐
│ Pesquisar: "Gemini API"                │
│                                         │
│ Resultados:                             │
│ ✓ Generative AI API (essa é!)          │ ← Clique
│ ✓ Gemini API                            │
│ ✓ Other services...                     │
└─────────────────────────────────────────┘
```

```
4. Clique em "Generative AI API" ou "Gemini API"
```

**Você vai ver:**

```
┌─────────────────────────────────────────┐
│ Generative AI API                       │
│                                         │
│ [HABILITAR]                             │
│                                         │
│ (Descrição do serviço)                  │
└─────────────────────────────────────────┘
```

```
5. Clique em "HABILITAR"
```

⏳ **Aguarde alguns segundos**

Quando pronto:

```
┌─────────────────────────────────────────┐
│ ✓ Generative AI API habilitada          │
│                                         │
│ (Mostra documentação)                   │
└─────────────────────────────────────────┘
```

---

## 📍 ETAPA 9: Criar API Key do Gemini

```
1. Na esquerda, clique em "Credenciais"
```

**Você vai ver:**

```
┌─────────────────────────────────────────┐
│ Credenciais                             │
│                                         │
│ + Criar credenciais ↓                   │
│ ├─ Chave de API                         │ ← Clique aqui
│ ├─ Conta de Serviço                     │
│ └─ OAuth 2.0 ID do cliente              │
└─────────────────────────────────────────┘
```

```
2. Clique em "Chave de API"
```

**Você vai ver:**

```
┌─────────────────────────────────────────┐
│ Chave de API criada                     │
│                                         │
│ AIzaSy... (é a sua chave!)             │
│                                         │
│ [Copiar] [Fechar]                       │
└─────────────────────────────────────────┘
```

```
3. Clique em "Copiar" (ou selecione e Ctrl+C)
```

Você vai ver:

```
┌─────────────────────────────────────────┐
│ ✓ Copiado para a área de transferência!│
└─────────────────────────────────────────┘
```

---

## ✅ PARABÉNS! Agora você tem:

```
✅ Firebase Project: tradutor-ia
✅ Firestore Database: Criado
✅ Cloud Functions: Habilitado
✅ Firebase Hosting: Habilitado
✅ firebaseConfig: Copiado
✅ Gemini API: Habilitado
✅ API Key Gemini: Copiada
```

---

## 📋 PRÓXIMO PASSO

Vá para o terminal e execute:

```bash
cd /c/Users/danie/OneDrive/Documentos/GitHub/tradutor-ia-real
# Cole aqui o firebaseConfig no script (veja PASSO 4)
```

---

**Quando terminar, avise que completou PASSO 2! ✅**
