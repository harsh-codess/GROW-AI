'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/auth";
import { v2 as cloudinary } from 'cloudinary';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import util from 'util';

const execPromise = util.promisify(exec);

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

const ANGLES = [
  {
    name: "front",
    prompt: "Create a front view product image with perfect lighting and composition."
  },
  {
    name: "side",
    prompt: "Generate a side view (45-degree angle) product image showing depth and details."
  },
  {
    name: "back",
    prompt: "Create a back view product image highlighting rear features and design."
  },
  {
    name: "top",
    prompt: "Generate a top-down view product image showcasing the product from above."
  },
  {
    name: "detail",
    prompt: "Create a close-up detail shot focusing on key product features or textures."
  }
];

export async function createProductVideo(
  productType: string,
  imageData: string,
  productName?: string
) {
  // Add fallback handling for failed FFmpeg operations
  let fallbackToCloudinary = false;
  console.log(`[START] createProductVideo for product type: ${productType}`);
  try {
    // Get the current user from session
    console.log("[STEP 1] Getting session user");
    const user = await getSessionUser();
    if (!user?.id || !user?.companyId) {
      throw new Error("Unauthorized or user not associated with a company");
    }
    console.log(`[USER] Found user: ${user.id}, company: ${user.companyId}`);

    // Validate image data
    console.log("[STEP 2] Validating image data");
    if (!isValidBase64Image(imageData)) {
      throw new Error("Invalid image data");
    }
    console.log("[VALIDATION] Image data is valid");

    // Create video session in database
    console.log("[STEP 3] Creating video session");
    const videoSession = await prisma.productVideoSession.create({
      data: {
        companyId: user.companyId,
        productType,
        status: "processing"
      }
    });
    console.log(`[DB] Created video session with ID: ${videoSession.id}`);

    // Upload original image to Cloudinary
    console.log("[STEP 4] Uploading original image to Cloudinary");
    const originalUpload = await cloudinary.uploader.upload(imageData, {
      folder: `product-video/${user.companyId}`,
      resource_type: 'image'
    });
    console.log(`[CLOUDINARY] Original image uploaded with ID: ${originalUpload.public_id}`);

    // OPTIMIZATION: Generate only 3 images for better video quality
    const optimizedAngles = ANGLES.slice(0, 3);

    console.log(`[STEP 5] Generating ${optimizedAngles.length} product images using Gemini`);
    // Generate images for selected angles using Gemini
    const base64Data = imageData.split(',')[1];
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
      generationConfig: {
        temperature: 0.7,
        // @ts-expect-error - this is a bug in the types
        responseModalities: ['Text', 'Image']
      },
    });

    const generatedImages = [];
    const localImagePaths = [];
    const tempDir = path.join(os.tmpdir(), `product-video-${videoSession.id}`);

    // Create temporary directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    for (const angle of optimizedAngles) {
      console.log(`[GEMINI] Generating image for ${angle.name} angle`);
      const result = await model.generateContent([
        {
          text: `${angle.prompt} The product is a ${productType}. Ensure professional quality and consistent lighting.`
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data
          }
        }
      ]);

      const response = await result.response;
      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const imagePart = parts.find((p: any) => p.inlineData?.data);
      const generatedImage = imagePart?.inlineData?.data;

      if (!generatedImage) {
        throw new Error(`Failed to generate image for ${angle.name} angle`);
      }

      // Upload generated image to Cloudinary
      console.log(`[CLOUDINARY] Uploading ${angle.name} angle image`);
      const upload = await cloudinary.uploader.upload(`data:image/jpeg;base64,${generatedImage}`, {
        folder: `product-video/${user.companyId}`,
        resource_type: 'image'
      });
      console.log(`[CLOUDINARY] ${angle.name} image uploaded with ID: ${upload.public_id}`);

      // Save image data to local file system for FFmpeg processing
      const localImagePath = path.join(tempDir, `${angle.name}.jpg`);
      fs.writeFileSync(localImagePath, Buffer.from(generatedImage, 'base64'));
      localImagePaths.push(localImagePath);

      generatedImages.push({
        angle: angle.name,
        url: upload.secure_url,
        publicId: upload.public_id,
        localPath: localImagePath
      });
    }

    // Create title image
    const formattedProductName = productName || `${productType.charAt(0).toUpperCase() + productType.slice(1)}`;
    const titleImagePath = path.join(tempDir, 'title.jpg');
    const titleBackgroundColor = 'black'; // Solid black background for better compatibility
    const titleFontColor = 'white';
    const titleFontSize = '72';

    // Use a simpler FFmpeg command for title card that works with more versions
    await execPromise(`ffmpeg -f lavfi -i color=${titleBackgroundColor}:s=1920x1080 -vf "drawtext=text='${formattedProductName}':fontcolor=${titleFontColor}:fontsize=${titleFontSize}:x=(w-text_w)/2:y=(h-text_h)/2" -frames:v 1 ${titleImagePath}`);

    // Create outro image
    const outroImagePath = path.join(tempDir, 'outro.jpg');
    const outroText = 'Thank you for watching';

    // Use a simpler FFmpeg command for outro card that works with more versions
    await execPromise(`ffmpeg -f lavfi -i color=${titleBackgroundColor}:s=1920x1080 -vf "drawtext=text='${outroText}':fontcolor=${titleFontColor}:fontsize=${titleFontSize}:x=(w-text_w)/2:y=(h-text_h)/2" -frames:v 1 ${outroImagePath}`);

    // Create FFmpeg script for complex video composition
    console.log("[STEP 6] Creating high-quality video with FFmpeg");
    const outputVideoPath = path.join(tempDir, 'output.mp4');

    // Add try-catch block for FFmpeg operations to handle failures gracefully
    try {

    // Create a file list for FFmpeg
    const fileListPath = path.join(tempDir, 'filelist.txt');
    const fileListContent = [
      // Title (2 seconds)
      `file '${titleImagePath}'`,
      'duration 2',
      // Product images (3 seconds each)
      ...localImagePaths.flatMap((imgPath) => [
        `file '${imgPath}'`,
        'duration 3',
      ]),
      // Outro
      `file '${outroImagePath}'`,
      'duration 3',
      // Last entry needs a file designation without duration
      `file '${outroImagePath}'`,
    ].join('\n');

    fs.writeFileSync(fileListPath, fileListContent);

    // Use a simpler FFmpeg command that's compatible with more versions
    // This creates a slideshow with crossfade transitions
    const ffmpegCmd = `ffmpeg -f concat -safe 0 -i ${fileListPath} -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p,fps=30" -c:v libx264 -preset fast -crf 22 ${outputVideoPath}`;

    await execPromise(ffmpegCmd);
    console.log(`[FFMPEG] Video created at: ${outputVideoPath}`);
    } catch (ffmpegError) {
      console.error("[ERROR] FFmpeg command failed:", ffmpegError);
      console.log("[FALLBACK] Will use Cloudinary for video creation instead");
      fallbackToCloudinary = true;
    }

    // Upload the generated video to Cloudinary or create one if FFmpeg failed
    console.log("[STEP 7] Uploading final video to Cloudinary");
    let videoUrl = '';

    if (!fallbackToCloudinary && fs.existsSync(outputVideoPath)) {
      // If FFmpeg was successful, upload the video
      const videoUpload = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(outputVideoPath,
          {
            resource_type: "video",
            folder: `product-video/${user.companyId}`,
            use_filename: true,
            unique_filename: true
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });

      videoUrl = (videoUpload as any).secure_url;
    } else {
      // If FFmpeg failed, use Cloudinary's slideshow creation API
      console.log("[CLOUDINARY] Creating slideshow from uploaded images");

      // Create an array of public IDs for the slideshow
      const publicIds = generatedImages.map(img => img.publicId);

      // Create slideshow using Cloudinary's API
      const slideshowUpload = await new Promise((resolve, reject) => {
        cloudinary.uploader.create_slideshow({
          tags: [`product-${productType}`, `company-${user.companyId}`],
          public_ids: publicIds,
          notification_url: null,
          transformation: {
            width: 1920,
            height: 1080,
            crop: "pad",
            background: "black"
          },
          folder: `product-video/${user.companyId}`,
          resource_type: "video"
        }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });

      videoUrl = (slideshowUpload as any).secure_url;
    }
    console.log(`[CLOUDINARY] Video uploaded with URL: ${videoUrl}`);

    console.log("[STEP 8] Saving results to database");
    // Save the video session with all generated content
    await prisma.productVideo.create({
      data: {
        sessionId: videoSession.id,
        companyId: user.companyId,
        originalImageUrl: originalUpload.secure_url,
        generatedImageUrls: generatedImages.map(img => img.url),
        videoUrl: videoUrl,
        status: "completed"
      }
    });

    // Update session status
    await prisma.productVideoSession.update({
      where: { id: videoSession.id },
      data: { status: "completed" }
    });

    // Clean up temporary files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log(`[CLEANUP] Removed temporary directory: ${tempDir}`);
    } catch (cleanupError) {
      console.error("[WARNING] Error cleaning up temporary files:", cleanupError);
    }

    console.log(`[FINISH] Successfully completed video generation for session: ${videoSession.id}`);
    return {
      success: true,
      sessionId: videoSession.id,
      images: generatedImages.map(img => ({ angle: img.angle, url: img.url })),
      video: {
        url: videoUrl
      }
    };
  } catch (error) {
    console.error("[ERROR] Error in createProductVideo:", error);
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

export async function getPreviousVideoSessions() {
  console.log("[START] getPreviousVideoSessions");
  try {
    const user = await getSessionUser();
    if (!user?.companyId) throw new Error("Unauthorized");
    console.log(`[USER] Found user: ${user.id}, company: ${user.companyId}`);

    const sessions = await prisma.productVideoSession.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        video: true
      }
    });
    console.log(`[DB] Found ${sessions.length} previous sessions`);

    return { success: true, sessions };
  } catch (error) {
    console.error("[ERROR] Error fetching previous sessions:", error);
    return { success: false, error: typeof error === 'object' && error && 'message' in error ? (error as any).message : String(error) };
  }
}
