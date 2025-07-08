'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/auth";
import { v2 as cloudinary } from 'cloudinary';

const apiKey = process.env.GEMINI_API_KEY;
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("Missing Redis configuration");
}

const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, "30 s"),
  analytics: true,
});

const genAI = new GoogleGenerativeAI(apiKey);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PHOTOGRAPHY_STYLES = {
  minimal: {
    background: "white"
  },
  lifestyle: {
    background: "contextual"
  },
  luxury: {
    background: "dark"
  },
  studio: {
    background: "gradient"
  }
};

// Enhanced prompts for each style
function getEnhancedPrompt(style: string): string {
  const enhancedPrompts = {
    minimal: `Create a professional product photography image with a pristine white background.
      Ensure perfect lighting that highlights the product's detailed features and texture.
      Use balanced shadows for dimension without distraction.
      The composition should be centered with sufficient margins.
      Maintain exceptional clarity with sharp focus and high resolution.
      The final image should have a crisp, commercial-quality appearance suitable for premium e-commerce listings.
      Do not alter the original product in any way - maintain exact color, shape, and all details.
      Focus on enhancing the presentation while preserving the product's authentic appearance.`,

    lifestyle: `Transform this product into a premium lifestyle photography image.
      Place the product in a natural, contextually relevant environment that enhances its appeal.
      Use soft, diffused lighting with natural ambiance.
      Add tasteful props that complement the product without overwhelming it.
      Ensure the product remains the focal point while conveying its real-world usage.
      The final image should evoke emotional connection while maintaining professional quality.
      Do not alter the original product in any way - maintain exact color, shape, and all details.
      Focus on enhancing the context while preserving the product's authentic appearance.`,

    luxury: `Create a luxurious product photography image with sophisticated elegance.
      Use dramatic lighting with precise highlights to emphasize premium qualities.
      Apply a dark or gradient background with subtle reflections.
      Ensure meticulous attention to detail, highlighting craft and quality.
      The composition should convey exclusivity and high-end positioning.
      The final image should have a polished, editorial quality suitable for luxury marketing.
      Do not alter the original product in any way - maintain exact color, shape, and all details.
      Focus on enhancing the presentation while preserving the product's authentic appearance.`,

    studio: `Generate a professional studio product photography image with technical precision.
      Apply controlled, multi-directional lighting to reveal all product features.
      Use industry-standard studio techniques with proper exposure and color accuracy.
      Create clean, consistent background treatment with subtle gradients if appropriate.
      Ensure commercial-grade output with balanced composition and perfect focus.
      The final image should meet professional advertising standards with flawless execution.
      Do not alter the original product in any way - maintain exact color, shape, and all details.
      Focus on enhancing the presentation while preserving the product's authentic appearance.`
  };

  return enhancedPrompts[style as keyof typeof enhancedPrompts] ||
    "Create a professional product photography image with optimal lighting, proper composition, and commercial-quality results.";
}

export async function createPhotographySession(
  productType: string,
  style: keyof typeof PHOTOGRAPHY_STYLES,
  imageData: string
) {
  try {
    // Get the current user from session
    const user = await getSessionUser();
    if (!user?.id || !user?.companyId) {
      throw new Error("Unauthorized or user not associated with a company");
    }

    // Validate image data
    if (!isValidBase64Image(imageData)) {
      throw new Error("Invalid image data");
    }

    // Create session in database
    const photographySession = await prisma.productPhotographySession.create({
      data: {
        companyId: user.companyId,
        productType, // Still store product type for UI/filtering purposes
        style,
        status: "processing"
      }
    });

    // Upload original image to Cloudinary
    const originalUpload = await cloudinary.uploader.upload(imageData, {
      folder: `product-photography/${user.companyId}`,
      resource_type: 'image'
    });

    // Generate images using Gemini
    const base64Data = imageData.split(',')[1];
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation",
      generationConfig: {
        temperature: 0.6, // Slightly lower temperature for more predictable results
        // @ts-expect-error - this is a bug in the types
        responseModalities: ['Text', 'Image']
      },
    });

    // Use enhanced prompt without product type
    const enhancedPrompt = getEnhancedPrompt(style);

    const result = await model.generateContent([
      {
        text: enhancedPrompt
      },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const generatedImage = response.candidates?.[0].content.parts[1].inlineData?.data;

    if (!generatedImage) {
      throw new Error("Failed to generate image");
    }

    // Upload generated image to Cloudinary
    const generatedUpload = await cloudinary.uploader.upload(`data:image/jpeg;base64,${generatedImage}`, {
      folder: `product-photography/${user.companyId}`,
      resource_type: 'image'
    });

    // Save the generated image with Cloudinary URLs
    await prisma.productImage.create({
      data: {
        sessionId: photographySession.id,
        companyId: user.companyId,
        originalUrl: originalUpload.secure_url,
        generatedUrls: [generatedUpload.secure_url],
        style,
        background: PHOTOGRAPHY_STYLES[style].background,
        prompt: enhancedPrompt, // Store the enhanced prompt used
        status: "completed"
      }
    });

    // Update session status
    await prisma.productPhotographySession.update({
      where: { id: photographySession.id },
      data: { status: "completed" }
    });

    return {
      success: true,
      sessionId: photographySession.id,
      images: [{
        id: generatedUpload.public_id,
        url: generatedUpload.secure_url
      }]
    };
  } catch (error) {
    console.error("Error in createPhotographySession:", error);
    throw error;
  }
}

export async function selectImage(imageId: string) {
  try {
    await prisma.productImage.update({
      where: { id: imageId },
      data: { isSelected: true }
    });
    return { success: true };
  } catch (error) {
    console.error("Error selecting image:", error);
    throw error;
  }
}

function isValidBase64Image(base64String: string): boolean {
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

export async function getPreviousPhotographySessions() {
  try {
    const user = await getSessionUser();
    if (!user?.companyId) throw new Error("Unauthorized");

    // Fetch sessions and their images
    const sessions = await prisma.productPhotographySession.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        images: true
      }
    });

    return { success: true, sessions };
  } catch (error) {
    console.error("Error fetching previous sessions:", error);
    return { success: false, error: typeof error === 'object' && error && 'message' in error ? (error as any).message : String(error) };
  }
}
