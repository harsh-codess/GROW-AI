'use server';

import { GoogleGenAI } from "@google/genai";
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/auth";
import fs from 'fs';
import path from 'path';
import os from 'os';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generateVideo(
    productName: string,
    productType: string,
    imageUrl: string,
    customPrompt?: string
) {
    try {
        // Get the current user
        const user = await getSessionUser();
        if (!user?.id || !user?.companyId) {
            throw new Error("Unauthorized or user not associated with a company");
        }

        // Create a new video session first
        const videoSession = await prisma.productVideoSession.create({
            data: {
                companyId: user.companyId,
                productType: productType,
                status: "processing"
            }
        });

        // Upload original image to Cloudinary
        const originalUpload = await cloudinary.uploader.upload(imageUrl, {
            folder: `product-videos/${user.companyId}`,
            resource_type: 'image'
        });

        // Build the video generation prompt
        const prompt = customPrompt || `[360-degree rotation, cinematic lighting, professional product showcase] A premium ${productType} called "${productName}" is displayed on a sleek turntable in a modern studio. [Truck left, smooth orbit] The camera circles the product, revealing every angle and detail with precision. [Close-up, rack focus] Highlights shift across the surface, emphasizing texture, material, and craftsmanship. [Pull out, tilt up] The product stands out against a soft gradient background that complements its color palette. Professional lighting casts dynamic shadows and subtle reflections, creating an aspirational, high-end feel designed for ecommerce presentation.`;

        // Fetch the image as base64 for Veo
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString('base64');

        // Generate video using Veo 3.1 with image input
        console.log("[VEO] Starting video generation...");
        let operation = await ai.models.generateVideos({
            model: "veo-3.1-fast-generate-preview",
            prompt: prompt,
            image: {
                imageBytes: imageBase64,
                mimeType: "image/jpeg",
            },
        });

        // Poll the operation status until the video is ready
        while (!operation.done) {
            console.log("[VEO] Waiting for video generation to complete...");
            await new Promise((resolve) => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({
                operation: operation,
            });
        }

        console.log("[VEO] Video generation complete!");

        const generatedVideo = operation.response?.generatedVideos?.[0];
        if (!generatedVideo?.video) {
            throw new Error("Failed to generate video — no video in response");
        }

        // Download the video via its URI using Google Files API
        const videoFile = generatedVideo.video;
        const videoUri = (videoFile as any).uri || (videoFile as any).name;
        
        if (!videoUri) {
            throw new Error("No video URI found in response");
        }

        console.log("[VEO] Video URI:", videoUri);

        // Build download URL — URI may already contain ?alt=media
        const baseUri = videoUri.startsWith("http") 
            ? videoUri 
            : `https://generativelanguage.googleapis.com/v1beta/${videoUri}`;
        const downloadUrl = baseUri.includes("alt=media") ? baseUri : `${baseUri}?alt=media`;

        console.log("[VEO] Downloading generated video...");
        const videoFetchResponse = await fetch(downloadUrl, {
            headers: {
                "X-Goog-Api-Key": process.env.GEMINI_API_KEY!,
            }
        });
        if (!videoFetchResponse.ok) {
            const errText = await videoFetchResponse.text();
            throw new Error(`Failed to download video (${videoFetchResponse.status}): ${errText}`);
        }
        const videoBuffer = Buffer.from(await videoFetchResponse.arrayBuffer());

        // Save to temp file for Cloudinary upload
        const tempDir = path.join(os.tmpdir(), `veo-video-${videoSession.id}`);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        const tempVideoPath = path.join(tempDir, "output.mp4");
        fs.writeFileSync(tempVideoPath, videoBuffer);

        // Upload video to Cloudinary
        console.log("[CLOUDINARY] Uploading video...");
        const uploadResponse = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload(tempVideoPath, {
                resource_type: "video",
                folder: `product-videos/${user.companyId}`,
                use_filename: true,
                unique_filename: true,
                chunk_size: 6000000,
                timeout: 120000
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        console.log(`[CLOUDINARY] Video uploaded: ${uploadResponse.secure_url}`);

        // Create video record with the session ID
        await prisma.productVideo.create({
            data: {
                sessionId: videoSession.id,
                companyId: user.companyId,
                originalImageUrl: originalUpload.secure_url,
                videoUrl: uploadResponse.secure_url,
                status: "completed"
            }
        });

        // Update the session status to completed
        await prisma.productVideoSession.update({
            where: { id: videoSession.id },
            data: { status: "completed" }
        });

        // Clean up temp files
        try {
            fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
            console.warn("[CLEANUP] Failed to remove temp dir:", e);
        }

        return {
            success: true,
            videoUrl: uploadResponse.secure_url
        };
    } catch (error) {
        console.error("Error in generateVideo:", error);
        throw error;
    }
}

export async function getPreviousVideos() {
    try {
        const user = await getSessionUser();
        if (!user?.companyId) throw new Error("Unauthorized");

        // Fetch videos with their associated sessions
        const videos = await prisma.productVideo.findMany({
            where: { companyId: user.companyId },
            orderBy: { createdAt: 'desc' },
            include: {
                session: true
            }
        });

        return { success: true, videos };
    } catch (error) {
        console.error("Error fetching previous videos:", error);
        return {
            success: false,
            error: typeof error === 'object' && error && 'message' in error ?
                (error as any).message : String(error)
        };
    }
}