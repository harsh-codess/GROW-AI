
import { Readable } from 'stream';
import Papa from 'papaparse';
import mammoth from 'mammoth';
// import pdfParse from 'pdf-parse';

// Helper to convert File to Buffer - works in Node.js environment
async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Helper to convert File to text - works in Node.js environment
async function fileToText(file: File): Promise<string> {
  const buffer = await fileToBuffer(file);
  return buffer.toString('utf-8');
}

// Extract text from PDF
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const buffer = await fileToBuffer(file);
    
    // Using pdf-parse for PDF extraction
    // const data = await pdfParse(buffer);
    return '';
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Extract text from DOCX
export async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const buffer = await fileToBuffer(file);
    // Using mammoth to extract text
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw new Error(`Failed to extract text from DOCX: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Extract text from CSV
export async function extractTextFromCSV(file: File): Promise<string> {
  try {
    const text = await fileToText(file);
    
    // Parse CSV to validate structure
    const parsedCsv = Papa.parse(text, {
      header: true,
      skipEmptyLines: true
    });
    
    // Check for parsing errors
    if (parsedCsv.errors && parsedCsv.errors.length > 0) {
      throw new Error(`CSV parsing errors: ${parsedCsv.errors.map(e => e.message).join(', ')}`);
    }
    
    // Return the original text since we just need to extract phone numbers
    return text;
  } catch (error) {
    console.error("Error extracting text from CSV:", error);
    throw new Error(`Failed to extract text from CSV: ${error instanceof Error ? error.message : String(error)}`);
  }
}