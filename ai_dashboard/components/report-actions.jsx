import { List, Download, Printer, Share2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function ReportActions({ sections }) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    // Store current scroll position
    const scrollPos = window.scrollY;
    
    // Add print-specific class to body
    document.body.classList.add('printing');
    
    // Trigger print
    window.print();
    
    // Clean up after print dialog closes
    setTimeout(() => {
      document.body.classList.remove('printing');
      window.scrollTo(0, scrollPos);
      setIsOpen(false);
    }, 100);
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <div className="fixed right-8 top-24 print:hidden">
      {/* Floating Action Button */}
      <Button
        size="icon"
        className="rounded-full shadow-lg mb-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreVertical className="w-4 h-4" />
      </Button>

      {/* Actions Panel */}
      {isOpen && (
        <div className="space-y-2 animate-in slide-in-from-right">
          <div className="bg-white rounded-lg shadow-lg p-4 w-48">
            <div className="flex items-center gap-2 mb-3">
              <List className="w-4 h-4" />
              <span className="font-medium">Contents</span>
            </div>
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="block text-sm text-gray-600 hover:text-gray-900 w-full text-left"
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 space-y-2 w-48">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {/* TODO: Implement PDF download */}}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {/* TODO: Implement sharing */}}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 