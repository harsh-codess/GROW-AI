/**
 * Validates base64 encoded image data
 * @param base64String - Data URL with base64 encoded image (e.g., "data:image/jpeg;base64,...")
 * @returns true if valid image data, false otherwise
 */
export function isValidBase64Image(base64String: string): boolean {
  try {
    if (!/^data:image\/(jpeg|png|jpg);base64,/.test(base64String)) {
      return false;
    }

    const base64Data = base64String.split(',')[1];
    if (!base64Data || !/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
      return false;
    }

    const decodedSize = Math.ceil((base64Data.length * 3) / 4);
    if (decodedSize > 10 * 1024 * 1024) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Extracts base64 data from a data URL
 * @param dataUrl - Full data URL (e.g., "data:image/jpeg;base64,...")
 * @returns Base64 string without the data URL prefix
 */
export function extractBase64Data(dataUrl: string): string {
  return dataUrl.split(',')[1];
}
