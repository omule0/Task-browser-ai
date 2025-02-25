import jsPDF from 'jspdf';

/**
 * Generates a PDF from markdown content
 * @param elementId - The ID of the HTML element containing the markdown content
 * @param filename - The name of the PDF file (without extension)
 */
export const generatePDF = async (elementId: string, filename: string = 'agent-results'): Promise<void> => {
  try {
    // Get the element containing the markdown content
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }
    
    // Get the text content
    const content = element.textContent || '';
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 20; // Margins in mm
    const usableWidth = pageWidth - (2 * margin);
    
    // Add title
    pdf.setFontSize(16);
    pdf.text('Agent Run Results', pageWidth / 2, margin, { align: 'center' });
    
    // Add timestamp
    pdf.setFontSize(10);
    const now = new Date();
    pdf.text(`Generated on: ${now.toLocaleString()}`, pageWidth / 2, margin + 7, { align: 'center' });
    
    // Add horizontal line
    pdf.setLineWidth(0.3);
    pdf.line(margin, margin + 10, pageWidth - margin, margin + 10);
    
    // Split content into lines that fit the page width
    pdf.setFontSize(11);
    const lines = pdf.splitTextToSize(content, usableWidth);
    
    // Calculate lines per page
    const lineHeight = 0.5; // in centimeters
    const linesPerPage = Math.floor((pageHeight - (margin * 2)) / (lineHeight * 10));
    
    // Add content across pages
    let currentPage = 0;
    const totalPages = Math.ceil(lines.length / linesPerPage);
    
    while (currentPage < totalPages) {
      if (currentPage > 0) {
        pdf.addPage();
      }
      
      const startIndex = currentPage * linesPerPage;
      const endIndex = Math.min((currentPage + 1) * linesPerPage, lines.length);
      const pageLines = lines.slice(startIndex, endIndex);
      
      // Add page number
      pdf.setFontSize(8);
      pdf.text(`Page ${currentPage + 1} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      
      // Add content
      pdf.setFontSize(11);
      pageLines.forEach((line: string, index: number) => {
        const y = margin + 20 + (index * lineHeight * 10);
        pdf.text(line, margin, y);
      });
      
      currentPage++;
    }
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}; 