// app/api/dashboard/content-pipeline/route.ts
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { searchDocuments } from "@/app/lib/vectorStore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { isValidBase64Image, extractBase64Data } from "@/app/lib/image-validation";
import { uploadImageToCloudinary } from "@/app/lib/cloudinary-upload";
import {
  PLATFORM_LIST,
  PLATFORM_INSTRUCTIONS,
  STYLE_LIST,
  STYLE_DESCRIPTIONS,
  CAROUSEL_DESCRIPTIONS,
  Platform,
  ImageStyle,
} from "@/app/lib/content-constants";

// Rate limiting - max 2 requests per 30 seconds
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, "30 s"),
  analytics: true,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Set timeout for heavy async operations
export const maxDuration = 120;

interface ContentPipelineRequest {
  featureDescription: string;
  productImage: string;
  productName?: string;
}

interface PipelineOutput {
  success: boolean;
  data?: {
    platformPosts: Array<{
      platform: Platform;
      content: string;
    }>;
    productImages: Array<{
      style: ImageStyle;
      url: string;
      description: string;
    }>;
    carousel: Array<{
      order: number;
      url: string;
    }>;
    video?: {
      url: string;
      status: string;
    };
    brandContext: string;
  };
  error?: string;
}

export async function POST(request: Request): Promise<NextResponse<PipelineOutput>> {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser?.companyId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Apply rate limiting
    const { success } = await ratelimit.limit(sessionUser.id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Maximum 2 requests per 30 seconds." },
        { status: 429 }
      );
    }

    const body: ContentPipelineRequest = await request.json();
    const { featureDescription, productImage } = body;

    if (!featureDescription || !productImage) {
      return NextResponse.json(
        { success: false, error: "featureDescription and productImage are required" },
        { status: 400 }
      );
    }

    // Validate image once at handler level
    if (!isValidBase64Image(productImage)) {
      return NextResponse.json(
        { success: false, error: "Invalid image data" },
        { status: 400 }
      );
    }

    // 1. Retrieve company information
    const company = await prisma.company.findUnique({
      where: { id: sessionUser.companyId }
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    // 2. Retrieve brand context from RAG
    const collectionName = `company_${sessionUser.companyId}`;
    const ragResults = await searchDocuments(
      collectionName,
      `company brand voice tone values mission product ${featureDescription}`,
      5
    ).catch(() => []);

    const brandContext = ragResults
      .map((doc) => doc.pageContent)
      .join('\n\n') ||
      `Company: ${company.name}\nIndustry: ${company.industry}\nDescription: ${company.description}`;

    // 3. Generate content in parallel
    const [platformPosts, productImages, carouselImages] = await Promise.all([
      generatePlatformPosts(featureDescription, company.name, brandContext),
      generateProductImages(productImage, company.name),
      generateCarouselImages(productImage, company.name),
    ]);

    // Note: Video generation is experimental
    let videoResult: { url: string; status: string } | undefined;
    try {
      videoResult = await generateProductVideo(productImage, featureDescription);
    } catch (videoError) {
      console.warn("Video generation failed:", videoError);
    }

    return NextResponse.json({
      success: true,
      data: {
        platformPosts,
        productImages,
        carousel: carouselImages,
        video: videoResult,
        brandContext: brandContext.length > 500
          ? brandContext.substring(0, 500) + "..."
          : brandContext
      }
    });

  } catch (error) {
    console.error("Content pipeline error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred"
      },
      { status: 500 }
    );
  }
}

/**
 * Generate platform-specific posts
 */
async function generatePlatformPosts(
  featureDescription: string,
  companyName: string,
  brandContext: string
): Promise<Array<{ platform: Platform; content: string }>> {
  const posts = await Promise.all(
    PLATFORM_LIST.map((platform) =>
      generateSinglePost(featureDescription, companyName, brandContext, platform)
    )
  );

  return posts;
}

async function generateSinglePost(
  featureDescription: string,
  companyName: string,
  brandContext: string,
  platform: Platform
): Promise<{ platform: Platform; content: string }> {
  try {
    const prompt = `
You are a social media expert for ${companyName}.

BRAND CONTEXT:
${brandContext}

FEATURE TO PROMOTE:
${featureDescription}

PLATFORM REQUIREMENTS:
${PLATFORM_INSTRUCTIONS[platform]}

Create an original, compelling post that resonates with the brand voice and highlights the feature's value.
Do not use placeholder text or generic language.
Focus on what makes this feature valuable to customers.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return {
      platform,
      content: text,
    };
  } catch (error) {
    console.error(`Error generating ${platform} post:`, error);
    return {
      platform,
      content: `Failed to generate ${platform} post`
    };
  }
}

/**
 * Generate 4 product images with different styles
 */
async function generateProductImages(
  productImage: string,
  companyName: string
): Promise<Array<{ style: ImageStyle; url: string; description: string }>> {
  const images = await Promise.all(
    STYLE_LIST.map((style) =>
      generateImageForStyle(productImage, style, companyName, `product-images/${style}`)
    )
  );

  return images.filter((img) => img !== null) as Array<{
    style: ImageStyle;
    url: string;
    description: string;
  }>;
}

/**
 * Generate carousel images (6 variations for Instagram carousel)
 */
async function generateCarouselImages(
  productImage: string,
  companyName: string
): Promise<Array<{ order: number; url: string }>> {
  const carouselRequests = CAROUSEL_DESCRIPTIONS.map((description, index) =>
    generateImageForStyle(
      productImage,
      `carousel_${index + 1}` as ImageStyle,
      companyName,
      `carousel-images`,
      `Create a carousel image #${index + 1} for Instagram - ${description}`
    )
      .then((result) => result ? { order: index + 1, url: result.url } : null)
      .catch((error) => {
        console.error(`Error generating carousel image ${index + 1}:`, error);
        return null;
      })
  );

  const results = await Promise.all(carouselRequests);
  return results.filter((img) => img !== null) as Array<{ order: number; url: string }>;
}

/**
 * Core image generation function (consolidates logic for product and carousel images)
 */
async function generateImageForStyle(
  productImage: string,
  style: ImageStyle | string,
  companyName: string,
  folderPath: string,
  customPrompt?: string
): Promise<{ style: ImageStyle | string; url: string; description: string } | null> {
  try {
    const base64Data = extractBase64Data(productImage);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
      generationConfig: {
        temperature: 0.6,
        // @ts-expect-error - responseModalities not in types yet
        responseModalities: ['Text', 'Image']
      },
    });

    const prompt = customPrompt ||
      `Create a professional product photography image for ${companyName} with a ${STYLE_DESCRIPTIONS[style as ImageStyle]} aesthetic.
Enhance the product presentation while preserving its authentic appearance and all details.
The final image should be suitable for professional marketing and e-commerce use.`;

    const result = await model.generateContent([
      { text: prompt },
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
      throw new Error("Image generation failed");
    }

    // Upload to Cloudinary
    const upload = await uploadImageToCloudinary(
      `data:image/jpeg;base64,${generatedImage}`,
      folderPath
    );

    return {
      style,
      url: upload.secure_url,
      description: STYLE_DESCRIPTIONS[style as ImageStyle] || "Generated image"
    };
  } catch (error) {
    console.error(`Error generating ${style} image:`, error);
    return null;
  }
}

/**
 * Generate product video (experimental)
 */
async function generateProductVideo(
  productImage: string,
  featureDescription: string
): Promise<{ url: string; status: string } | undefined> {
  try {
    // TODO: Integrate with video generation service
    console.log("Video generation requested but not yet implemented");
    return undefined;
  } catch (error) {
    console.error("Error generating video:", error);
    return undefined;
  }
}
