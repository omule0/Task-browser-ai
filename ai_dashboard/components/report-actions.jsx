import { List, Download, Printer, Share2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { customToast } from "@/components/ui/toast-theme";

export default function ReportActions({ sections, title }) {
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    const scrollPos = window.scrollY;
    document.body.classList.add('printing');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing');
      window.scrollTo(0, scrollPos);
    }, 100);
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      
      customToast.info('Preparing your report for download...', {
        description: 'This may take a few moments depending on the report size.'
      });

      const reportElement = document.querySelector('.printable-report');
      const sections = reportElement.children;
      
      // Initialize PDF with A4 format
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margins = {
        top: 40,
        bottom: 40,
        left: 40,
        right: 40
      };

      // Add title page
      if (title) {
        pdf.setFontSize(24);
        pdf.text(title, pdfWidth / 2, pdfHeight / 3, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text(new Date().toLocaleDateString(), pdfWidth / 2, pdfHeight / 3 + 30, { align: 'center' });
        pdf.addPage();
      }

      // Process each section
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        
        // Capture section as canvas
        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          logging: false,
          windowWidth: 1200,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.querySelector('.printable-report');
            clonedElement.style.transform = 'scale(1)';
            clonedElement.style.width = '1200px';
            const floatingElements = clonedDoc.querySelectorAll('.fixed, .sticky');
            floatingElements.forEach(el => el.remove());
          }
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        // Calculate dimensions
        const availableWidth = pdfWidth - margins.left - margins.right;
        const availableHeight = pdfHeight - margins.top - margins.bottom;
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(
          availableWidth / imgWidth,
          availableHeight / imgHeight
        );
        
        const scaledWidth = imgWidth * ratio;
        const scaledHeight = imgHeight * ratio;
        
        // Calculate number of pages needed for this section
        const pageHeight = pdfHeight - margins.top - margins.bottom;
        const totalPages = Math.ceil(scaledHeight / pageHeight);
        
        // Split section across pages
        for (let page = 0; page < totalPages; page++) {
          if (page > 0 || i > 0) {
            pdf.addPage();
          }
          
          // Add page number
          pdf.setFontSize(10);
          pdf.setTextColor(128);
          pdf.text(
            `Page ${pdf.internal.getNumberOfPages()}`,
            pdfWidth - margins.right,
            pdfHeight - margins.bottom / 2,
            { align: 'right' }
          );
          
          // Calculate position for this page's portion
          const yPosition = page * pageHeight;
          const remainingHeight = Math.min(
            pageHeight,
            scaledHeight - (page * pageHeight)
          );
          
          pdf.addImage(
            imgData,
            'JPEG',
            margins.left,
            margins.top - yPosition,
            scaledWidth,
            scaledHeight
          );
        }
      }
      
      // Save the PDF
      pdf.save(`${title || 'report'}.pdf`);
      customToast.success('PDF generated successfully');
      
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