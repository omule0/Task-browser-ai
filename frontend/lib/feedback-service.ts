import { createClient } from '@/utils/supabase/client';
import { Feedback } from './types';

/**
 * Get the current page URL safely (works in both client and server)
 */
const getCurrentPageUrl = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  return window.location.href;
};

/**
 * Generate a simple session ID for anonymous users
 */
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Submit feedback to the database
 */
export async function submitFeedback(
  rating: number, 
  feedbackText?: string,
  pageUrl?: string
): Promise<Feedback | null> {
  try {
    const supabase = createClient();
    
    // Get current user (if logged in)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      throw new Error('Failed to get user session');
    }
    
    const userId = session?.user?.id;
    
    // Generate a session ID if user is not logged in
    const sessionId = !userId ? generateSessionId() : undefined;
    
    // Create the feedback entry
    const feedback: Omit<Feedback, 'id' | 'created_at' | 'updated_at'> = {
      rating,
      user_id: userId,
      feedback_text: feedbackText,
      session_id: sessionId,
      page_url: pageUrl || getCurrentPageUrl()
    };
    
    // Insert the feedback into Supabase
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedback)
      .select()
      .single();
      
    if (error) {
      console.error('Error submitting feedback:', error);
      throw new Error(error.message || 'Failed to submit feedback');
    }
    
    if (!data) {
      throw new Error('No data returned after feedback submission');
    }
    
    return data;
  } catch (error) {
    console.error('Error in submitFeedback:', error);
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
}

/**
 * Get all feedback for the current user
 */
export async function getUserFeedback(): Promise<Feedback[]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error getting user feedback:', error);
      throw new Error(error.message || 'Failed to get user feedback');
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getUserFeedback:', error);
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
} 