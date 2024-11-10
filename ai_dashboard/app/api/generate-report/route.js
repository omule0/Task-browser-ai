import { createClient } from '@/utils/supabase/server';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';

export async function POST(req) {
  try {
    const { template, contents, workspaceId } = await req.json();

    // Initialize text splitter with smaller chunks for GPT-4-mini
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000, 
      chunkOverlap: 300, 
    });

    // Split all contents into chunks
    const chunks = [];
    for (const content of contents) {
      const contentChunks = await textSplitter.splitText(content);
      chunks.push(...contentChunks);
    }

    // Initialize ChatOpenAI with GPT-4-mini
    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0,
      maxTokens: 500,
    });

    // Template configurations
    const templateConfig = {
      'executive-summary': {
        systemPrompt: `You are a professional report writer. Analyze the provided content and create a summary that:
          - Identifies key findings
          - Highlights main insights
          - Provides actionable recommendations
          Create a cohesive response that can be combined with other summaries.`,
        template: `Analyze this content and provide a summary:\n\n{text}`,
      },
      'detailed-analysis': {
        systemPrompt: `You are a detailed analyst. Create a comprehensive analysis including:
          - In-depth findings
          - Supporting evidence
          - Detailed recommendations
          - Risk analysis
          Format with clear headings and structured sections.`,
        template: `Provide a detailed analysis of this content:\n\n{text}`,
      }
    };

    // Process chunks sequentially
    const processChunk = async (chunk) => {
      const chain = RunnableSequence.from([
        PromptTemplate.fromTemplate(templateConfig[template].template),
        model,
        new StringOutputParser(),
      ]);

      return await chain.invoke({ text: chunk });
    };

    // Process all chunks sequentially
    const processedChunks = [];
    for (const chunk of chunks) {
      const result = await processChunk(chunk);
      processedChunks.push(result);
    }

    // Clean up and combine the processed chunks
    const finalReport = processedChunks
      .join('\n\n')
      .replace(/Executive Summary:?\s*/gi, '')
      .replace(/(?:\n\s*){3,}/g, '\n\n')
      .trim();

    // Return the generated report
    return new Response(finalReport, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate report',
        details: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}