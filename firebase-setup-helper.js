#!/usr/bin/env node

/**
 * Firebase Setup Helper
 * Abre todas as URLs necessárias e guia você passo-a-passo
 */

const { exec } = require('child_process');
const readline = require('readline');

const FIREBASE_CONSOLE_URL = 'https://console.firebase.google.com';
const GOOGLE_CLOUD_CONSOLE_URL = 'https://console.cloud.google.com';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function openUrl(url) {
  const platform = process.platform;
  let command;

  if (platform === 'win32') {
    command = `start ${url}`;
  } else if (platform === 'darwin') {
    command = `open ${url}`;
  } else {
    command = `xdg-open ${url}`;
  }

  exec(command, (error) => {
    if (error) {
      console.log(`⚠️ Não consegui abrir. Abra manualmente: ${url}`);
    }
  });
}

async function main() {
  console.clear();
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║         🚀 FIREBASE SETUP HELPER - PASSO A PASSO            ║
║                                                              ║
║  Este script abre os consoles e guia você na configuração   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);

  console.log(`
⚠️  IMPORTANTE: Faça login com sua conta Google agora!

Se você NÃO está logado no Firebase, você será redirecionado
para fazer login. Isso é normal.

  `);

  await question('Pressione ENTER quando tiver uma conta Google pronta...');

  // PASSO 1: Firebase
  console.clear();
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                   PASSO 1: CRIAR PROJETO                    ║
╚══════════════════════════════════════════════════════════════╝

Vou abrir Firebase Console agora...
  `);

  openUrl(FIREBASE_CONSOLE_URL);

  console.log(`
✅ Abri: ${FIREBASE_CONSOLE_URL}

FAÇA ISSO NO NAVEGADOR:
  1. Faça login se necessário
  2. Clique em "Criar projeto"
  3. Digite: tradutor-ia
  4. Aceite os termos
  5. Clique "Criar"
  6. Aguarde o projeto ser criado (~2 minutos)

  `);

  await question('Pressione ENTER quando o projeto "tradutor-ia" estiver criado...');

  // PASSO 2: Firestore
  console.clear();
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              PASSO 2: CRIAR FIRESTORE DATABASE              ║
╚══════════════════════════════════════════════════════════════╝

Você já está no Firebase Console.

FAÇA ISSO:
  1. Na esquerda, clique em "Firestore Database" (pode estar em "Build")
  2. Clique "Criar banco de dados"
  3. Modo: "Iniciar no modo de teste"
  4. Localização: "us-central1"
  5. Clique "Criar"
  6. Aguarde criação (~1 minuto)

  `);

  await question('Pressione ENTER quando Firestore estiver criado...');

  // PASSO 3: Cloud Functions
  console.clear();
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║             PASSO 3: HABILITAR CLOUD FUNCTIONS              ║
╚══════════════════════════════════════════════════════════════╝

FAÇA ISSO:
  1. Na esquerda, clique em "Cloud Functions" (em "Build")
  2. Clique "HABILITAR" (pode pedir para habilitar a API)
  3. Aguarde alguns segundos
  4. Pode fechar essa abinha

  `);

  await question('Pressione ENTER quando Cloud Functions estiver habilitado...');

  // PASSO 4: Hosting
  console.clear();
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                PASSO 4: HABILITAR HOSTING                   ║
╚══════════════════════════════════════════════════════════════╝

FAÇA ISSO:
  1. Na esquerda, clique em "Hosting" (em "Build")
  2. Clique "Começar"
  3. Pode deixar como está, vamos usar via CLI depois

  `);

  await question('Pressione ENTER quando Hosting estiver habilitado...');

  // PASSO 5: Copiar Credenciais
  console.clear();
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║             PASSO 5: COPIAR CREDENCIAIS FIREBASE            ║
╚══════════════════════════════════════════════════════════════╝

Este é o passo IMPORTANTE!

FAÇA ISSO:
  1. Na esquerda, clique em "Configurações do projeto" (⚙️)
  2. Role para baixo até "Seus aplicativos"
  3. Você verá "Aplicativos da web"
  4. Se não existir nenhum, clique "<>" para registrar
  5. Você vai ver um código como:

     const firebaseConfig = {
       apiKey: "AIzaSy...",
       authDomain: "tradutor-ia.firebaseapp.com",
       projectId: "tradutor-ia",
       storageBucket: "tradutor-ia.appspot.com",
       messagingSenderId: "123456789",
       appId: "1:123456789:web:abc123def456"
     };

  6. COPIE ESSE CÓDIGO (Ctrl+C)

  `);

  const firebaseConfig = await question('Cole aqui o firebaseConfig (Ctrl+V): ');

  // Validar formato
  if (!firebaseConfig.includes('apiKey') || !firebaseConfig.includes('projectId')) {
    console.log('\n❌ Pareça que você não colou o firebaseConfig corretamente.');
    console.log('Tente novamente: deve incluir apiKey, projectId, etc.');
    process.exit(1);
  }

  // Salvar credenciais
  const fs = require('fs');
  const path = require('path');
  const tempFile = path.join(process.cwd(), '.firebase-temp.js');

  fs.writeFileSync(tempFile, `// Firebase Credentials (Salve em .env.local)\n${firebaseConfig}`);

  console.log(`
✅ Credenciais salvas temporariamente em: ${tempFile}

  `);

  // PASSO 6: Google Cloud
  console.clear();
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              PASSO 6: HABILITAR GEMINI API                  ║
╚══════════════════════════════════════════════════════════════╝

Vou abrir Google Cloud Console agora...
  `);

  openUrl(GOOGLE_CLOUD_CONSOLE_URL);

  console.log(`
✅ Abri: ${GOOGLE_CLOUD_CONSOLE_URL}

FAÇA ISSO:
  1. Se pedido, selecione o projeto "tradutor-ia"
  2. Na barra de pesquisa (topo), digite: "Gemini API"
  3. Clique em "Gemini API" (pode aparecer como "Generative AI API")
  4. Clique "HABILITAR"
  5. Aguarde alguns segundos

  `);

  await question('Pressione ENTER quando Gemini API estiver habilitado...');

  // PASSO 7: API Key
  console.clear();
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║               PASSO 7: CRIAR API KEY GEMINI                 ║
╚══════════════════════════════════════════════════════════════╝

FAÇA ISSO:
  1. Na esquerda, clique em "Credenciais"
  2. Clique em "Criar credenciais" (topo)
  3. Selecione "Chave de API"
  4. Você vai ver uma mensagem: "API key criada"
  5. Clique no ícone de cópia (ou selecione e copie)
  6. A chave tem este formato:

     AIzaSy... (começa com AIzaSy)

  `);

  const geminiKey = await question('Cole aqui sua Gemini API Key: ');

  if (!geminiKey.startsWith('AIzaSy')) {
    console.log('\n❌ Chave inválida. Deve começar com "AIzaSy".');
    process.exit(1);
  }

  // Salvar ambas
  console.clear();
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                  ✅ SETUP COMPLETO!                         ║
╚══════════════════════════════════════════════════════════════╝

Suas credenciais foram salvas em: ${tempFile}

PRÓXIMO PASSO: Criar arquivo .env.local

Vou gerar seu .env.local agora...

  `);

  // Gerar .env.local
  const envContent = `# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=${extractApiKey(firebaseConfig)}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tradutor-ia.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tradutor-ia
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tradutor-ia.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${extractSenderId(firebaseConfig)}
NEXT_PUBLIC_FIREBASE_APP_ID=${extractAppId(firebaseConfig)}

# Gemini API Key
NEXT_PUBLIC_GEMINI_API_KEY=${geminiKey}
`;

  const envPath = path.join(process.cwd(), '.env.local');
  fs.writeFileSync(envPath, envContent);

  console.log(`
✅ Arquivo criado: ${envPath}

CONTEÚDO (não compartilhe isso!):
${envContent}

⚠️  IMPORTANTE: NUNCA comita .env.local no Git!
    Ele já está em .gitignore (está seguro).

  `);

  await question('Pressione ENTER para continuar...');

  // Limpeza
  if (fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
  }

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                  🎉 TUDO PRONTO!                            ║
╚══════════════════════════════════════════════════════════════╝

Seu .env.local foi criado com sucesso!

PRÓXIMOS PASSOS:
  1. Feche este script (CTRL+C)
  2. Execute: npm install
  3. Execute: firebase init
  4. Execute: npm run build

  `);

  rl.close();
}

function extractApiKey(config) {
  const match = config.match(/apiKey:\s*"([^"]+)"/);
  return match ? match[1] : 'SEU_API_KEY';
}

function extractSenderId(config) {
  const match = config.match(/messagingSenderId:\s*"([^"]+)"/);
  return match ? match[1] : 'SEU_SENDER_ID';
}

function extractAppId(config) {
  const match = config.match(/appId:\s*"([^"]+)"/);
  return match ? match[1] : 'SEU_APP_ID';
}

main().catch(console.error);
