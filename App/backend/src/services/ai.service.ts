import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';

const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Other',
];

const CATEGORIES_STR = CATEGORIES.join(', ');

const PROMPT_TEMPLATE = (description: string) => 
  `Categorize this expense into one of the following categories: ${CATEGORIES_STR}. Expense: "${description}". Return only the category name from the list.`;

/**
 * Categorize using OpenAI
 */
const categorizeWithOpenAI = async (description: string): Promise<string | null> => {
  if (!config.openaiApiKey) return null;
  try {
    const openai = new OpenAI({ apiKey: config.openaiApiKey });
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: PROMPT_TEMPLATE(description) }],
      temperature: 0,
      max_tokens: 10,
    });
    return response.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('OpenAI Categorization Error:', error);
    return null;
  }
};

/**
 * Categorize using Google Gemini
 */
const categorizeWithGemini = async (description: string): Promise<string | null> => {
  if (!config.geminiApiKey) return null;
  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(PROMPT_TEMPLATE(description));
    const response = await result.response;
    return response.text().trim() || null;
  } catch (error) {
    console.error('Gemini Categorization Error:', error);
    return null;
  }
};

/**
 * Categorize using Anthropic Claude
 */
const categorizeWithClaude = async (description: string): Promise<string | null> => {
  if (!config.claudeApiKey) return null;
  try {
    const anthropic = new Anthropic({ apiKey: config.claudeApiKey });
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [{ role: 'user', content: PROMPT_TEMPLATE(description) }],
    });
    // @ts-ignore - Anthropic SDK type compatibility
    const content = response.content[0]?.text;
    return content?.trim() || null;
  } catch (error) {
    console.error('Claude Categorization Error:', error);
    return null;
  }
};

/**
 * Categorizes an expense description using available AI providers.
 * Tries providers in order: OpenAI -> Gemini -> Claude.
 * @param description The expense description.
 * @returns The detected category or 'Other' if all providers fail or are not configured.
 */
export const categorizeExpense = async (description: string): Promise<string> => {
  if (!description.trim()) return 'Other';

  // Try OpenAI first
  let category = await categorizeWithOpenAI(description);
  
  // Fallback to Gemini
  if (!category || !CATEGORIES.includes(category)) {
    category = await categorizeWithGemini(description);
  }

  // Fallback to Claude
  if (!category || !CATEGORIES.includes(category)) {
    category = await categorizeWithClaude(description);
  }

  // Final check and fallback
  if (category && CATEGORIES.includes(category)) {
    return category;
  }

  return 'Other';
};
