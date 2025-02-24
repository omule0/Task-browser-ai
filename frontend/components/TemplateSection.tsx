import { IconBriefcase, IconChartBar, IconSearch, IconNews, IconDots, IconBrandTwitter, IconUser, IconX, IconPlayerPlay } from '@tabler/icons-react';
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

type Category = 'Business' | 'Marketing' | 'Research' | 'News' | 'Other';

interface Template {
  id: string;
  icon: React.ReactNode;
  title: string;
  category: Category;
  subtitle: string;
  prompt?: string;
  variables?: string[];
}

const templates: Template[] = [
  // Marketing Templates
  {
    id: 'marketing-1',
    icon: <IconBrandTwitter className="w-6 h-6 text-purple-400" />,
    title: 'Twitter / X Engagement Analysis',
    category: 'Marketing',
    subtitle: 'Marketing',
    prompt: 'Go to this user {X Profile URL}\nScroll through at least 10 recent posts. If some posts have done particularly well maybe deepdive into by clicking on the post and reading more in depth stuff. just click on the post.\nNote key engagement numbers (likes, comments, shares) for each post.\nSummarize overall engagement trends, maybe make a suggestion of what seems to work well and what doesnt.',
    variables: ['X Profile URL'],
  },
  {
    id: 'marketing-2',
    icon: <IconNews className="w-6 h-6 text-purple-400" />,
    title: 'Check News about Brand',
    category: 'Marketing',
    subtitle: 'Marketing',
    prompt: 'I need you to do a quick brand analysis.\nBrand Name: {Brand Name}\nOpen Google and perform a search for the brand name with no results older than {Maximum Article Age}. Use google search filters in the search string.\nQuickly scan the first page of results for notable mentions or sentiment. If any notable articles / websites read them fully.\nWrite a summary if it exists.',
    variables: ['Brand Name', 'Maximum Article Age'],
  },
  
  // Research Templates
  {
    id: 'research-1',
    icon: <IconSearch className="w-6 h-6 text-purple-400" />,
    title: 'Goto',
    category: 'Research',
    subtitle: 'Research',
    prompt: 'go to {website}, that\'s it',
    variables: ['website'],
  },
  {
    id: 'research-2',
    icon: <IconSearch className="w-6 h-6 text-purple-400" />,
    title: 'Top Posts on Hacker News',
    category: 'Research',
    subtitle: 'Research',
    prompt: 'I want you to summarise 2 posts at the top of https://news.ycombinator.com\n\n**Process**\n\nFor each post:\n  - Click on the post title (this should bring you to a different website)\n    - tip: don\'t click the URL since it won\'t re-direct you\n  - On the website, read its full content and summarize\n  - Then, go back to the news feed, and click on the comments link for the post (https://news.ycombinator.com/item?id=X)\n  - Scan the full comments and summarize the community sentiment and main points raised by commenters\n\n**Report**\n\nCompile everything, returning links to the comments page for each post.',
  },
  {
    id: 'research-3',
    icon: <IconSearch className="w-6 h-6 text-purple-400" />,
    title: 'Crypto Daily Digest',
    category: 'Research',
    subtitle: 'Research',
    prompt: 'Step 1: Retrieve the top {number of Crypto Coins} cryptocurrencies from CoinMarketCap, capturing key metrics such as current price, 24-hour percentage change, and trading volume.\nStep 2: Enhance this dataset by fetching historical trends and expert insights from CryptoCompare\nStep 3: Compile a comprehensive summary report that merges the quick statistics with deeper market analysis for each cryptocurrency, ready for periodic review.',
    variables: ['number of Crypto Coins'],
  },
  {
    id: 'research-4',
    icon: <IconSearch className="w-6 h-6 text-purple-400" />,
    title: 'Top ML Papers',
    category: 'Research',
    subtitle: 'Research',
    prompt: 'Go to https://huggingface.co/papers and click through each of the top 5 papers.\n\nFor each paper:\n- Record the title, URL\n- Summarise the abstract\n- Highlight any papers relevant to {relevant topics}\n\nFinally, compile together a summary, ranked by relevance.',
    variables: ['relevant topics'],
  },
  
  // News Templates
  {
    id: 'news-1',
    icon: <IconBrandTwitter className="w-6 h-6 text-purple-400" />,
    title: 'Whats trending on X?',
    category: 'News',
    subtitle: 'News',
    prompt: 'Step 1: Extract the top {Number of Hashtags to explore} trending hashtags from X (twitter)\nStep 2: For each hashtag, collect a sample of recent tweets to capture the current conversation.\nStep 3: Produce a summary report on what is currently trending',
    variables: ['Number of Hashtags to explore'],
  },
  {
    id: 'news-2',
    icon: <IconNews className="w-6 h-6 text-purple-400" />,
    title: 'Right / Left Unbiased News Coverage',
    category: 'News',
    subtitle: 'News',
    prompt: 'Can you find me some news paper articles from both right and left outlets on {News Topic Of your Choice} on a very recent story and write a summary report on where they report differently, what they focus on and what their standpoint is. After reading a story assess right / leftwing based on https://www.allsides.com/media-bias/ratings after reading the article to put it into the right area of the left-right spectrum and check what is remaining out of those 2.\n\nPlease you choose autonomously the outlets but make sure one is right and one is left.\n\nAs a tip, if you encounter a paywall you can save the URL of the article you wanna read and use https://archive.ph to get around the paywall.',
    variables: ['News Topic Of your Choice'],
  },
  {
    id: 'news-3',
    icon: <IconNews className="w-6 h-6 text-purple-400" />,
    title: 'Daily News Digest',
    category: 'News',
    subtitle: 'News',
    prompt: 'Workflow:\n\nStep 1: Navigate to {Your favorite News Website} News and identify the top 3 headlines on the homepage.\nStep 2: For each headline, click to read the full article and extract key details (facts, quotes, and statistics).\nStep 3: Navigate to {Your second favorite News Website} and use the search function to find related articles or expert commentary on each headline\'s topic.\nFinal Step: Compile a digest message that lists each headline with its summary and additional insights from both news sources, including links to both sources.',
    variables: ['Your favorite News Website', 'Your second favorite News Website'],
  },

  // Business Templates
  {
    id: 'business-1',
    icon: <IconChartBar className="w-6 h-6 text-purple-400" />,
    title: 'Company Sentiment Analysis',
    category: 'Business',
    subtitle: 'Business',
    prompt: 'Read through the top 2 news articles about my company: {Company Name}\n\nClick through each article and do the following:\n- Read the article fully.\n- If the article is not primarily focused on my company, go back and find a more relevant one.\n- Carefully note down relevant quotes with strong sentiment (positive or negative), if any.\n\nFinally, craft a summary:\n- Ranking each article from most positive, to neutral, to most negative sentiment.\n- Provide a link to each article and include quotes.\n- At the end of your summary, highlight any recurring themes across articles, good and bad.',
    variables: ['Company Name'],
  },

  // Other Templates
  {
    id: 'other-1',
    icon: <IconUser className="w-6 h-6 text-purple-400" />,
    title: 'Research on a Person',
    category: 'Other',
    subtitle: 'Other',
    prompt: 'can you do some deep research about {Who are we researching}? Where did they go to school, where did they work, anything else notable to know about them?',
    variables: ['Who are we researching'],
  },
];

const categories: { label: Category; icon: React.ReactNode }[] = [
  { label: 'Business', icon: <IconBriefcase className="w-5 h-5" /> },
  { label: 'Marketing', icon: <IconChartBar className="w-5 h-5" /> },
  { label: 'Research', icon: <IconSearch className="w-5 h-5" /> },
  { label: 'News', icon: <IconNews className="w-5 h-5" /> },
  { label: 'Other', icon: <IconDots className="w-5 h-5" /> },
];

interface TemplateModalProps {
  template: Template;
  onClose: () => void;
  onSubmit: (task: string) => void;
}

const TemplateModal = ({ template, onClose, onSubmit }: TemplateModalProps) => {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = async () => {
    // Check if all variables are filled
    if (template.variables?.some(v => !variables[v])) {
      toast({
        variant: "destructive",
        title: "Missing Variables",
        description: "Please fill in all required variables.",
      });
      return;
    }

    // Replace variables in the prompt
    let finalPrompt = template.prompt || '';
    Object.entries(variables).forEach(([key, value]) => {
      finalPrompt = finalPrompt.replace(`{${key}}`, value);
    });

    // Submit the task
    onSubmit(finalPrompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        {/* Header - Fixed */}
        <div className="p-4 sm:p-6 md:p-8 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl text-blue-500 font-medium">View Template</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors p-1"
              aria-label="Close modal"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-xs sm:text-sm text-blue-500 mb-1">Template Name</h3>
              <h4 className="text-xl sm:text-2xl text-gray-900">{template.title}</h4>
            </div>

            <div>
              <p className="text-sm sm:text-base text-orange-400">Created by {template.subtitle}</p>
            </div>

            <div>
              <h3 className="text-xs sm:text-sm text-blue-500 mb-2">Prompt</h3>
              <p className="text-xs sm:text-sm text-blue-300 mb-2">Highlight and turn parts of your prompt into editable fields.</p>
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <p className="text-sm sm:text-base text-gray-600 whitespace-pre-wrap">
                  {template.prompt || 'No prompt available'}
                </p>
              </div>
            </div>

            {template.variables && template.variables.length > 0 && (
              <div>
                <h3 className="text-xs sm:text-sm text-blue-500 mb-2">Template Variables</h3>
                <p className="text-xs sm:text-sm text-blue-300 mb-4">Fill in the values for each variable:</p>
                <div className="space-y-3 sm:space-y-4">
                  {template.variables.map((variable) => (
                    <div key={variable} className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <span className="text-sm sm:text-base text-gray-600">{variable}</span>
                      </div>
                      <input
                        type="text"
                        value={variables[variable] || ''}
                        onChange={(e) => setVariables(prev => ({ ...prev, [variable]: e.target.value }))}
                        placeholder="Enter value"
                        className="px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base border border-gray-100 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-4 sm:p-6 md:p-8 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-gray-500 hover:text-gray-600 transition-colors text-sm sm:text-base order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors order-1 sm:order-2"
            >
              <IconPlayerPlay className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Run Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TemplateCard = ({ template, onSubmit }: { template: Template; onSubmit: (task: string) => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-lg transition-all duration-200 cursor-pointer"
      >
        <div className="flex items-start gap-2.5 sm:gap-3">
          <div className="flex-shrink-0">
            <div className="p-2 sm:p-2.5 bg-purple-50 rounded-lg sm:rounded-xl group-hover:bg-purple-100 transition-colors duration-200">
              {template.icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-medium text-gray-900 group-hover:text-blue-600 mb-2 sm:mb-2.5 truncate transition-colors duration-200">
              {template.title}
            </h3>
            <div className="flex items-center flex-wrap gap-x-2 sm:gap-x-3 gap-y-1.5 sm:gap-y-2">
              <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">{template.subtitle}</span>
              <span className="px-2 sm:px-2.5 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-full whitespace-nowrap group-hover:bg-blue-100 transition-colors duration-200">
                {template.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <TemplateModal 
          template={template} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={onSubmit}
        />
      )}
    </>
  );
};

interface TemplateSectionProps {
  onSubmit: (task: string) => void;
}

const TemplateSection = ({ onSubmit }: TemplateSectionProps) => {
  const [activeCategory, setActiveCategory] = useState<Category>('Marketing');
  const filteredTemplates = templates.filter(template => template.category === activeCategory);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Category Filters */}
      <div className="relative">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:overflow-x-visible sm:pb-0 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-max">
            {categories.map((category) => (
              <button
                key={category.label}
                onClick={() => setActiveCategory(category.label)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base transition-all duration-200 whitespace-nowrap ${
                  activeCategory === category.label
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
                aria-label={`Filter by ${category.label}`}
              >
                {category.icon}
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredTemplates.map((template) => (
          <TemplateCard 
            key={template.id} 
            template={template} 
            onSubmit={onSubmit}
          />
        ))}
      </div>
    </div>
  );
};

export default TemplateSection; 