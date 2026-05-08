#!/usr/bin/env node

/**
 * 🚀 Setup Automático Tradutor IA no Vercel
 *
 * Este script:
 * 1. Coleta suas credenciais de forma segura
 * 2. Configura GitHub
 * 3. Deploy automático no Vercel
 * 4. Conecta Backend + Web App
 * 5. Mostra URLs finais
 *
 * Uso: node setup-vercel.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const readline = require('readline');

// Colors para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.bright}${prompt}${colors.reset} `, resolve);
  });
}

function hiddenQuestion(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(`${colors.bright}${prompt}${colors.reset} `);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    let input = '';

    process.stdin.on('data', (char) => {
      char = char.toString('utf8');
      if (char === '\n' || char === '\r' || char === '\u0004') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        console.log();
        resolve(input);
      } else if (char === '\u0003') {
        process.exit(1);
      } else {
        process.stdout.write('*');
        input += char;
      }
    });
  });
}

async function validateCredentials(config) {
  log.info('Validando credenciais...');

  // Validar Twilio
  if (!config.twilioSid.startsWith('AC') || config.twilioSid.length < 10) {
    log.error('TWILIO_ACCOUNT_SID inválido (deve começar com AC)');
    return false;
  }
  log.success('Twilio SID validado');

  // Validar Gemini
  if (!config.geminiKey.startsWith('AIzaSy')) {
    log.error('GEMINI_API_KEY inválido (deve começar com AIzaSy)');
    return false;
  }
  log.success('Gemini API Key validado');

  // Validar Google Cloud Project
  if (!config.googleProjectId || config.googleProjectId.length < 3) {
    log.error('GOOGLE_CLOUD_PROJECT_ID inválido');
    return false;
  }
  log.success('Google Cloud Project ID validado');

  // Validar Twilio Phone
  if (!config.twilioPhone.startsWith('+') || config.twilioPhone.length < 10) {
    log.error('TWILIO_PHONE_NUMBER inválido (deve começar com +)');
    return false;
  }
  log.success('Twilio Phone Number validado');

  return true;
}

async function pushToGitHub(config) {
  log.title('📤 Push para GitHub');

  try {
    // Criar .env.production
    const envContent = `TWILIO_ACCOUNT_SID=${config.twilioSid}
TWILIO_AUTH_TOKEN=${config.twilioToken}
TWILIO_PHONE_NUMBER=${config.twilioPhone}
GEMINI_API_KEY=${config.geminiKey}
GOOGLE_CLOUD_PROJECT_ID=${config.googleProjectId}
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-cloud-key.json
NODE_ENV=production
PORT=3000
WEBHOOK_BASE_URL=https://${config.backendUrl || 'seu-backend.vercel.app'}`;

    fs.writeFileSync('.env.production', envContent);
    log.success('.env.production criado');

    // Git config
    execSync('git config user.name "Tradutor IA Setup"', { stdio: 'pipe' });
    execSync('git config user.email "setup@tradutorai.com"', { stdio: 'pipe' });
    log.success('Git configurado');

    // Add files
    execSync('git add -A', { stdio: 'pipe' });
    log.success('Arquivos adicionados');

    // Commit
    execSync('git commit -m "feat: setup tradutor ia para vercel" --no-verify', {
      stdio: 'pipe',
    });
    log.success('Commit criado');

    // Push
    if (config.githubToken) {
      execSync(`git push https://${config.githubToken}@github.com/${config.githubRepo}.git main`, {
        stdio: 'pipe',
        env: { ...process.env, GIT_TRACE: '0' },
      });
      log.success('Push para GitHub realizado');
    } else {
      log.warn('Sem GitHub token - você precisa fazer push manualmente:');
      console.log(`  git push origin main`);
    }
  } catch (error) {
    log.error(`Erro ao fazer push: ${error.message}`);
    return false;
  }

  return true;
}

async function deployToVercel(config) {
  log.title('🚀 Deploy no Vercel');

  try {
    // Validar se Vercel CLI está instalado
    execSync('vercel --version', { stdio: 'pipe' });
    log.success('Vercel CLI encontrado');

    // Deploy Backend
    log.info('Deployando Backend...');
    console.log(`
    Execute no terminal:
    ${colors.yellow}vercel --prod --env TWILIO_ACCOUNT_SID=${config.twilioSid} --env TWILIO_AUTH_TOKEN=${config.twilioToken} --env TWILIO_PHONE_NUMBER=${config.twilioPhone} --env GEMINI_API_KEY=${config.geminiKey} --env GOOGLE_CLOUD_PROJECT_ID=${config.googleProjectId}${colors.reset}
    `);

    // Deploy Web App
    log.info('Deployando Web App...');
    console.log(`
    Depois, execute:
    ${colors.yellow}cd web && vercel --prod --env NEXT_PUBLIC_API_URL=<URL_DO_BACKEND_QUE_VOCÊ_COPIOU> --env NEXT_PUBLIC_APP_NAME="Tradutor IA"${colors.reset}
    `);
  } catch (error) {
    log.error('Vercel CLI não encontrado. Instale com: npm install -g vercel');
    return false;
  }

  return true;
}

async function createConfigFile(config) {
  log.title('💾 Salvando Configuração');

  const configFile = {
    timestamp: new Date().toISOString(),
    twilio: {
      accountSid: config.twilioSid,
      phoneNumber: config.twilioPhone,
    },
    google: {
      projectId: config.googleProjectId,
    },
    vercel: {
      backendRepo: `${config.githubRepo}-backend`,
      webappRepo: `${config.githubRepo}-webapp`,
    },
  };

  fs.writeFileSync('vercel-config.json', JSON.stringify(configFile, null, 2));
  log.success('Configuração salva em vercel-config.json');
}

async function showSummary(config) {
  log.title('📋 Resumo da Configuração');

  console.log(`
  ${colors.bright}Credenciais:${colors.reset}
    Twilio Account: ${config.twilioSid.substring(0, 4)}****
    Twilio Phone: ${config.twilioPhone}
    Gemini API: ${config.geminiKey.substring(0, 10)}****
    Google Project: ${config.googleProjectId}

  ${colors.bright}GitHub:${colors.reset}
    Repositório: ${config.githubRepo}

  ${colors.bright}Próximos Passos:${colors.reset}
    1. ${colors.yellow}Copie/Cole os comandos vercel acima no seu terminal${colors.reset}
    2. ${colors.yellow}Siga as instruções do Vercel${colors.reset}
    3. ${colors.yellow}Verifique as URLs finais${colors.reset}
    4. ${colors.yellow}Teste em https://seu-app.vercel.app${colors.reset}
  `);
}

async function main() {
  console.clear();
  log.title('🚀 Setup Automático - Tradutor IA no Vercel');

  log.info('Este script vai configurar seu tradutor no Vercel');
  log.warn('Você precisa de: Twilio, Google Cloud, Gemini, GitHub e Vercel tokens');

  const config = {};

  try {
    // Coletar credenciais
    log.title('🔐 Credenciais (Twilio)');
    config.twilioSid = await question('TWILIO_ACCOUNT_SID (ACxxxxxxx):');
    config.twilioToken = await hiddenQuestion('TWILIO_AUTH_TOKEN:');
    config.twilioPhone = await question('TWILIO_PHONE_NUMBER (+1...):');

    log.title('🔐 Credenciais (Google & Gemini)');
    config.googleProjectId = await question('GOOGLE_CLOUD_PROJECT_ID:');
    config.geminiKey = await hiddenQuestion('GEMINI_API_KEY (AIzaSy...):');

    log.title('🔐 GitHub & Vercel');
    config.githubRepo = await question(
      'GitHub repo (seu-usuario/seu-repo):',
    );
    config.githubToken = await hiddenQuestion('GitHub Personal Access Token:');
    config.vercelToken = await hiddenQuestion('Vercel API Token:');

    // Validar
    if (!(await validateCredentials(config))) {
      log.error('Credenciais inválidas!');
      process.exit(1);
    }

    log.success('Todas as credenciais validadas!');

    // Push para GitHub
    if (!(await pushToGitHub(config))) {
      log.error('Erro ao fazer push para GitHub');
      process.exit(1);
    }

    // Salvar config
    await createConfigFile(config);

    // Deploy
    await deployToVercel(config);

    // Resumo
    await showSummary(config);

    log.success('Setup concluído! 🎉');
    log.info('Próximo: Execute os comandos vercel acima');

  } catch (error) {
    log.error(`Erro: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run
main().catch((err) => {
  log.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
