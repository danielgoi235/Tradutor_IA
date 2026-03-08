import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
}

// Cache simples em memória
const translationCache = new Map<string, string>();

async function translateText(req: TranslationRequest): Promise<string> {
  const cacheKey = `${req.sourceLang}-${req.targetLang}-${req.text}`;

  // Check cache
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey) || req.text;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Traduza este texto de ${req.sourceLang} para ${req.targetLang}. Responda APENAS com a tradução, sem explicações:\n\n"${req.text}"`;

    const result = await model.generateContent(prompt);
    const translated = result.response.text().trim();

    // Cache result
    translationCache.set(cacheKey, translated);

    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    return req.text; // Return original if translation fails
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Health check
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      message: 'Tradutor IA Chat Backend está vivo!',
      timestamp: new Date().toISOString(),
    });
  }

  // Translation endpoint
  if (req.method === 'POST') {
    try {
      const { text, sourceLang, targetLang } = req.body as TranslationRequest;

      if (!text || !sourceLang || !targetLang) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const translated = await translateText({ text, sourceLang, targetLang });

      return res.status(200).json({
        originalText: text,
        translatedText: translated,
        sourceLang,
        targetLang,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Translation failed' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
