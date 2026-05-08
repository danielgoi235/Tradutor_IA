#!/usr/bin/env node

/**
 * 📤 Push Automático para GitHub
 *
 * Sobe TODA a documentação para seu repo do GitHub
 * Uso: node push-to-github.js
 */

const { execSync } = require('child_process');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
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

async function main() {
  console.clear();
  console.log(`
${colors.bright}${colors.cyan}╔══════════════════════════════════════════════════════╗
║                                                      ║
║         📤 PUSH DOCUMENTAÇÃO PARA GITHUB             ║
║                                                      ║
║  Sobe toda documentação do Tradutor IA para repo    ║
║                                                      ║
╚══════════════════════════════════════════════════════╝${colors.reset}
  `);

  try {
    // Obter GitHub token
    const token = await prompt('GitHub Personal Access Token (ghp_...):');

    if (!token.startsWith('ghp_')) {
      log('error', 'Token inválido! Deve começar com ghp_');
      process.exit(1);
    }

    log('info', 'Configurando Git...');
    exec('git config user.name "Tradutor IA Docs"', true);
    exec('git config user.email "docs@tradutorai.com"', true);
    log('success', 'Git configurado');

    log('info', 'Adicionando arquivos...');
    exec('git add -A', true);
    log('success', 'Arquivos adicionados');

    log('info', 'Criando commit...');
    const commitResult = exec(
      'git commit -m "docs: adicionar documentação completa do tradutor ia (aiox deploy, setup, guias)" --no-verify',
      true
    );

    if (!commitResult.success) {
      log('error', 'Commit falhou ou nada para commitar');
      process.exit(1);
    }
    log('success', 'Commit criado');

    log('info', 'Fazendo push para GitHub...');

    // Obter remote origin
    const remoteResult = exec('git config --get remote.origin.url', true);
    let repoUrl = remoteResult.output?.trim();

    if (!repoUrl) {
      repoUrl = await prompt('URL do repositório (https://github.com/...):');
    }

    // Extrair usuario/repo
    const match = repoUrl.match(/github\.com[/:]([\w-]+)\/([\w.-]+)/);
    if (!match) {
      log('error', 'URL do repositório inválida!');
      process.exit(1);
    }

    const [, user, repo] = match;
    const pushUrl = `https://${token}@github.com/${user}/${repo}.git`;

    // Push
    const pushResult = exec(`git push ${pushUrl} main`, true);

    if (!pushResult.success) {
      log('error', `Push falhou: ${pushResult.error}`);
      process.exit(1);
    }

    log('success', 'Push para GitHub concluído!');

    console.log(`
${colors.bright}✨ Documentação enviada com sucesso!${colors.reset}

${colors.bright}GitHub:${colors.reset}
  https://github.com/${user}/${repo}

${colors.bright}Arquivos adicionados:${colors.reset}
  ✓ README.md - Overview geral
  ✓ BIDIRECTIONAL_GUIDE.md - Como funciona
  ✓ COST_OPTIMIZATION.md - Economizar custos
  ✓ AIOX_DEPLOY.md - Automação AIOX
  ✓ VERCEL_DEPLOY_PASSO_A_PASSO.md - Deploy manual
  ✓ COMPLETE_SETUP.md - Setup completo
  ✓ START_HERE.md - Comece rápido
  ✓ INTERNATIONAL_SETUP.md - Brasil/EUA/Europa
  ✓ DEPLOYMENT.md - Deploy em produção
  ✓ WEB_DEPLOYMENT.md - Deploy web app
  ✓ COST_OPTIMIZATION.md - Otimizações
  ✓ E muito mais!

${colors.bright}Próximo passo:${colors.reset}
  1. Execute: node aiox-deploy.js
  2. Forneça credenciais
  3. Deploy automático no Vercel
  4. URLs finais aparecem

${colors.bright}${colors.cyan}Sua documentação está no GitHub! 🎉${colors.reset}
    `);

  } catch (error) {
    log('error', `Erro: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
