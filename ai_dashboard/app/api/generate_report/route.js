import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req) {
  try {
    const { schema, reportData } = await req.json();

    // Generate the report content
    const { textStream } = await streamText({
      model: openai('gpt-4o-mini'),
      system: `You are an expert report generator. Your task is to generate a report that follows the provided JSON schema structure exactly.
      Make sure all required fields are filled and the data types match the schema specifications.
      Generate realistic and coherent content that maintains consistency throughout the report.
      Use the provided file contents as context for generating the report.
      IMPORTANT: Return ONLY the JSON content without any markdown formatting or code blocks.`,
      messages: [
        {
          role: 'user',
          content: `Generate a report following this schema: ${JSON.stringify(schema)}
          Using this context from the files: ${reportData.files.join('\n\n')}
          Remember to return ONLY the JSON content, no markdown or code blocks.`
        }
      ],
      temperature: 0.7,
    });

    // Get the complete response
    let reportContent = '';
    for await (const chunk of textStream) {
      reportContent += chunk;
    }

    // Clean up the content by removing any markdown formatting
    const cleanContent = reportContent
      .replace(/```json\n?/g, '')  // Remove ```json
      .replace(/```\n?/g, '')      // Remove closing ```
      .trim();                     // Remove extra whitespace

    // Parse and validate the generated report
    try {
      const report = JSON.parse(cleanContent);
      return Response.json({
        success: true,
        report
      });
    } catch (parseError) {
      console.error('Failed to parse report:', parseError);
      console.error('Content:', cleanContent); // Log the content for debugging
      return Response.json(
        { 
          error: 'Generated content is not valid JSON',
          content: cleanContent // Include the content in error response for debugging
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return Response.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
} 