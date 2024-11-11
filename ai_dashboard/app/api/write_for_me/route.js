import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  const { documentType, subType } = await req.json();

  const prompt = `Write a brief description for a ${subType || documentType}. 
    The description should be professional, clear, and detailed enough to serve 
    as a starting point for creating the document. Keep it between 100-200 characters.`;

  const result = await streamText({
    model: groq('llama-3.1-70b-versatile'),
    system: 'You are a professional document writer.',
    prompt,
    maxSteps: 1,
  });

  return result.toDataStreamResponse();
}