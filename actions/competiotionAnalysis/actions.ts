'use server';

import { revalidatePath } from 'next/cache';

const usedata = {
  "productName": "genz custom anime print outfit",
  "price" : "100$",
  "description" : "custom anime print outfit",
  "image" : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "link" : "https://www.google.com",
  "rating" : "4.5",
  "reviews" : "100",
  "seller" : "genz custom",
  "sellerLink" : "https://www.google.com"
}

export async function fetchProducts() {
  try {
    const response = await fetch(
      'https://api.scraperapi.com/structured/google/search?api_key=723b0a30bac1d7f0b714b2162be6ecfb&query=genz custom%20anime%20print%20outfit&country_code=in',
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function analyzeProduct(productName: string) {
  try {
    // Fetch data from Instagram
    const instagramResponse = await fetch(
      `https://api.scraperapi.com/structured/google/search?api_key=723b0a30bac1d7f0b714b2162be6ecfb&query=site:instagram.com ${productName}&country_code=in`,
      { next: { revalidate: 3600 } }
    );

    // Fetch data from LinkedIn
    const linkedinResponse = await fetch(
      `https://api.scraperapi.com/structured/google/search?api_key=723b0a30bac1d7f0b714b2162be6ecfb&query=site:linkedin.com ${productName}&country_code=in`,
      { next: { revalidate: 3600 } }
    );

    if (!instagramResponse.ok || !linkedinResponse.ok) {
      throw new Error('Failed to fetch social media data');
    }

    const instagramData = await instagramResponse.json();
    const linkedinData = await linkedinResponse.json();

    // Here you would typically send this data to Gemini for analysis
    // For now, we'll return a mock analysis
    return {
      marketAnalysis: "Based on social media presence and market data...",
      improvementSuggestions: [
        "Enhance social media engagement",
        "Improve product visibility",
        "Optimize marketing strategy"
      ],
      competitorInsights: [
        "Strong presence on Instagram",
        "Active LinkedIn community",
        "High engagement rates"
      ]
    };
  } catch (error) {
    console.error('Error analyzing product:', error);
    throw error;
  }
}

