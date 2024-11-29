import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { documentTypes, subTypes } from "../constants/constants";
import { useRouter } from "next/navigation";

export default function DocumentCards({ selectedType, onCardClick, onSubTypeClick }) {
  const router = useRouter();

  const handleCardClick = (doc) => {
    if (doc.disabled) return;
    
    if (doc.isCustom) {
      router.push('/generate-report');
    } else {
      onCardClick(doc.title);
    }
  };

  return (
    <>
      <div className="mb-4 text-center">
        <h1 className="mb-1 text-xl font-bold tracking-tight text-foreground">
          What type of document do you need?
        </h1>
        <p className="text-xs text-muted-foreground">
          Select a document type to get started with AI-powered generation.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {documentTypes.map((doc) => (
          <Card
            key={doc.title}
            className={`relative p-3 ${
              doc.disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-muted/50 cursor-pointer'
            } ${selectedType === doc.title && !doc.isCustom ? "bg-muted/50" : ""}`}
            onClick={() => handleCardClick(doc)}
          >
            <div className="absolute right-2 top-2">
              {!doc.isCustom && (
                <Checkbox
                  checked={selectedType === doc.title}
                  onCheckedChange={() => !doc.disabled && onCardClick(doc.title)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4"
                  disabled={doc.disabled}
                />
              )}
            </div>
            <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              {doc.icon}
            </div>
            <h3 className="mb-0.5 font-semibold text-sm">{doc.title}</h3>
            <p className="text-xs text-muted-foreground">{doc.description}</p>
          </Card>
        ))}
      </div>

      {selectedType && subTypes[selectedType] && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-medium">Select type of {selectedType.toLowerCase()}</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {subTypes[selectedType].map((subType) => (
              <Card
                key={subType.title}
                className={`relative p-3 hover:bg-muted/50 cursor-pointer ${
                  selectedType === subType.title ? "bg-muted/50" : ""
                }`}
                onClick={() => onSubTypeClick(subType.title)}
              >
                <div className="absolute right-2 top-2">
                  <Checkbox
                    checked={selectedType === subType.title}
                    onCheckedChange={() => onSubTypeClick(subType.title)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4"
                  />
                </div>
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {subType.icon}
                </div>
                <h3 className="mb-0.5 font-semibold text-sm">{subType.title}</h3>
                <p className="text-xs text-muted-foreground">{subType.description}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
} 