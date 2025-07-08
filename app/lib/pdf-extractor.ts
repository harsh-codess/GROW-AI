// lib/pdf-extractor.ts
import mammoth from 'mammoth';
import { Poppler } from 'node-poppler';
import Papa from 'papaparse'; 
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const poppler = new Poppler();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const text = await poppler.pdfToText(buffer);
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

export async function extractTextFromCSV(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const text = new TextDecoder().decode(arrayBuffer);
    
    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true
    });
    
    // Convert CSV data to text format
    let extractedText = '';
    
    // Add headers as a first line
    if (result.meta.fields && result.meta.fields.length > 0) {
      extractedText += result.meta.fields.join(', ') + '\n';
    }
    
    // Add each row as a line
    result.data.forEach((row: any) => {
      const values = Object.values(row);
      extractedText += values.join(', ') + '\n';
    });

    console.log("extractedText", extractedText);
    
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from CSV:', error);
    throw new Error('Failed to extract text from CSV');
  }
}