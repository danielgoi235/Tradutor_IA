#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function setup() {
  console.log(`
╔════════════════════════════════════════════════════════╗
║   Tradutor IA Real-Time - Setup Wizard               ║
╚════════════════════════════════════════════════════════╝
  `);

  try {
    const answers = {
      twilioAccountSid: await question('Twilio Account SID: '),
      twilioAuthToken: await question('Twilio Auth Token: '),
      twilioPhoneNumber: await question('Twilio Phone Number: '),
      geminiApiKey: await question('Gemini API Key: '),
      googleCredentialsPath: await question(
        'Google Cloud Credentials JSON path (default: ./credentials/google-cloud-key.json): '
      ) || './credentials/google-cloud-key.json',
      googleCloudProjectId: await question('Google Cloud Project ID: '),
      redisUrl: await question('Redis URL (default: redis://localhost:6379): ') || 'redis://localhost:6379',
      port: await question('Server Port (default: 3000): ') || '3000',
      nodeEnv: await question('Environment (development/production, default: development): ') || 'development',
    };

    // Create .env file
    const envContent = `# Twilio Configuration
TWILIO_ACCOUNT_SID=${answers.twilioAccountSid}
TWILIO_AUTH_TOKEN=${answers.twilioAuthToken}
TWILIO_PHONE_NUMBER=${answers.twilioPhoneNumber}

# Google Cloud Configuration
GOOGLE_APPLICATION_CREDENTIALS=${answers.googleCredentialsPath}
GOOGLE_CLOUD_PROJECT_ID=${answers.googleCloudProjectId}

# Gemini API Configuration
GEMINI_API_KEY=${answers.geminiApiKey}

# Redis Configuration
REDIS_URL=${answers.redisUrl}

# Server Configuration
PORT=${answers.port}
NODE_ENV=${answers.nodeEnv}

# Logging
LOG_LEVEL=debug
`;

    fs.writeFileSync(path.join(__dirname, '..', '.env'), envContent);
    console.log('\n✅ .env file created successfully!');

    // Create credentials directory
    const credDir = path.join(__dirname, '..', 'credentials');
    if (!fs.existsSync(credDir)) {
      fs.mkdirSync(credDir, { recursive: true });
      console.log('✅ Credentials directory created!');
    }

    console.log(`
╔════════════════════════════════════════════════════════╗
║              Setup Complete! 🎉                       ║
╠════════════════════════════════════════════════════════╣
║ Next steps:                                           ║
║ 1. Place your Google Cloud key.json in:               ║
║    ${answers.googleCredentialsPath}
║                                                      ║
║ 2. Install dependencies:                             ║
║    npm install                                       ║
║                                                      ║
║ 3. Build TypeScript:                                 ║
║    npm run build                                     ║
║                                                      ║
║ 4. Start the server:                                 ║
║    npm start                                         ║
║                                                      ║
║ 5. Test the API:                                     ║
║    curl http://localhost:${answers.port}/health           ║
╚════════════════════════════════════════════════════════╝
    `);

    rl.close();
  } catch (error) {
    console.error('Setup failed:', error);
    rl.close();
    process.exit(1);
  }
}

setup();
