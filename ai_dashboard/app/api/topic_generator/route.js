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

  const prompt = `Generate a concise topic description for a ${subType || documentType} that will analyze or discuss the following files: ${fileNames.join(', ')}. 
  Consider the file names as topics or themes to incorporate.
  The description should be between 3-12 words, clear and specific. 
  Focus on the main points you want the ${subType || documentType} to address.
  Note: Only provide the description, no additional text.`;

  const result = await streamText({
    model: groq('llama-3.1-70b-versatile'),
    temperature: 1,
    prompt,
  });

  return result.toDataStreamResponse();
}