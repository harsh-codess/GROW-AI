
export function extractPhoneNumbers(text: string): string[] {
  console.log("Extracting phone numbers from text:", text.substring(0, 100) + "...");
  
  if (!text || typeof text !== 'string') {
    console.log("Invalid text input");
    return [];
  }
  
  let allMatches: string[] = [];
  
  // First look for CSV format with headers
  const lines = text.split('\n');
  if (lines.length > 1) {
    console.log("Processing as possible CSV with", lines.length, "lines");
    const firstLine = lines[0].toLowerCase();
    
    // Check if it looks like a CSV with headers
    if (firstLine.includes(',')) {
      const headers = firstLine.split(',').map(h => h.trim());
      console.log("CSV headers:", headers);
      
      // Find potential phone number columns
      const phoneColumnIndices: number[] = [];
      const phoneKeywords = ['phone', 'mobile', 'cell', 'contact', 'tel', 'number', 'ph', 'fon'];
      
      headers.forEach((header, index) => {
        if (phoneKeywords.some(keyword => header.includes(keyword))) {
          phoneColumnIndices.push(index);
          console.log("Found potential phone column:", header, "at index", index);
        }
      });
      
      // Extract phone numbers from identified columns
      if (phoneColumnIndices.length > 0) {
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          try {
            const columns = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, '')); // Remove quotes
            
            for (const index of phoneColumnIndices) {
              if (index < columns.length) {
                const value = columns[index];
                if (value && value.length >= 7) { // Basic minimum length check
                  console.log("Found potential phone number in CSV:", value);
                  allMatches.push(value);
                }
              }
            }
          } catch (e) {
            console.log("Error parsing CSV line:", e);
          }
        }
      }
    }
  }
  
  // If no numbers found in CSV columns or not a CSV, scan entire text
  if (allMatches.length === 0) {
    console.log("No matches from CSV parsing, scanning entire text");
    
    // Define more inclusive phone number patterns
    const patterns = [
      // Standard formats with various separators
      /\+?1?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/g,
      // International format
      /\+(\d{1,3})[-.\s]?(\d{1,14})/g,
      // Numbers with no separators (10+ digits)
      /\b\d{10,15}\b/g,
      // Formats with parentheses
      /\((\d{3})\)[-.\s]?(\d{3})[-.\s]?(\d{4})/g,
      // Format with country code
      /\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,4}/g
    ];
    
    // Split by lines for better scanning
    for (const line of lines) {
      for (const pattern of patterns) {
        const matches = [...line.matchAll(pattern)];
        if (matches.length > 0) {
          console.log("Found matches with pattern:", pattern, matches.map(m => m[0]));
          allMatches = [...allMatches, ...matches.map(m => m[0])];
        }
      }
    }
  }
  
  console.log("All potential matches:", allMatches);
  
  // Filter out duplicates and format numbers to E.164
  const formattedNumbers = allMatches
    .map(formatPhoneNumber)
    .filter(Boolean) as string[];
  
  // Remove duplicates
  const uniqueNumbers = [...new Set(formattedNumbers)];
  
  console.log("Final unique formatted numbers:", uniqueNumbers);
  return uniqueNumbers;
}

// Improved formatter for phone numbers
function formatPhoneNumber(number: string): string | null {
  // Clean up the number first
  const cleaned = number.replace(/[^\d+]/g, '');
  
  // Basic validation
  if (cleaned.length < 10) {
    console.log(`Skipping ${number} - too short after cleaning: ${cleaned}`);
    return null;
  }
  
  // Already has + prefix
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // For 10-digit numbers, assume US/Canada
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  
  // 11-digit number starting with 1 (US/Canada)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  // For longer numbers, try to intelligently format
  if (cleaned.length > 11) {
    // Could be international without +
    return `+${cleaned}`;
  }
  
  // For 11-digit numbers not starting with 1, add + prefix
  return `+${cleaned}`;
}

