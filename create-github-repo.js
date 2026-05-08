#!/usr/bin/env node

/**
 * 🔧 Criar Repositório GitHub Automaticamente
 *
 * Cria novo repo "Tradutor_IA" na sua conta GitHub
 * Configura tudo e faz push da documentação
 *
 * Uso: node create-github-repo.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(`${colors.bright}${colors.blue}?${colors.reset} ${question} `, resolve);
  });
}

function log(type, msg) {
  const icons = {
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    info: `${colors.blue}ℹ${colors.reset}`,
    warn: `${colors.yellow}⚠${colors.reset}`,
  };
  console.log(`${icons[type]} ${msg}`);
}

function exec(cmd, silent = false) {
  try {
    const output = execSync(cmd, {
      stdio: silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createRepoViaCLI(owner, repoName, token) {
  // Tentar com GitHub CLI
  const cliResult = exec('gh --version', true);

  if (cliResult.success) {
    log('info', 'GitHub CLI encontrado, criando repo...');

    // Login com token
    execSync(`echo "${token}" | gh auth login --with-token`, {
      stdio: 'pipe',
      shell: true,
    });

    // Criar repo
    const createResult = exec(
      `gh repo create ${owner}/${repoName} --public --description "Tradutor de voz IA bidirecional com Twilio, Gemini e Google Cloud" --source=. --remote=origin --push`,
      true
    );

    if (createResult.success) {
      log('success', `Repositório criado: ${owner}/${repoName}`);
      return {
        success: true,
        url: `https://github.com/${owner}/${repoName}`,
      };
    }
  }

  return { success: false };
}

async function createRepoViaAPI(owner, repoName, token) {
  log('info', 'Criando repositório via GitHub API...');

  const https = require('https');

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: '/user/repos',
      method: 'POST',
      headers: {
        'User-Agent': 'Node.js',
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 201) {
            log('success', `Repositório criado: ${owner}/${repoName}`);
            resolve({
              success: true,
              url: response.html_url,
              sshUrl: response.ssh_url,
            });
          } else {
            log('error', `Erro: ${response.message}`);
            resolve({ success: false });
          }
        } catch (error) {
          resolve({ success: false });
        }
      });
    });

    req.on('error', (error) => {
      log('error', `Erro ao criar repo: ${error.message}`);
      resolve({ success: false });
    });

    const payload = JSON.stringify({
      name: repoName,
      description:
        'Tradutor de voz IA bidirecional com Twilio, Gemini e Google Cloud',
      private: false,
      auto_init: true,
    });

    req.write(payload);
    req.end();
  });
}

async function setupGitRemote(owner, repoName, token) {
  log('info', 'Configurando Git remoto...');

  // Remover remoto antigo se existir
  exec('git remote remove origin', true);

  // Adicionar novo remoto
  const remoteUrl = `https://${token}@github.com/${owner}/${repoName}.git`;
  const result = exec(`git remote add origin ${remoteUrl}`, true);

  if (!result.success) {
    log('error', 'Falha ao configurar git remote');
    return false;
  }

  log('success', 'Git remoto configurado');
  return true;
}

async function pushToNewRepo(token, owner, repoName) {
  log('info', 'Fazendo push da documentação...');

  // Git config
  exec('git config user.name "Tradutor IA"', true);
  exec('git config user.email "tradutor@ia.com"', true);

  // Git add
  exec('git add -A', true);

  // Git commit
  const commitResult = exec(
    'git commit -m "docs: documentação completa tradutor ia (aiox, vercel, bidirectional)" --no-verify',
    true
  );

  if (!commitResult.success) {
    log('warn', 'Nada para commitar ou erro');
  } else {
    log('success', 'Commit criado');
  }

  // Git push
  const pushUrl = `https://${token}@github.com/${owner}/${repoName}.git`;
  const pushResult = exec(`git push -u ${pushUrl} main`, true);

  if (!pushResult.success) {
    // Tentar com master
    const pushMasterResult = exec(`git push -u ${pushUrl} master`, true);
    if (!pushMasterResult.success) {
      log('error', 'Push falhou');
      return false;
    }
  }

  log('success', 'Documentação enviada!');
  return true;
}

async function main() {
  console.clear();
  console.log(`
${colors.bright}${colors.cyan}╔══════════════════════════════════════════════════════╗
║                                                      ║
║      🔧 CRIAR REPOSITÓRIO GITHUB AUTOMATICAMENTE    ║
║                                                      ║
║  Cria repo "Tradutor_IA" e sobe documentação       ║
║                                                      ║
╚══════════════════════════════════════════════════════╝${colors.reset}
  `);

  try {
    // Obter informações
    const owner = await prompt('GitHub username (seu-usuario):');
    const repoName = await prompt('Nome do repo (padrão: Tradutor_IA):') || 'Tradutor_IA';
    const token = await prompt('GitHub Personal Access Token (ghp_...):');

    if (!token.startsWith('ghp_')) {
      log('error', 'Token inválido! Deve começar com ghp_');
      process.exit(1);
    }

    log('info', `Criando repositório: ${owner}/${repoName}`);

    // Tentar criar via API
    const repoResult = await createRepoViaAPI(owner, repoName, token);

    if (!repoResult.success) {
      log('error', 'Falha ao criar repositório via API');
      log('info', 'Alternativa: crie manualmente em https://github.com/new');
      log('info', 'Depois execute novamente este script');
      process.exit(1);
    }

    // Configurar git remoto
    if (!(await setupGitRemote(owner, repoName, token))) {
      process.exit(1);
    }

    // Push
    if (!(await pushToNewRepo(token, owner, repoName))) {
      log('error', 'Falha ao fazer push');
      process.exit(1);
    }

    // Resumo
    console.log(`
${colors.bright}${colors.green}╔══════════════════════════════════════════════════════╗
║                                                      ║
║          ✅ REPOSITÓRIO CRIADO COM SUCESSO!        ║
║                                                      ║
╚══════════════════════════════════════════════════════╝${colors.reset}

${colors.bright}GitHub:${colors.reset}
  ${colors.cyan}${repoResult.url}${colors.reset}

${colors.bright}Arquivos adicionados:${colors.reset}
  ✓ Toda documentação do Tradutor IA
  ✓ Scripts (aiox-deploy.js, push-to-github.js)
  ✓ Configurações (next.config.js, tsconfig.json)
  ✓ Código fonte (backend + frontend)

${colors.bright}Próximo passo:${colors.reset}
  1. Acesse: ${colors.cyan}${repoResult.url}${colors.reset}
  2. Verifique a documentação
  3. Execute: node aiox-deploy.js
  4. Forneça credenciais
  5. Deploy automático no Vercel
  6. URLs finais aparecem

${colors.bright}${colors.cyan}Seu repositório está vivo! 🎉${colors.reset}
    `);

  } catch (error) {
    log('error', `Erro: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
