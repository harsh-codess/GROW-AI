
// app/api/company/profile/route.ts
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    
    if (!sessionUser || !sessionUser.companyId) {
      return NextResponse.json(
        { message: "Unauthorized or no company associated" },
        { status: 401 }
      );
    }
    
    const company = await prisma.company.findUnique({
      where: {
        id: sessionUser.companyId
      }
    });
    
    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ company });
  } catch (error) {
    console.error("Error fetching company profile:", error);
    return NextResponse.json(
      { message: "An error occurred fetching company profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    
    if (!sessionUser || !sessionUser.companyId) {
      return NextResponse.json(
        { message: "Unauthorized or no company associated" },
        { status: 401 }
      );
    }
    
    // For form data with file upload
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const website = formData.get('website') as string;
    const industry = formData.get('industry') as string;
    const size = formData.get('size') as string;
    const primaryColor = formData.get('primaryColor') as string;
    const missionStatement = formData.get('missionStatement') as string;
    const targetAudience = formData.get('targetAudience') as string;
    const logoFile = formData.get('logo') as File | null;
    
    let logoUrl = null;
    
    if (logoFile) {
      // Handle file upload logic here
      logoUrl = `/uploads/logos/${Date.now()}-${logoFile.name}`;
      
      // In a real implementation, you would upload to cloud storage
    }
    
    const updatedCompany = await prisma.company.update({
      where: {
        id: sessionUser.companyId
      },
      data: {
        name,
        website,
        industry,
        size,
        primaryColor,
        missionStatement,
        targetAudience,
        ...(logoUrl && { logo: logoUrl }),
      }
    });
    
    return NextResponse.json({ 
      company: updatedCompany,
      message: "Company profile updated successfully" 
    });
  } catch (error) {
    console.error("Error updating company profile:", error);
    return NextResponse.json(
      { message: "An error occurred updating company profile" },
      { status: 500 }
    );
  }
}