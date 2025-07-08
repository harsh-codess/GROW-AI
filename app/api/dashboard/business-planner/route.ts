import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";



// Add a new GET handler to fetch all plans for the current user
export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    
    if (!sessionUser || !sessionUser.companyId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Fetch all business plans for the user's company
    const businessPlans = await prisma.businessPlan.findMany({
      where: {
        companyId: sessionUser.companyId
      },
      include: {
        milestones: {
          include: {
            tasks: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Most recent plans first
      }
    });
    
    return NextResponse.json(businessPlans);
  } catch (error) {
    console.error("Error fetching business plans:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching business plans" },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    
    if (!sessionUser || !sessionUser.companyId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Fetch company information for context
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

    // Generate business plan using AI
    const businessPlan = await generateBusinessPlan(body, company);
    
    return NextResponse.json(businessPlan);
  } catch (error) {
    console.error("Error generating business plan:", error);
    return NextResponse.json(
      { message: "An error occurred while generating business plan" },
      { status: 500 }
    );
  }
}

// Function to generate business plan with AI
async function generateBusinessPlan(businessData: any, company: any) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    const sessionUser = await getSessionUser();
    
    if (!sessionUser || !sessionUser.companyId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Build the prompt for business plan generation
    const prompt = `
    I need a strategic business plan generated for a company with the following details:
    
    COMPANY BASICS:
    Business Name: ${businessData.businessName}
    Description: ${businessData.businessDescription}
    Industry: ${businessData.industry}
    Current Stage: ${businessData.stage}
    Target Location: ${businessData.location}
    
    PRODUCT/SERVICE:
    Description: ${businessData.productDescription}
    Key Features: ${businessData.keyFeatures}
    Development Stage: ${businessData.developmentStage}
    
    MARKET ANALYSIS:
    Target Customer: ${businessData.targetCustomer}
    Market Size: ${businessData.marketSize}
    Competitors: ${businessData.competitors}
    Unique Selling Proposition: ${businessData.uniqueSellingProposition}
    
    FINANCIAL INFORMATION:
    Funding Status: ${businessData.fundingStatus}
    Revenue Model: ${businessData.revenueModel}
    Initial Budget: ${businessData.initialBudget}
    
    STRATEGY & GOALS:
    Short-Term Goals: ${businessData.shortTermGoals}
    Long-Term Vision: ${businessData.longTermVision}
    Marketing Approach: ${businessData.marketingApproach}
    Timeline Focus: ${businessData.timelineFocus}
    
    Based on this information, generate a comprehensive business plan with the following structured output in JSON format:
    
    1. businessName: The name of the business
    2. executiveSummary: A concise 2-3 paragraph summary of the business plan
    3. targetMarket: A short description of the target market
    4. competitiveAdvantage: A short description of the competitive advantage
    5. revenueModel: A short description of the revenue model
    6. keyMilestonesShort: A brief 1-2 sentence summary of key milestones
    7. timeline: An array of strategic milestones with the following structure:
       - id: A unique identifier for the milestone
       - title: A short, clear title for the milestone
       - description: A description of the milestone
       - timeframe: When this should be achieved (e.g., "Month 1-3", "Q3 Year 1", etc.)
       - category: The category of the milestone (one of: "Marketing", "Product", "Customer", "Financial", "Operations")
       - tasks: An array of 3-5 specific tasks needed to achieve this milestone
       - resources: An array of 2-3 required resources (e.g., "Graphic designer", "$5,000 ad budget")
       - metrics: An array of 2-3 metrics to measure success
    
    The timeline should be realistic, actionable, and follow a logical progression for this specific business. Adapt the timeline to the business stage, funding status, and timeline focus specified. Create 6-10 milestones covering key aspects of the business.
    
    Format the response as a clean JSON object that can be parsed by JavaScript.
    `;
    
    // Call Gemini API
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8000,
      },
    });
    
    const response = result.response;
    const responseText = response.text();
    
    // Parse the JSON response
    // Sometimes the model might include markdown backticks, so we need to clean that up
    const cleanedResponse = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    const businessPlan = JSON.parse(cleanedResponse);
    
   // Save the generated plan to the database
   const savedPlan = await prisma.businessPlan.create({
    data: {
      name: businessPlan.businessName,
      companyId: company.id,
      userId: sessionUser.id,
      planData: businessPlan,
      status: 'active',
      milestones: {
        create: businessPlan.timeline.map((milestone: any) => ({
          title: milestone.title,
          description: milestone.description,
          timeframe: milestone.timeframe,
          category: milestone.category,
          resources: milestone.resources || [],
          metrics: milestone.metrics || [],
          tasks: {
            create: (milestone.tasks || []).map((task: string) => ({
              description: task,
              status: "not_started"
            }))
          }
        }))
      }
    },
    include: {
      milestones: {
        include: {
          tasks: true
        }
      }
    }
  });
  
  // Add the saved plan ID to the response
  businessPlan.planId = savedPlan.id;
    return businessPlan;
  } catch (error) {
    console.error("Error in generateBusinessPlan:", error);
    throw error;
  }
}