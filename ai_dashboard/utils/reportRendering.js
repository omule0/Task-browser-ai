import { Badge } from "@/components/ui/badge";

export const renderReportContent = (key, value) => {
  if (Array.isArray(value)) {
    return value.map((item, index) => (
      <div key={index} className="border-l-2 border-purple-200 pl-4 py-2">
        {renderReportItem(item)}
        {item.source && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              Source: {item.source.chunkIndex}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              {item.source.preview}
            </p>
          </div>
        )}
      </div>
    ));
  } else if (typeof value === 'object' && value !== null) {
    if (value.content) {
      return (
        <div>
          <p>{value.content}</p>
          {value.sources && value.sources.map((source, index) => (
            <div key={index} className="mt-2">
              <Badge variant="secondary" className="text-xs">
                Source: {source.chunkIndex}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">
                {source.preview}
              </p>
            </div>
          ))}
        </div>
      );
    }
    return Object.entries(value).map(([subKey, subValue], index) => (
      <div key={index} className="mt-2">
        <h4 className="font-medium text-sm">{subKey.replace(/([A-Z])/g, ' $1').trim()}</h4>
        {renderReportContent(subKey, subValue)}
      </div>
    ));
  }
  return <p>{value}</p>;
};

export const renderReportItem = (item) => {
  if (typeof item === 'string') return <p>{item}</p>;
  
  return Object.entries(item).map(([key, value]) => {
    if (key === 'source') return null;
    if (Array.isArray(value)) {
      return (
        <div key={key} className="mt-2">
          <h4 className="font-medium text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
          <ul className="list-disc list-inside">
            {value.map((v, i) => (
              <li key={i} className="text-sm">{v}</li>
            ))}
          </ul>
        </div>
      );
    }
    return (
      <div key={key} className="mt-2">
        <h4 className="font-medium text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
        <p className="text-sm">{value}</p>
      </div>
    );
  });
}; 