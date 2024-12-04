import { createClient } from '@/utils/supabase/server';
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { processDocumentContent, retrieveRelevantChunks, formatCitations } from '@/utils/text-processing';

export async function POST(request) {
  try {
    const { messages, fileId, workspaceId, userId, initialGreeting } = await request.json();

    // Initialize Supabase client
    const supabase = await createClient();

    // Get document content
    const { data: docContent, error: docError } = await supabase
      .from('document_content')
      .select('content')
      .eq('file_path', fileId)
      .single();

    if (docError) {
      console.error('Document content error:', docError);
      throw new Error('Failed to retrieve document content');
    }

    if (!docContent) {
      throw new Error('No content found for this document');
    }

    // Initialize chat model
    const chatModel = new ChatOpenAI({
      modelName: "gpt-4",
      temperature: 0.7,
    });

    // Process document if it's the initial greeting
    if (initialGreeting) {
      await processDocumentContent(docContent.content, fileId, workspaceId, userId);

      // Template for initial greeting with overview
      const overviewTemplate = `Analyze the following document content and provide:
      1. A clear, concise overview of its main points and purpose (2-3 sentences)
      2. Three insightful questions that would help understand the key aspects of the document

      Document content: {context}

      Respond in this format:
      OVERVIEW: [Your overview here]

      SUGGESTED QUESTIONS:
      1. [First question]
      2. [Second question]
      3. [Third question]`;

      const overviewPrompt = PromptTemplate.fromTemplate(overviewTemplate);

      const overviewChain = RunnableSequence.from([
        {
          context: () => docContent.content,
        },
        overviewPrompt,
        chatModel,
        new StringOutputParser()
      ]);

      const response = await overviewChain.invoke({});
      
      // Parse the response to extract questions
      const parts = response.split('SUGGESTED QUESTIONS:');
      const overview = parts[0].replace('OVERVIEW:', '').trim();
      const questions = parts[1]
        ?.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) || [];

      return new Response(JSON.stringify({ 
        response: overview,
        suggestedQuestions: questions 
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // For regular chat messages, retrieve relevant chunks
    const lastMessage = messages[messages.length - 1].content;
    const relevantChunks = await retrieveRelevantChunks(lastMessage, fileId, workspaceId, userId);
    const citations = formatCitations(relevantChunks);

    // Regular chat template
    const TEMPLATE = `You are a helpful AI assistant that helps users understand PDF documents.
    Use the following relevant document sections to answer questions. If you don't know the answer based on the content, say so.
    
    Relevant sections:
    {context}
    
    Current conversation:
    {chat_history}
    
    Human: {question}

    Important Instructions:
    1. Base your answer only on the provided relevant sections
    2. Include inline citations using [n] format, where n is the citation number
    3. If you quote directly, use quotation marks and include the citation
    4. At the end of your response, list the sources used under a "Sources:" section
    
    Assistant:`;

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    // Create the chain
    const chain = RunnableSequence.from([
      {
        context: () => relevantChunks.map((doc, i) => 
          `[${i + 1}] ${doc.pageContent}`
        ).join('\n\n'),
        chat_history: () => messages.slice(0, -1).map(m => `${m.role}: ${m.content}`).join('\n'),
        question: () => lastMessage,
      },
      prompt,
      chatModel,
      new StringOutputParser()
    ]);

    // Generate response
    const response = await chain.invoke({});

    return new Response(JSON.stringify({ 
      response,
      citations 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}