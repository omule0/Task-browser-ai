import { IconBriefcase, IconChartBar, IconSearch, IconNews, IconDots } from '@tabler/icons-react';
import { Category } from '@/utils/template';

interface TemplateIconProps {
  category: Category;
  className?: string;
}

export const TemplateIcon = ({ category, className = "w-6 h-6 text-indigo-400" }: TemplateIconProps) => {
  switch (category) {
    case 'Business':
      return <IconBriefcase className={className} />;
    case 'Marketing':
      return <IconChartBar className={className} />;
    case 'Research':
      return <IconSearch className={className} />;
    case 'News':
      return <IconNews className={className} />;
    case 'Other':
      return <IconDots className={className} />;
    default:
      return <IconDots className={className} />;
  }
}; 