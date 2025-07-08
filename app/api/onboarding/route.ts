// app/api/onboarding/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    
    if (!sessionUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Process form data
    const formData = await request.formData();
    
    // Parse JSON data
    const companyBasics = JSON.parse(formData.get('companyBasics') as string);
    const brandProfile = JSON.parse(formData.get('brandProfile') as string);
    const contextCollection = JSON.parse(formData.get('contextCollection') as string);
    
    // Handle logo file
    let logoUrl: string | null = null;
    const logoFile = formData.get('logo') as File;
    
    if (logoFile) {
      // Ensure uploads directory exists
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
      await mkdir(uploadsDir, { recursive: true });
      
      // Create unique filename
      const filename = `${Date.now()}-${logoFile.name.replace(/\s+/g, '-')}`;
      const filePath = path.join(uploadsDir, filename);
      
      // Write file to disk
      const arrayBuffer = await logoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await writeFile(filePath, buffer);
      
      // Set logo URL (relative to public directory)
      logoUrl = `/uploads/logos/${filename}`;
    }
    
    // Create company
    const company = await prisma.company.create({
      data: {
        name: companyBasics.name,
        website: companyBasics.website,
        industry: companyBasics.industry,
        size: companyBasics.size,
        fundingStage: companyBasics.fundingStage,
        logo: logoUrl,
        primaryColor: brandProfile.primaryColor,
        missionStatement: brandProfile.missionStatement,
        targetAudience: brandProfile.targetAudience,
        description: `${brandProfile.missionStatement} ${contextCollection.productDescriptions}`.trim(),
        onboardingCompleted: true,
      },
    });
    
    // Link user to company
    await prisma.user.update({
      where: {
        id: sessionUser.id,
      },
      data: {
        companyId: company.id,
      },
    });
    
    // Process documents
    const documentsDir = path.join(process.cwd(), 'public', 'uploads', 'documents', company.id);
    await mkdir(documentsDir, { recursive: true });
    
    const documentPromises = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('document-') && value instanceof File) {
        const documentFile = value as File;
        
        // Create unique filename
        const filename = `${Date.now()}-${documentFile.name.replace(/\s+/g, '-')}`;
        const filePath = path.join(documentsDir, filename);
        
        // Write file to disk
        const arrayBuffer = await documentFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await writeFile(filePath, buffer);
        
        // Create document record
        const fileUrl = `/uploads/documents/${company.id}/${filename}`;
        const fileType = documentFile.name.split('.').pop() || 'unknown';
        
        const documentPromise = prisma.document.create({
          data: {
            companyId: company.id,
            name: documentFile.name,
            fileUrl: fileUrl,
            fileType: fileType,
            status: "uploaded", // We would process this in a background job in a real app
          },
        });
        
        documentPromises.push(documentPromise);
      }
    }
    
    // Wait for all document creations to complete
    if (documentPromises.length > 0) {
      await Promise.all(documentPromises);
    }
    
    return NextResponse.json({
      message: "Onboarding completed successfully",
      companyId: company.id,
    });
  } catch (error) {
    console.error("Error in onboarding:", error);
    return NextResponse.json(
      { message: "An error occurred during onboarding" },
      { status: 500 }
    );
  }
}