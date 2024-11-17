import { List, Download, Printer, Share2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportActions({ sections }) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

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

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      setIsOpen(false); // Close the menu first
      
      const reportElement = document.querySelector('.printable-report');
      
      // Hide the floating action button during capture
      const actionButton = document.querySelector('.floating-actions');
      if (actionButton) {
        actionButton.style.display = 'none';
      }
      
      // Add printing class to apply print styles
      document.body.classList.add('printing');
      
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          // Remove any floating/fixed elements from the clone
          const floatingElements = clonedDoc.querySelectorAll('.floating-actions, .fixed');
          floatingElements.forEach(el => el.remove());
        }
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      const xOffset = (pdfWidth - scaledWidth) / 2;
      
      let remainingHeight = scaledHeight;
      let yOffset = 0;
      
      while (remainingHeight > 0) {
        // Add new page if not the first page
        if (yOffset > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(
          imgData,
          'JPEG',
          xOffset,
          yOffset < 0 ? yOffset : 0, // Adjust y-position for subsequent pages
          scaledWidth,
          scaledHeight
        );
        
        remainingHeight -= pdfHeight;
        yOffset -= pdfHeight;
      }
      
      pdf.save('report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      // Restore the floating action button
      const actionButton = document.querySelector('.floating-actions');
      if (actionButton) {
        actionButton.style.display = '';
      }
      
      document.body.classList.remove('printing');
      setDownloading(false);
    }
  };

  return (
    <div className="fixed right-8 top-24 print:hidden floating-actions">
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
              onClick={handleDownloadPDF}
              disabled={downloading}
            >
              <Download className="w-4 h-4 mr-2" />
              {downloading ? 'Generating PDF...' : 'Download PDF'}
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