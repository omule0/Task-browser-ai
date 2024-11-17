import { Card, CardContent } from "@/components/ui/card";
import { documentTypes, subTypes } from "../constants/constants";

export default function DocumentCards({ 
  selectedType, 
  onCardClick, 
  onSubTypeClick 
}) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {documentTypes.map((doc) => (
          <Card
            key={doc.title}
            className={`cursor-pointer transition-colors ${
              selectedType === doc.title ? "bg-purple-600 text-white" : ""
            }`}
            onClick={() => onCardClick(doc.title)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedType === doc.title
                      ? "bg-purple-500"
                      : "bg-purple-100"
                  }`}
                >
                  {doc.icon}
                </div>
                <h3 className="text-sm font-medium">{doc.title}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sub Types */}
      {selectedType && subTypes[selectedType] && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-medium">
            Select type of {selectedType.toLowerCase()}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {subTypes[selectedType].map((subType) => (
              <Card
                key={subType.title}
                className="hover:border-purple-400 cursor-pointer transition-colors"
                onClick={() => onSubTypeClick(subType.title)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                        {subType.icon}
                      </div>
                      <h4 className="text-sm font-medium">{subType.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {subType.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
} 