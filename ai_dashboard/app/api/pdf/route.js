import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import PDFParser from 'pdf2json';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const uploadedFile = formData.get('filepond');
    let fileName = '';
    let parsedText = '';

    if (uploadedFile && uploadedFile instanceof File) {
      // Generate a unique filename
      fileName = uuidv4();
      const tempFilePath = `/tmp/${fileName}.pdf`;

      // Convert the uploaded file into a temporary file
      const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
      await fs.writeFile(tempFilePath, fileBuffer);

      // Create a promise to handle the PDF parsing
      const parseResult = await new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);

        pdfParser.on('pdfParser_dataError', (errData) => {
          console.error('PDF parsing error:', errData.parserError);
          reject(errData.parserError);
        });

        pdfParser.on('pdfParser_dataReady', () => {
          parsedText = pdfParser.getRawTextContent();
          // console.log(parsedText);
          resolve(parsedText);
        });

        pdfParser.loadPDF(tempFilePath);
      });

      // Clean up the temporary file
      await fs.unlink(tempFilePath);

      return new NextResponse(parseResult, {
        headers: { 'FileName': fileName }
      });
    }

    return new NextResponse('No valid PDF file provided', { status: 400 });
  } catch (error) {
    console.error('PDF parsing error:', error);
    return new NextResponse('Error parsing PDF', { status: 500 });
  }
}
