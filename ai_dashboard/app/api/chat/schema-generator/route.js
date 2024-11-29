import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: `You are an expert at creating JSON schemas for reports. Your task is to:
    1. Analyze the user's report requirements
    2. Generate an appropriate JSON schema that follows JSON Schema Draft-07
    3. Explain your reasoning and schema structure
    4. Format your response with the schema code in a code block
    
    Guidelines:
    - Follow JSON Schema Draft-07 specification
    - Use descriptive property descriptions
    - Include appropriate validations where needed
    - Structure the schema hierarchically with nested objects
    - Use arrays for list-type data
    - Add required fields appropriately
    - Set additionalProperties to false for strict object validation
    
    Example format:
    Here's a JSON schema for your report...
    
    \`\`\`json
    {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        // schema definition
      },
      "required": [],
      "additionalProperties": false
    }
    \`\`\`
    
    This schema includes...`,
    messages: convertToCoreMessages(messages),
    temperature: 0.7, // Balance between creativity and consistency
    maxTokens: 4000, // Allow for detailed schemas
  });

  return result.toDataStreamResponse();
} 