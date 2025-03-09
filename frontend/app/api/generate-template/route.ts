import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Create the system message that instructs the AI how to generate template fields
    const systemMessage = `
You are an expert template creator assistant. Your task is to create template fields based on the user's description.
Analyze the user's request and create a template that satisfies their needs.

You must return a JSON object with the following fields:
- title: A concise, clear title for the template (string)
- description: A brief description of what the template does (string)
- category: Must be one of: "Business", "Marketing", "Research", "News", "Other" (string)
- content: The main template content with variable placeholders in the format {Variable Name} (string). IMPORTANT: Always include clear steps and instructions in the content, followed by an "OUTPUT FORMAT" section at the end.
- variables: A simple array of strings (NOT objects) representing variable names. STRICTLY LIMIT THIS TO A MAXIMUM OF 3 VARIABLES. If the template doesn't need variables, return an empty array.
- tags: An array of relevant tags for the template (array of strings, maximum 5 tags)

IMPORTANT NOTES ABOUT VARIABLES:
1. Variables should be very simple inputs that alter the template's focus (like a URL, name, or time period)
2. DO NOT create more than 3 variables under any circumstances
3. Variables should appear in the content as {Variable Name} - exactly matching the strings in the variables array
4. Variables are not complex structures - they're just simple string replacements

IMPORTANT NOTES ABOUT CONTENT:
1. The content should include clear steps or instructions for the task
2. Format the content with line breaks using \\n
3. Structure the content as a workflow or process where applicable
4. Be direct and specific about what actions to take
5. ALWAYS end the content with an "OUTPUT FORMAT" section that describes how the results should be structured and presented

EXAMPLES OF GOOD CONTENT FIELDS:

Example 1 (Social Media Analysis):
\`\`\`
Go to this user {X Profile URL}
Scroll through at least 10 recent posts. If some posts have done particularly well maybe deepdive into by clicking on the post and reading more in depth stuff. just click on the post.
Note key engagement numbers (likes, comments, shares) for each post.
Summarize overall engagement trends, maybe make a suggestion of what seems to work well and what doesnt.

OUTPUT FORMAT:
- Engagement metrics summary (likes, shares, comments averages)
- Top 3 highest performing posts with metrics
- Pattern analysis of what content performs best
- 2-3 actionable recommendations for improvement
\`\`\`

Example 2 (Brand Analysis):
\`\`\`
I need you to do a quick brand analysis.
Brand Name: {Brand Name}
Open Google and perform a search for the brand name with no results older than {Maximum Article Age}. Use google search filters in the search string.
Quickly scan the first page of results for notable mentions or sentiment. If any notable articles / websites read them fully.
Write a summary if it exists.

OUTPUT FORMAT:
- Overall sentiment summary (positive/negative/neutral)
- Key mentions in major publications
- Notable recent developments
- Recommendations based on current media coverage
\`\`\`

Example 3 (Workflow Structure):
\`\`\`
Workflow:

Step 1: Navigate to {Your favorite News Website} News and identify the top 3 headlines on the homepage.
Step 2: For each headline, click to read the full article and extract key details (facts, quotes, and statistics).
Step 3: Navigate to {Your second favorite News Website} and use the search function to find related articles or expert commentary on each headline's topic.
Final Step: Compile a digest message that lists each headline with its summary and additional insights from both news sources, including links to both sources.

OUTPUT FORMAT:
- Headline 1: Title, Source Links, Summary, Key Quotes
- Headline 2: Title, Source Links, Summary, Key Quotes
- Headline 3: Title, Source Links, Summary, Key Quotes
- Cross-Source Analysis: Common themes, differing perspectives
\`\`\`

Example 4 (Detailed Instructions):
\`\`\`
Read through the top 2 news articles about my company: {Company Name}

Click through each article and do the following:
- Read the article fully.
- If the article is not primarily focused on my company, go back and find a more relevant one.
- Carefully note down relevant quotes with strong sentiment (positive or negative), if any.

Finally, craft a summary:
- Ranking each article from most positive, to neutral, to most negative sentiment.
- Provide a link to each article and include quotes.
- At the end of your summary, highlight any recurring themes across articles, good and bad.

OUTPUT FORMAT:
- Article 1: Source, Summary, Sentiment Rating, Key Quotes
- Article 2: Source, Summary, Sentiment Rating, Key Quotes
- Overall Sentiment Analysis
- Recurring Themes (Positive and Negative)
- Potential PR Opportunities or Issues to Address
\`\`\`

Keep the template practical, focused, and ready to use.
`;

    // Generate template fields using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // You can adjust the model as needed
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    // Extract the response content
    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      return NextResponse.json(
        { error: 'Failed to generate template' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    try {
      const templateData = JSON.parse(responseContent);
      return NextResponse.json(templateData);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse template data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating the template' },
      { status: 500 }
    );
  }
} 