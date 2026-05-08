/**
 * Example Client for Tradutor IA Real-Time API
 *
 * This example demonstrates how to interact with the translator API
 * for initiating calls and testing translations.
 */

import axios from 'axios';

class TranslatorClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Initiate a real-time translated call
   */
  async initiateCall(params: {
    toNumber: string;
    fromNumber?: string;
    sourceLanguage?: string;
    targetLanguage?: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/calls/initiate`, {
        toNumber: params.toNumber,
        fromNumber: params.fromNumber || '+1234567890',
        sourceLanguage: params.sourceLanguage || 'pt-BR',
        targetLanguage: params.targetLanguage || 'en-US',
      });

      console.log('✅ Call initiated successfully!');
      console.log('Call SID:', response.data.data.callSid);
      console.log('Session ID:', response.data.data.sessionId);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Failed to initiate call:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Test translation without initiating a call
   */
  async testTranslation(params: {
    text: string;
    sourceLanguage?: string;
    targetLanguage?: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/calls/test-translation`, {
        text: params.text,
        sourceLanguage: params.sourceLanguage || 'pt-BR',
        targetLanguage: params.targetLanguage || 'en-US',
      });

      console.log('✅ Translation successful!');
      console.log('Original:', response.data.data.originalText);
      console.log('Translated:', response.data.data.translatedText);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Translation failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get session information
   */
  async getSession(sessionId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/calls/session/${sessionId}`);
      console.log('✅ Session info retrieved!');
      console.log(JSON.stringify(response.data.data, null, 2));
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Failed to retrieve session:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get server statistics
   */
  async getStats() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/calls/stats`);
      console.log('✅ Server stats retrieved!');
      console.log(JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to retrieve stats:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Check server health
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseUrl}/health`);
      console.log('✅ Server is healthy!');
      console.log(JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('❌ Server health check failed:', error.message);
      throw error;
    }
  }

  /**
   * Hangup a call
   */
  async hangupCall(callSid: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/calls/hangup/${callSid}`);
      console.log('✅ Call ended successfully!');
      console.log(response.data.message);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to end call:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Example usage
async function main() {
  const client = new TranslatorClient();

  console.log(`
╔════════════════════════════════════════════════════════╗
║    Tradutor IA Real-Time - Client Examples            ║
╚════════════════════════════════════════════════════════╝
  `);

  try {
    // 1. Check server health
    console.log('\n1️⃣  Checking server health...');
    await client.checkHealth();

    // 2. Test translation
    console.log('\n2️⃣  Testing translation...');
    await client.testTranslation({
      text: 'Olá, como você está? Tudo bem com você?',
      sourceLanguage: 'pt-BR',
      targetLanguage: 'en-US',
    });

    // 3. Test translation (English to Portuguese)
    console.log('\n3️⃣  Testing reverse translation...');
    await client.testTranslation({
      text: 'Hello! I am very happy to meet you.',
      sourceLanguage: 'en-US',
      targetLanguage: 'pt-BR',
    });

    // 4. Initiate a call
    console.log('\n4️⃣  Initiating a translated call...');
    const callResult = await client.initiateCall({
      toNumber: '+551199999999', // Recipient in Brazil
      fromNumber: '+1234567890', // Caller in US
      sourceLanguage: 'en-US',
      targetLanguage: 'pt-BR',
    });

    // 5. Get session info
    console.log('\n5️⃣  Retrieving session information...');
    await client.getSession(callResult.sessionId);

    // 6. Get server stats
    console.log('\n6️⃣  Getting server statistics...');
    await client.getStats();

    console.log(`
╔════════════════════════════════════════════════════════╗
║           All examples completed! 🎉                  ║
╚════════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    console.error('\n❌ Example execution failed:', error);
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  main();
}

export default TranslatorClient;
