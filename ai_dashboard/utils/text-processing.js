import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from '@/utils/supabase/client';

// Initialize text splitter with specific configuration
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

// Function to process and split document content
export async function processDocumentContent(content, fileId, workspaceId, userId) {
  try {
    // Split the text into chunks
    const textChunks = await textSplitter.splitText(content);

    // Create document objects with metadata and location tracking
    const documents = textChunks.map((chunk, index) => ({
      pageContent: chunk,
      metadata: {
        fileId,
        workspaceId,
        userId,
        chunkIndex: index,
        location: `chunk-${index + 1}`, // Simple location tracking
        charLocation: {
          start: content.indexOf(chunk),
          end: content.indexOf(chunk) + chunk.length
        }
      },
    }));

    // Create vector store from documents
    const vectorStore = await MemoryVectorStore.fromDocuments(
      documents,
      new OpenAIEmbeddings()
    );

    // Store the processed chunks in Supabase
    const supabase = createClient();
    await supabase
      .from('document_chunks')
      .insert(documents.map(doc => ({
        content: doc.pageContent,
        file_id: fileId,
        workspace_id: workspaceId,
        user_id: userId,
        metadata: doc.metadata,
        location_data: doc.metadata.location,
        char_location: doc.metadata.charLocation
      })));

    return vectorStore;
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}

// Function to retrieve relevant chunks for a query
export async function retrieveRelevantChunks(query, fileId, workspaceId, userId) {
  try {
    const supabase = createClient();
    
    // Get stored chunks with location data
    const { data: chunks, error } = await supabase
      .from('document_chunks')
      .select('content, location_data, char_location')
      .eq('file_id', fileId)
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);

    if (error) throw error;

    // Create temporary vector store for search
    const documents = chunks.map(chunk => ({
      pageContent: chunk.content,
      metadata: { 
        fileId, 
        workspaceId, 
        userId,
        location: chunk.location_data,
        charLocation: chunk.char_location
      }
    }));

    const vectorStore = await MemoryVectorStore.fromDocuments(
      documents,
      new OpenAIEmbeddings()
    );

    // Perform similarity search
    const relevantDocs = await vectorStore.similaritySearch(query, 4);
    
    return relevantDocs;
  } catch (error) {
    console.error('Error retrieving chunks:', error);
    throw error;
  }
}

// Helper function to format citations
export function formatCitations(chunks) {
  return chunks.map((chunk, index) => ({
    id: index + 1,
    text: chunk.pageContent,
    location: chunk.metadata.location,
    charLocation: chunk.metadata.charLocation
  }));
} 