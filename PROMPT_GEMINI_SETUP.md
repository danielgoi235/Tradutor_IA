# 🤖 PROMPT PARA GEMINI - Firebase + Gemini Setup Automático

**Como usar:**
1. Abra https://gemini.google.com (ou Claude)
2. Cole TODO o texto abaixo
3. Siga as instruções que Gemini vai guiar você
4. Copie as credenciais no final

---

## 🚀 PROMPT PARA COLAR

```
Você é um assistente técnico especializado em setup de Firebase e Google Cloud.

CONTEXTO:
- Usuário está criando projeto "Tradutor IA"
- Objetivo: setup Firebase (Firestore) + Google Cloud (Gemini API)
- Localização: us-central1
- Modo: Serverless

TAREFAS DO USUÁRIO (você guia passo-a-passo):

=== FASE 1: FIREBASE SETUP ===

1. HABILITAR FIRESTORE DATABASE
   Instruções detalhadas para o usuário:
   a) Abra: https://console.firebase.google.com
   b) Selecione projeto "tradutor-ia" (ou "tradutor-ia-21aee")
   c) Na esquerda, clique "Firestore Database"
   d) Clique "Criar banco de dados"
   e) Selecione: Modo de teste
   f) Localização: us-central1
   g) Clique "Criar"
   h) Aguarde 1-2 minutos

   ✅ Validação: Quando ver "Firestore Database criado", avise

2. HABILITAR CLOUD FUNCTIONS
   Instruções:
   a) Na esquerda, clique "Cloud Functions"
   b) Clique "Habilitar a API"
   c) Aguarde

   ✅ Validação: Quando ver interface de functions, avise

3. HABILITAR HOSTING
   Instruções:
   a) Na esquerda, clique "Hosting"
   b) Clique "Começar"
   c) Pode ignorar instruções CLI

   ✅ Validação: Quando terminar, avise

4. COPIAR FIREBASECONFIG (CRÍTICO!)
   Instruções:
   a) Na esquerda, clique ⚙️ "Configurações do projeto"
   b) Role para BAIXO até "Seus aplicativos"
   c) Você vai ver "Aplicativos da web"
   d) Se não existir, clique "<>" para registrar
   e) Copie o bloco:

      const firebaseConfig = {
        apiKey: "AIzaSy...",
        authDomain: "...",
        projectId: "...",
        storageBucket: "...",
        messagingSenderId: "...",
        appId: "..."
      };

   ✅ Ação: QUANDO COPIAR, COLE AQUI NESTA CONVERSA

=== FASE 2: GOOGLE CLOUD GEMINI SETUP ===

5. HABILITAR GEMINI API
   Instruções:
   a) Abra novo navegador: https://console.cloud.google.com
   b) Projeto deve ser "tradutor-ia-21aee" (igual ao Firebase)
   c) Na pesquisa (topo), digite: "Gemini API"
   d) Clique em "Generative AI API" ou "Gemini API"
   e) Clique "HABILITAR"
   f) Aguarde alguns segundos

   ✅ Validação: Quando ver "Habilitado", avise

6. CRIAR API KEY GEMINI
   Instruções:
   a) Na esquerda, clique "Credenciais"
   b) Clique "+ Criar credenciais"
   c) Selecione "Chave de API"
   d) Você vai ver a chave (formato: AIzaSy...)
   e) Clique "Copiar" ou selecione e Ctrl+C
   f) COPIE AQUI NESTA CONVERSA

   ✅ Ação: QUANDO COPIAR, COLE AQUI NESTA CONVERSA

=== FASE 3: CRIAR .env.local ===

7. CONSOLIDAR CREDENCIAIS
   Quando você colar as credenciais acima, farei isso:
   a) Extrair os 6 campos do firebaseConfig
   b) Validar formato da API Key
   c) Gerar arquivo .env.local pronto
   d) Mostrar instruções do próximo passo

FORMATO ESPERADO QUANDO COLAR:

[FIREBASECONFIG]
(cole o bloco const firebaseConfig aqui)
[/FIREBASECONFIG]

[GEMINI_API_KEY]
AIzaSy...
[/GEMINI_API_KEY]

IMPORTANTE:
- Use os tags [FIREBASECONFIG] e [GEMINI_API_KEY]
- Isso me ajuda a processar corretamente
- Não altere os valores, copie exatamente como aparecem

QUANDO TERMINAR TUDO:
1. Cole as credenciais aqui
2. Eu vou gerar seu .env.local
3. Você vai para PASSO 5: npm install e firebase init
```

---

## 📋 RESUMO DO QUE VAI ACONTECER

```
Você:                           Gemini:
─────────────────────────────────────────
1. Abre Firebase
2. Habilita Firestore
3. Habilita Cloud Func
4. Habilita Hosting           Guia cada passo
5. Copia firebaseConfig
6. Cole aqui ───────────→ Valida formato
                         Salva credencial
                         Continua guiando

7. Abre Google Cloud
8. Habilita Gemini API
9. Cria API Key
10. Cole aqui ──────────→ Valida formato
                         Extrai dados
                         Gera .env.local

11. Recebe .env.local pronto!
```

---

## ✅ CHECKLIST

Quando estiver pronto:

```
[ ] Firestore Database habilitado
[ ] Cloud Functions habilitado
[ ] Hosting habilitado
[ ] firebaseConfig copiado e pronto para colar
[ ] Gemini API habilitado
[ ] API Key Gemini copiada e pronta para colar
[ ] Pronto para colar aqui no chat
```

---

## 🎯 COMEÇAR AGORA

1. **Copie TODO O TEXTO acima** (de ```até ```)
2. **Abra Gemini:** https://gemini.google.com
3. **Cole o prompt**
4. **Siga as instruções de Gemini**
5. **Quando pedir, cole as credenciais**
6. **Receba .env.local gerado!**

---

## 💡 DICA

Se tiver dúvida em qualquer passo:
- Diga para Gemini: "Não entendi o passo 3, pode detalhar?"
- Gemini vai fazer screenshots mentais e guiar melhor
- Ou volte para `PASSO_2_FIREBASE_VISUAL.md` para ver imagens

---

**PRONTO? Vá para Gemini e cole o prompt acima! 🚀**
```

---

## 🔗 LINKS DIRETOS (Para não perder)

**Firebase Console:**
```
https://console.firebase.google.com/u/0/project/tradutor-ia-21aee/overview
```

**Google Cloud Console:**
```
https://console.cloud.google.com
```

**Gemini (para colar o prompt):**
```
https://gemini.google.com
```

---

**Quando terminar com Gemini e tiver as credenciais, volte aqui e me dá! ✅**
