import { createClient } from '@/utils/supabase/client';

export type Category = 'Business' | 'Marketing' | 'Research' | 'News' | 'Other';

export interface Template {
  id: string;
  title: string;
  category: Category;
  subtitle: string;
  prompt?: string;
  variables?: string[];
  is_custom?: boolean;
  user_id?: string;
  created_at?: string;
  tags?: string[];
}

const supabase = createClient();

// Built-in templates
const builtInTemplates: Template[] = [
  // Marketing Templates
  {
    id: 'marketing-1',
    title: 'Twitter / X Engagement Analysis',
    category: 'Marketing',
    subtitle: 'Marketing',
    prompt: 'Go to this user {X Profile URL}\nScroll through at least 10 recent posts. If some posts have done particularly well maybe deepdive into by clicking on the post and reading more in depth stuff. just click on the post.\nNote key engagement numbers (likes, comments, shares) for each post.\nSummarize overall engagement trends, maybe make a suggestion of what seems to work well and what doesnt.',
    variables: ['X Profile URL'],
    is_custom: false,
    tags: ['social-media', 'analytics', 'engagement'],
  },
  {
    id: 'marketing-2',
    title: 'Check News about Brand',
    category: 'Marketing',
    subtitle: 'Marketing',
    prompt: 'I need you to do a quick brand analysis.\nBrand Name: {Brand Name}\nOpen Google and perform a search for the brand name with no results older than {Maximum Article Age}. Use google search filters in the search string.\nQuickly scan the first page of results for notable mentions or sentiment. If any notable articles / websites read them fully.\nWrite a summary if it exists.',
    variables: ['Brand Name', 'Maximum Article Age'],
    is_custom: false,
    tags: ['brand', 'news', 'analysis'],
  },
  
  // Research Templates
  {
    id: 'research-1',
    title: 'Goto',
    category: 'Research',
    subtitle: 'Research',
    prompt: 'go to {website}, that\'s it',
    variables: ['website'],
    is_custom: false,
    tags: ['web', 'navigation'],
  },
  {
    id: 'research-2',
    title: 'Top Posts on Hacker News',
    category: 'Research',
    subtitle: 'Research',
    prompt: 'I want you to summarise 2 posts at the top of https://news.ycombinator.com\n\n**Process**\n\nFor each post:\n  - Click on the post title (this should bring you to a different website)\n    - tip: don\'t click the URL since it won\'t re-direct you\n  - On the website, read its full content and summarize\n  - Then, go back to the news feed, and click on the comments link for the post (https://news.ycombinator.com/item?id=X)\n  - Scan the full comments and summarize the community sentiment and main points raised by commenters\n\n**Report**\n\nCompile everything, returning links to the comments page for each post.',
    is_custom: false,
    tags: ['hacker-news', 'summarization', 'community'],
  },
  {
    id: 'research-3',
    title: 'Crypto Daily Digest',
    category: 'Research',
    subtitle: 'Research',
    prompt: 'Step 1: Retrieve the top {number of Crypto Coins} cryptocurrencies from CoinMarketCap, capturing key metrics such as current price, 24-hour percentage change, and trading volume.\nStep 2: Enhance this dataset by fetching historical trends and expert insights from CryptoCompare\nStep 3: Compile a comprehensive summary report that merges the quick statistics with deeper market analysis for each cryptocurrency, ready for periodic review.',
    variables: ['number of Crypto Coins'],
    is_custom: false,
    tags: ['crypto', 'market-analysis', 'daily-digest'],
  },
  {
    id: 'research-4',
    title: 'Top ML Papers',
    category: 'Research',
    subtitle: 'Research',
    prompt: 'Go to https://huggingface.co/papers and click through each of the top 5 papers.\n\nFor each paper:\n- Record the title, URL\n- Summarise the abstract\n- Highlight any papers relevant to {relevant topics}\n\nFinally, compile together a summary, ranked by relevance.',
    variables: ['relevant topics'],
    is_custom: false,
    tags: ['machine-learning', 'papers', 'research'],
  },
  
  // News Templates
  {
    id: 'news-1',
    title: 'Whats trending on X?',
    category: 'News',
    subtitle: 'News',
    prompt: 'Step 1: Extract the top {Number of Hashtags to explore} trending hashtags from X (twitter)\nStep 2: For each hashtag, collect a sample of recent tweets to capture the current conversation.\nStep 3: Produce a summary report on what is currently trending',
    variables: ['Number of Hashtags to explore'],
    is_custom: false,
    tags: ['trending', 'social-media', 'hashtags'],
  },
  {
    id: 'news-2',
    title: 'Right / Left Unbiased News Coverage',
    category: 'News',
    subtitle: 'News',
    prompt: 'Can you find me some news paper articles from both right and left outlets on {News Topic Of your Choice} on a very recent story and write a summary report on where they report differently, what they focus on and what their standpoint is. After reading a story assess right / leftwing based on https://www.allsides.com/media-bias/ratings after reading the article to put it into the right area of the left-right spectrum and check what is remaining out of those 2.\n\nPlease you choose autonomously the outlets but make sure one is right and one is left.\n\nAs a tip, if you encounter a paywall you can save the URL of the article you wanna read and use https://archive.ph to get around the paywall.',
    variables: ['News Topic Of your Choice'],
    is_custom: false,
    tags: ['news', 'bias-analysis', 'comparison'],
  },
  {
    id: 'news-3',
    title: 'Daily News Digest',
    category: 'News',
    subtitle: 'News',
    prompt: 'Workflow:\n\nStep 1: Navigate to {Your favorite News Website} News and identify the top 3 headlines on the homepage.\nStep 2: For each headline, click to read the full article and extract key details (facts, quotes, and statistics).\nStep 3: Navigate to {Your second favorite News Website} and use the search function to find related articles or expert commentary on each headline\'s topic.\nFinal Step: Compile a digest message that lists each headline with its summary and additional insights from both news sources, including links to both sources.',
    variables: ['Your favorite News Website', 'Your second favorite News Website'],
    is_custom: false,
    tags: ['news', 'daily-digest', 'headlines'],
  },

  // Business Templates
  {
    id: 'business-1',
    title: 'Company Sentiment Analysis',
    category: 'Business',
    subtitle: 'Business',
    prompt: 'Read through the top 2 news articles about my company: {Company Name}\n\nClick through each article and do the following:\n- Read the article fully.\n- If the article is not primarily focused on my company, go back and find a more relevant one.\n- Carefully note down relevant quotes with strong sentiment (positive or negative), if any.\n\nFinally, craft a summary:\n- Ranking each article from most positive, to neutral, to most negative sentiment.\n- Provide a link to each article and include quotes.\n- At the end of your summary, highlight any recurring themes across articles, good and bad.',
    variables: ['Company Name'],
    is_custom: false,
    tags: ['sentiment', 'company-analysis', 'news'],
  },

  // Other Templates
  {
    id: 'other-1',
    title: 'Research on a Person',
    category: 'Other',
    subtitle: 'Other',
    prompt: 'can you do some deep research about {Who are we researching}? Where did they go to school, where did they work, anything else notable to know about them?',
    variables: ['Who are we researching'],
    is_custom: false,
    tags: ['person-research', 'biography'],
  },
];

// Convert database template to frontend template
const convertDbTemplate = (dbTemplate: any): Template => {
  return {
    ...dbTemplate,
  };
};

// Get all templates (both built-in and custom)
export const getTemplates = async (userId?: string): Promise<Template[]> => {
  try {
    // Get custom templates from database
    let query = supabase
      .from('templates')
      .select('*')
      .eq('is_custom', true);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: customTemplates, error: customError } = await query;

    if (customError) throw customError;

    // Convert custom templates to frontend format
    const convertedCustomTemplates = customTemplates.map(convertDbTemplate);

    // Return combined templates
    return [...builtInTemplates, ...convertedCustomTemplates];
  } catch (error) {
    console.error('Error fetching templates:', error);
    return builtInTemplates; // Return built-in templates even if custom templates fail to load
  }
};

// Save a new template
export const saveTemplate = async (template: Omit<Template, 'id' | 'created_at'>): Promise<Template | null> => {
  try {
    const { data, error } = await supabase
      .from('templates')
      .insert([
        {
          title: template.title,
          category: template.category,
          subtitle: template.subtitle,
          prompt: template.prompt,
          variables: template.variables,
          is_custom: true,
          user_id: template.user_id,
          tags: template.tags || [],
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return convertDbTemplate(data);
  } catch (error) {
    console.error('Error saving template:', error);
    return null;
  }
};

// Delete a template
export const deleteTemplate = async (templateId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting template:', error);
    return false;
  }
};

// Update a template
export const updateTemplate = async (templateId: string, updates: Partial<Template>): Promise<Template | null> => {
  try {
    const { data, error } = await supabase
      .from('templates')
      .update(updates)
      .eq('id', templateId)
      .select()
      .single();

    if (error) throw error;

    return convertDbTemplate(data);
  } catch (error) {
    console.error('Error updating template:', error);
    return null;
  }
}; 