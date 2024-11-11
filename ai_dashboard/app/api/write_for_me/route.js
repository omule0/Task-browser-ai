import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  const { documentType, subType } = await req.json();

  const prompt = `generate a topic sentence for ${subType || documentType}. Keep it between 100-200 characters.`;

  const result = await streamText({
    model: groq('llama-3.1-70b-versatile'),
    temperature: 1,
    prompt,
  });

  return result.toDataStreamResponse();
}