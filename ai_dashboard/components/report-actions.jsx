import { List, Download, Printer, Share2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { customToast } from "@/components/ui/toast-theme";

export default function ReportActions({ sections }) {
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
    }, 100);
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      
      // Add toast notification
      customToast.info('Preparing your report for download...', {
        description: 'This may take a few moments depending on the report size.'
      });
      
      const reportElement = document.querySelector('.printable-report');
      
      // Add printing class to apply print styles
      document.body.classList.add('printing');
      
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          // Remove any floating/fixed elements from the clone
          const floatingElements = clonedDoc.querySelectorAll('.fixed');
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
          yOffset < 0 ? yOffset : 0,
          scaledWidth,
          scaledHeight
        );
        
        remainingHeight -= pdfHeight;
        yOffset -= pdfHeight;
      }
      
      pdf.save('report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      customToast.error('Failed to generate PDF');
    } finally {
      document.body.classList.remove('printing');
      setDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="gap-2"
      >
        <Printer className="w-4 h-4" />
        Print
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadPDF}
        disabled={downloading}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        {downloading ? 'Generating PDF...' : 'Download PDF'}
      </Button>
    </div>
  );
} 