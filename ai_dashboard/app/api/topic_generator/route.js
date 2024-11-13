import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  const { documentType, subType, selectedFiles } = await req.json();

  // Extract file names and clean them up
  const fileNames = selectedFiles.map(filePath => {
    const parts = filePath.split('/').pop().split('-');
    return parts.slice(2).join('-'); // Remove timestamp prefix
  });

  const prompt = `Generate a topic sentence for a ${subType || documentType} that will analyze or discuss the following files: ${fileNames.join(', ')}. 
  Consider the file names as topics or themes to incorporate.
  The topic sentence should be clear, specific, and between 100-200 characters.`;

  const result = await streamText({
    model: groq('llama-3.1-70b-versatile'),
    temperature: 1,
    prompt,
  });

  return result.toDataStreamResponse();
}