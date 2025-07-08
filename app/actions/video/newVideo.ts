'use server';

import Replicate from "replicate";
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/auth";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN || '',
});

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

        // Generate video using Replicate's minimax/video-01-director model
        const prompt = customPrompt || `[360-degree rotation, cinematic lighting, professional product showcase] A premium ${productType} called "${productName}" is displayed on a sleek turntable in a modern studio. [Truck left, smooth orbit] The camera circles the product, revealing every angle and detail with precision. [Close-up, rack focus] Highlights shift across the surface, emphasizing texture, material, and craftsmanship. [Pull out, tilt up] The product stands out against a soft gradient background that complements its color palette. Professional lighting casts dynamic shadows and subtle reflections, creating an aspirational, high-end feel designed for ecommerce presentation.`;

        const output = await replicate.run(
            "minimax/video-01-director",
            {
                input: {
                    prompt: prompt,
                    first_frame_image: originalUpload.secure_url
                }
            }
        ) as unknown as string;

        if (!output) {
            throw new Error("Failed to generate video");
        }

        // Download the video from Replicate
        const videoResponse = await fetch(output);
        const videoBuffer = await videoResponse.arrayBuffer();
        const videoBase64 = Buffer.from(videoBuffer).toString('base64');
        const videoDataUrl = `data:video/mp4;base64,${videoBase64}`;

        // Upload video to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(videoDataUrl, {
            resource_type: "video",
            folder: `product-videos/${user.companyId}`,
            eager: [
                { format: "mp4", quality: "auto" }
            ],
            chunk_size: 6000000,
            timeout: 120000
        });

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