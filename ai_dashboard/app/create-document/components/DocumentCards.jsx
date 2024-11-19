import { Card, CardContent } from "@/components/ui/card";
import { documentTypes, subTypes } from "../constants/constants";
import { Check } from 'lucide-react';

export default function DocumentCards({ selectedType, onCardClick, onSubTypeClick }) {
  return (
    <>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500" />
        <h1 className="mb-2 text-3xl font-bold tracking-tight">What type of document do you need?</h1>
        <p className="text-muted-foreground">Select a document type to get started with AI-powered generation.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {documentTypes.map((doc) => (
          <Card
            key={doc.title}
            className={`relative p-6 hover:bg-muted/50 cursor-pointer ${
              selectedType === doc.title ? "bg-muted/50" : ""
            }`}
            onClick={() => onCardClick(doc.title)}
          >
            {selectedType === doc.title && (
              <div className="absolute right-4 top-4">
                <Check className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              {doc.icon}
            </div>
            <h3 className="mb-2 font-semibold">{doc.title}</h3>
            <p className="text-sm text-muted-foreground">{doc.description}</p>
          </Card>
        ))}
      </div>

      {/* Sub Types */}
      {selectedType && subTypes[selectedType] && (
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-medium">Select type of {selectedType.toLowerCase()}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {subTypes[selectedType].map((subType) => (
              <Card
                key={subType.title}
                className="relative p-6 hover:bg-muted/50 cursor-pointer"
                onClick={() => onSubTypeClick(subType.title)}
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  {subType.icon}
                </div>
                <h3 className="mb-2 font-semibold">{subType.title}</h3>
                <p className="text-sm text-muted-foreground">{subType.description}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
} 