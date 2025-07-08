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

export async function generateVideo(imageData: string, productType: string, productName: string) {
    try {
        // Get the current user
        const user = await getSessionUser();
        if (!user?.id || !user?.companyId) {
            throw new Error("Unauthorized or user not associated with a company");
        }

        // Create video session in database
        const videoSession = await prisma.productVideoSession.create({
            data: {
                companyId: user.companyId,
                productType,
                status: "processing"
            }
        });

        // Upload original image to Cloudinary
        const originalUpload = await cloudinary.uploader.upload(imageData, {
            folder: `product-videos/${user.companyId}`,
            resource_type: 'image'
        });

        // Generate video using Replicate
        const prompt = `Generate a professional product video showcasing ${productName}, which is a ${productType}. Include dynamic camera movements and transitions.`;

        const output = await replicate.run(
            "wavespeedai/wan-2.1-i2v-480p",
            {
                input: {
                    image: originalUpload.secure_url,
                    prompt: prompt
                }
            }
        );

        if (!output) {
            throw new Error("Failed to generate video");
        }

        // Download video from Replicate URL and upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(output as unknown as string, {
            resource_type: "video",
            folder: "generated-videos",
            eager: [
                { format: "mp4", quality: "auto" }
            ],
            chunk_size: 6000000,
            timeout: 120000
        });

        // Create video record
        await prisma.productVideo.create({
            data: {
                sessionId: videoSession.id,
                companyId: user.companyId,
                originalImageUrl: originalUpload.secure_url,
                generatedImageUrls: [],
                videoUrl: uploadResponse.secure_url,
                status: "completed"
            }
        });

        // Update session status
        await prisma.productVideoSession.update({
            where: { id: videoSession.id },
            data: { status: "completed" }
        });

        return {
            success: true,
            videoUrl: uploadResponse.secure_url,
            publicId: uploadResponse.public_id
        };
    } catch (error) {
        console.error("Error in generateVideo:", error);
        throw error;
    }
}

export async function getPreviousVideoSessions() {
    try {
        const user = await getSessionUser();
        if (!user?.companyId) throw new Error("Unauthorized");

        // Fetch sessions and their videos
        const sessions = await prisma.productVideoSession.findMany({
            where: { companyId: user.companyId },
            orderBy: { createdAt: 'desc' },
            include: {
                video: true
            }
        });

        return { success: true, sessions };
    } catch (error) {
        console.error("Error fetching previous sessions:", error);
        return {
            success: false,
            error: typeof error === 'object' && error && 'message' in error ?
                (error as any).message : String(error)
        };
    }
}
