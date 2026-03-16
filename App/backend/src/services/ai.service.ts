import OpenAI from 'openai';
import { config } from '../config';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Other',
].join(', ');

/**
 * Categorizes an expense description using OpenAI GPT.
 * @param description The expense description.
 * @returns The detected category or 'Other' if detection fails.
 */
export const categorizeExpense = async (description: string): Promise<string> => {
  if (!description.trim()) {
    return 'Other';
  }

  try {
    const prompt = `Categorize this expense into one of the following categories: ${CATEGORIES}. Expense: "${description}". Return only the category name.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      max_tokens: 10,
    });

    const category = response.choices[0]?.message?.content?.trim() || 'Other';

    // Validate if the returned category is one of the allowed ones
    if (CATEGORIES.includes(category)) {
      return category;
    }

    return 'Other';
  } catch (error) {
    console.error('Error categorizing expense with OpenAI:', error);
    // Fallback to 'Other' if the AI service fails
    return 'Other';
  }
};
