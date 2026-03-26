/**
 * Content generation platforms
 */
export const PLATFORMS = {
  INSTAGRAM: 'instagram',
  LINKEDIN: 'linkedin',
  TWITTER: 'twitter',
  FACEBOOK: 'facebook',
} as const;

export type Platform = typeof PLATFORMS[keyof typeof PLATFORMS];

export const PLATFORM_LIST: Platform[] = [
  PLATFORMS.INSTAGRAM,
  PLATFORMS.LINKEDIN,
  PLATFORMS.TWITTER,
  PLATFORMS.FACEBOOK,
];

/**
 * Image generation styles for product photography
 */
export const IMAGE_STYLES = {
  MINIMAL: 'minimal',
  LIFESTYLE: 'lifestyle',
  LUXURY: 'luxury',
  STUDIO: 'studio',
} as const;

export type ImageStyle = typeof IMAGE_STYLES[keyof typeof IMAGE_STYLES];

export const STYLE_LIST: ImageStyle[] = [
  IMAGE_STYLES.MINIMAL,
  IMAGE_STYLES.LIFESTYLE,
  IMAGE_STYLES.LUXURY,
  IMAGE_STYLES.STUDIO,
];

/**
 * Style descriptions for Gemini prompts
 */
export const STYLE_DESCRIPTIONS: Record<ImageStyle, string> = {
  minimal: "pristine white background with perfect lighting, commercial grade",
  lifestyle: "natural environment showing real-world usage, beautiful ambiance",
  luxury: "dark elegant background with dramatic lighting, premium feel",
  studio: "professional studio setup with technical precision, editorial quality"
};

/**
 * Platform-specific prompt instructions
 */
export const PLATFORM_INSTRUCTIONS: Record<Platform, string> = {
  instagram: `Create an Instagram post caption for a new product feature.
    - Use 5-8 relevant hashtags
    - Include 2-3 emojis naturally
    - Keep it engaging and discoverable
    - Focus on benefits and user value
    - Length: 150-250 words`,

  linkedin: `Create a LinkedIn post about a new product feature.
    - Professional but engaging tone
    - Highlight business value and impact
    - Include 3-5 industry-relevant hashtags
    - Add a thought-provoking question or CTA
    - Length: 200-300 words`,

  twitter: `Create a Twitter post about a new product feature.
    - Punchy and attention-grabbing
    - Keep it under 280 characters
    - Include 1-2 relevant hashtags
    - Include a strong call to action`,

  facebook: `Create a Facebook post about a new product feature.
    - Conversational and friendly tone
    - Include a clear value proposition
    - Encourage engagement with a question
    - Include 3-5 hashtags
    - Length: 150-250 words`,
};

/**
 * Carousel generation types
 */
export const CAROUSEL_DESCRIPTIONS = [
  "product showcase with clean, professional styling",
  "detail shot highlighting key features and craftsmanship",
  "lifestyle context showing the product in use",
  "overhead flat-lay composition with complementary items",
  "close-up texture and quality highlights",
  "full product variety or color options display"
];

/**
 * Default carousel image count (max 6 for Instagram carousel)
 */
export const DEFAULT_CAROUSEL_COUNT = 6;
