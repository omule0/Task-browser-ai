import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  BarChart, 
  Users, 
  Target, 
  AlertTriangle,
  Briefcase,
  LineChart,
  Globe,
  Building2
} from "lucide-react";

const SectionIcon = ({ type }) => {
  const icons = {
    overview: <FileText className="w-5 h-5 text-blue-500" />,
    financial: <BarChart className="w-5 h-5 text-green-500" />,
    market: <Globe className="w-5 h-5 text-purple-500" />,
    risks: <AlertTriangle className="w-5 h-5 text-red-500" />,
    company: <Building2 className="w-5 h-5 text-gray-500" />,
    strategy: <Target className="w-5 h-5 text-indigo-500" />,
    management: <Users className="w-5 h-5 text-orange-500" />,
    business: <Briefcase className="w-5 h-5 text-yellow-500" />,
    analysis: <LineChart className="w-5 h-5 text-cyan-500" />,
  };

  return icons[type] || <FileText className="w-5 h-5 text-gray-500" />;
};

const RenderValue = ({ value }) => {
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc pl-6 space-y-2">
        {value.map((item, index) => (
          <li key={index}>
            {typeof item === 'object' ? <RenderObject data={item} /> : item}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === 'object' && value !== null) {
    return <RenderObject data={value} />;
  }

  return <p className="text-foreground">{value}</p>;
};

const RenderObject = ({ data }) => {
  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]) => {
        // Skip empty values
        if (!value || (Array.isArray(value) && value.length === 0)) return null;

        return (
          <div key={key} className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <RenderValue value={value} />
          </div>
        );
      })}
    </div>
  );
};

const ReportSection = ({ title, icon, content }) => {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-muted rounded-lg">
          <SectionIcon type={icon} />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <RenderValue value={content} />
    </Card>
  );
};

export default function ReportViewer({ report }) {
  // Helper function to determine section icon
  const getSectionIcon = (title) => {
    const lowercase = title.toLowerCase();
    if (lowercase.includes('overview')) return 'overview';
    if (lowercase.includes('financial')) return 'financial';
    if (lowercase.includes('market')) return 'market';
    if (lowercase.includes('risk')) return 'risks';
    if (lowercase.includes('company')) return 'company';
    if (lowercase.includes('strategy')) return 'strategy';
    if (lowercase.includes('management')) return 'management';
    if (lowercase.includes('business')) return 'business';
    if (lowercase.includes('analysis')) return 'analysis';
    return 'default';
  };

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{report.title}</h1>
          <p className="text-muted-foreground">
            Generated report based on your requirements
          </p>
        </div>

        <div className="space-y-6">
          {Object.entries(report).map(([key, value]) => {
            // Skip the title as it's already shown
            if (key === 'title') return null;
            
            return (
              <ReportSection
                key={key}
                title={key.replace(/([A-Z])/g, ' $1').trim()}
                icon={getSectionIcon(key)}
                content={value}
              />
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
} 