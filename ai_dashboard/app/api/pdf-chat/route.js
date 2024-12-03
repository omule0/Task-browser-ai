import { createClient } from '@/utils/supabase/server';
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

export async function POST(request) {
  try {
    const { messages, fileId, generateQuestions } = await request.json();

    // Initialize Supabase client - make sure to await it
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
      modelName: "gpt-4o-mini",
      temperature: 0.7,
    });

    if (generateQuestions) {
      // Template for generating questions
      const questionTemplate = `Based on the following document content, generate 3 insightful questions that would help understand the key points of the document better. Format the response as a numbered list.

      Document content: {context}

      Generate 3 questions:`;

      const questionPrompt = PromptTemplate.fromTemplate(questionTemplate);

      const questionChain = RunnableSequence.from([
        {
          context: () => docContent.content,
        },
        questionPrompt,
        chatModel,
        new StringOutputParser()
      ]);

      const suggestedQuestions = await questionChain.invoke({});
      return new Response(JSON.stringify({ suggestedQuestions }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Regular chat template
    const TEMPLATE = `You are a helpful AI assistant that helps users understand PDF documents.
    Use the following document content to answer questions. If you don't know the answer based on the content, say so.
    
    Document content: {context}
    
    Current conversation:
    {chat_history}
    
    Human: {question}
    Assistant:`;

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    // Create the chain
    const chain = RunnableSequence.from([
      {
        context: () => docContent.content,
        chat_history: () => messages.slice(0, -1).map(m => `${m.role}: ${m.content}`).join('\n'),
        question: () => messages[messages.length - 1].content,
      },
      prompt,
      chatModel,
      new StringOutputParser()
    ]);

    // Generate response
    const response = await chain.invoke({});

    return new Response(JSON.stringify({ response }), {
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