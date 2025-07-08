// app/api/dashboard/content-generator/route.ts
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from 'cloudinary';
import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Types for Gemini API
interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
    finishReason: string;
  }>;
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
    const { 
      contentType, 
      topic, 
      tone, 
      length, 
      keywords, 
      audience, 
      includeImage,
      imageStyle,
      imagePrompt,
      customBackgroundUrl,
      textColor,
      fontSize,
      layoutOption,
      regenerate
        } = body;

    console.log(body);
    
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

    // Build custom prompt based on content type and user inputs
    const systemPrompt = generateSystemPrompt(
      contentType,
      company,
      { topic, tone, length, keywords, audience }
    );

    console.log(systemPrompt);
    
    // Generate the text content using Gemini API
    const contentResponse = await generateContent(systemPrompt);

    console.log(contentResponse);
    
    // Process the text response
    const { title, content } = processContentResponse(contentResponse, contentType);

    console.log(title, content);
    
    // Initialize response object
    const responseData: any = {
      title,
      content
    };
    
    // Generate image if requested
    if (includeImage) {
      const imagePromptText = generateImagePrompt(
        imagePrompt || topic,
        contentType,
        imageStyle,
        company
      );
      
      try {
        // Use the new implementation
        const imageUrl = await generateImage(
          imagePromptText, 
          contentType, 
          imageStyle, 
          {
            customBackgroundUrl,
            textColor,
            fontSize,
            layoutOption
          }
        );
        
        if (imageUrl) {
          responseData.imageUrl = imageUrl;
        }
        
      }catch (imageError) {
        console.error("Error generating image:", imageError);
        // Continue with text content only
      }
    }
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { message: "An error occurred while generating content" },
      { status: 500 }
    );
  }
}

// Generate the system prompt based on content type and metadata
function generateSystemPrompt(
  contentType: string,
  company: any,
  options: {
    topic: string;
    tone: string;
    length: string;
    keywords?: string;
    audience?: string;
  }
) {
  const { topic, tone, length, keywords, audience } = options;
  
  // Base context about the company
  let companyContext = `
    Company Name: ${company.name}
    Industry: ${company.industry || "Not specified"}
    Website: ${company.website || "Not specified"}
    Description: ${company.description || "Not specified"}
    Target Audience: ${company.targetAudience || audience || "General audience"}
  `;
  
  // Length parameters
  const lengthParams: Record<string, string> = {
    "short": contentType === "blog-post" ? "300-500 words" : "50-100 words",
    "medium": contentType === "blog-post" ? "700-1000 words" : "150-200 words",
    "long": contentType === "blog-post" ? "1500-2000 words" : "300-400 words"
  };
  
  // Tone instructions
  const toneInstructions: Record<string, string> = {
    "professional": "Use a formal, authoritative tone. Be clear, precise, and use industry-specific terminology where appropriate. Maintain a confident and knowledgeable voice.",
    "conversational": "Write in a friendly, approachable manner. Use contractions, ask occasional questions, and write as if speaking directly to the reader. Keep the language simple and relatable.",
    "persuasive": "Use compelling language that encourages action. Emphasize benefits, create a sense of urgency, and make strong arguments. Use rhetorical questions and powerful calls to action.",
    "humorous": "Incorporate appropriate humor and a light-hearted tone. Use wordplay, relatable scenarios, or mild jokes where suitable. Keep the content engaging and entertaining while still delivering value."
  };
  
  // Content type specific instructions
  let contentTypeInstructions = "";
  let outputFormat = "";
  
  switch (contentType) {
    case "blog-post":
      outputFormat = `
        Format the response as a blog post with:
        - An engaging title (prefixed with "Title: ")
        - A compelling introduction that hooks the reader
        - Well-structured body with subheadings for easy scanning
        - Clear, actionable insights
        - A strong conclusion with a call to action
        - Length: ${lengthParams[length]}
      `;
      break;
    
    case "instagram":
      outputFormat = `
        Format the response as an Instagram post with:
        - A catchy caption (don't include a separate title)
        - Use emoji appropriately (2-4 emojis)
        - Include 3-5 relevant hashtags at the end
        - Keep the text concise and visually descriptive
        - Length: ${lengthParams[length]}
      `;
      break;
    
    case "linkedin":
      outputFormat = `
        Format the response as a LinkedIn post with:
        - A strong opening statement or question to grab attention
        - Professional tone with valuable insights
        - Use paragraph breaks for readability
        - End with a thought-provoking question or call to action
        - Optional: 3-5 relevant hashtags at the end
        - Length: ${lengthParams[length]}
      `;
      break;
    
    case "twitter":
      outputFormat = `
        Format the response as a Twitter post with:
        - Concise, impactful messaging
        - Use appropriate hashtags (1-2 maximum)
        - Strong call to action or thought-provoking idea
        - Length: Maximum 280 characters
      `;
      break;
    
    case "facebook":
      outputFormat = `
        Format the response as a Facebook post with:
        - An engaging opening that encourages reading
        - Clear value proposition
        - Conversational tone
        - End with a question or call to action to encourage engagement
        - Length: ${lengthParams[length]}
      `;
      break;
    
    case "email":
      outputFormat = `
        Format the response as an email campaign with:
        - A compelling subject line (prefixed with "Subject: ")
        - Personalized greeting
        - Clear, scannable body content
        - Specific call to action
        - Professional sign-off
        - Length: ${lengthParams[length]}
      `;
      break;
    
    case "product-description":
      outputFormat = `
        Format the response as a product description with:
        - A compelling headline (prefixed with "Title: ")
        - Highlight key features and benefits
        - Address customer pain points
        - Include sensory details where appropriate
        - End with a persuasive call to action
        - Length: ${lengthParams[length]}
      `;
      break;
    
    case "ad-copy":
      outputFormat = `
        Format the response as advertising copy with:
        - A attention-grabbing headline (prefixed with "Title: ")
        - Compelling value proposition
        - Clear benefits (not just features)
        - Address pain points
        - Strong, urgent call to action
        - Length: ${lengthParams[length]}
      `;
      break;
  }
  
  // Keywords instruction
  const keywordsInstruction = keywords ? 
    `Naturally incorporate these keywords where appropriate: ${keywords}` : 
    "";
  
  // Audience instruction
  const audienceInstruction = audience ? 
    `Target this content specifically for: ${audience}` : 
    "";
  
  // Combine all instructions
  return `
    You are an expert marketing content creator for ${company.name}. Create high-quality content based on the following information.
    
    ABOUT THE COMPANY:
    ${companyContext}
    
    CONTENT REQUEST:
    Topic: ${topic}
    Type: ${contentType}
    
    TONE AND STYLE:
    ${toneInstructions[tone]}
    
    ADDITIONAL INSTRUCTIONS:
    ${keywordsInstruction}
    ${audienceInstruction}
    
    OUTPUT FORMAT:
    ${outputFormat}
    
    Create original, engaging, and high-quality content that represents the brand effectively and resonates with the target audience.
    DO NOT use generic placeholders like [Company Name] or [Product Name].
    DO NOT mention that this is AI-generated content.
  `;
}

// Function to generate image prompt
function generateImagePrompt(
  basePrompt: string,
  contentType: string,
  imageStyle: string,
  company: any
) {
  // Style descriptions
  const styleDescriptions: Record<string, string> = {
    "modern": "modern, clean, minimalist aesthetic with contemporary design elements",
    "vintage": "vintage aesthetic with retro elements, nostalgic feel, classic design",
    "bold": "bold colors, high contrast, vibrant and eye-catching design elements",
    "minimalist": "minimalist design, clean lines, ample white space, subtle colors",
    "professional": "professional business setting, corporate aesthetic, polished and refined",
    "playful": "playful and fun design, bright colors, creative and whimsical elements"
  };
  
  // Platform-specific characteristics
  const platformGuides: Record<string, string> = {
    "instagram": "square format ideal for Instagram, visually striking composition",
    "linkedin": "professional looking imagery suitable for business audience",
    "twitter": "attention-grabbing visual that works well in Twitter feed",
    "facebook": "engaging image that stands out in Facebook timeline",
    "blog-post": "high-quality header image for a blog post",
    "email": "email header image, professional and relevant to the content",
    "product-description": "product showcase image with clean background",
    "ad-copy": "advertising visual, compelling and conversion-focused"
  };
  
  // Build the prompt
  return `
    Create a ${styleDescriptions[imageStyle]} image for ${company.name} 
    about "${basePrompt}" for use as a ${platformGuides[contentType] || "marketing visual"}.
    
    Industry: ${company.industry || "Business"}
    
    The image should be photorealistic, high quality, and suitable for professional marketing use.
    Do not include text in the image. Focus on visual elements only.
  `;
}

// Function to call Gemini API for text content
async function generateContent(prompt: string): Promise<any> {
    const API_KEY = process.env.GEMINI_API_KEY;
  
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
  
    const genAI = new GoogleGenAI({apiKey: API_KEY});
    // Use the generative models property instead of getGenerativeModel
  
    try {
   
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
     
    })
  
      return result;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error(`Gemini API error: ${JSON.stringify(error)}`);
    }
  }
async function generateImage(prompt: string, contentType: string, imageStyle: string, userParams: any = {}): Promise<string | null> {
  const API_KEY = process.env.BANNERBEAR_API_KEY;
  
  if (!API_KEY) {
    throw new Error("BANNERBEAR_API_KEY is not defined in environment variables");
  }
  
  try {
    // Generate title text from the prompt
    const titleText = prompt.length > 80 ? prompt.substring(0, 80) + "..." : prompt;
    
    // Template ID from your Bannerbear account - you can keep this or set up template mapping
    const templateId = "1eGqK9b3zPgwDnaYpP"; // Your current template ID
    
    // Start building modifications array
    const modifications: any[] = [
      {
        name: "title",
        text: titleText
      }
    ];
    
    // Handle background image
    if (userParams.customBackgroundUrl) {
      // Use custom background from user
      modifications.push({
        name: "background",
        // image_url: userParams.customBackgroundUrl
      });
    } else {
      // Use style-based background images
      const backgroundImages: Record<string, string> = {
        "modern": "https://plus.unsplash.com/premium_photo-1673795753320-a9df2df4461e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2fHx8ZW58MHx8fHx8",
        "vintage": "https://plus.unsplash.com/premium_photo-1682125731656-76a74c4b7395?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dmludGFnZXxlbnwwfHwwfHx8MA%3D%3D",
        "bold": "https://plus.unsplash.com/premium_photo-1715628114135-516046d1ad06?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Ym9sZHxlbnwwfHwwfHx8MA%3D%3D",
        "minimalist": "https://source.unsplash.com/random/1200x800/?minimalist,white",
        "professional": "https://source.unsplash.com/random/1200x800/?business,office",
        "playful": "https://source.unsplash.com/random/1200x800/?fun,colorful",
        "default": "https://www.bannerbear.com/images/tools/photos/photo-1568096889942-6eedde686635.jpeg"
      };
      
      modifications.push({
        name: "background",
        // image_url: backgroundImages[imageStyle] || backgroundImages.default
      });
    }
    
    // Add text styling if provided in userParams
    if (userParams.textColor) {
      modifications.push({
        name: "title",
        color: userParams.textColor
      });
    }
    
    // Handle layout positioning if supported by your template
    if (userParams.layoutOption) {
      const layoutMapping: Record<string, {x: number, y: number}> = {
        "center": {x: 0, y: 0},
        "top": {x: 0, y: -150},
        "bottom": {x: 0, y: 150},
        "left": {x: -150, y: 0},
        "right": {x: 150, y: 0}
      };
      
      const position = layoutMapping[userParams.layoutOption] || layoutMapping.center;
      
      modifications.push({
        name: "title",
        shift_x: position.x,
        shift_y: position.y
      });
    }
    
    // Handle font size if provided
    if (userParams.fontSize) {
      // Some templates might not support font_size directly, so we're using a different approach
      // This is a workaround since Bannerbear templates have different capabilities
      // You may need to adjust this based on your specific template
      const fontSizeModifier = Math.max(0.5, Math.min(2.0, userParams.fontSize / 36));
      
      modifications.push({
        name: "title",
        // Using scale as an alternative if font_size isn't supported
        scale: fontSizeModifier
      });
    }
    
    console.log("Making Bannerbear request with modifications:", modifications);
    
    // Make the API call to Bannerbear
    const response = await fetch('https://api.bannerbear.com/v2/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        template: templateId,
        modifications: modifications
      })
    });
    
    if (!response.ok) {
      throw new Error(`Bannerbear API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(data);
    
    // Poll for image until it's ready
    const imageData = await waitForImage(data.uid, API_KEY);
    console.log(imageData);
    
    // Return the direct URL of the generated image
    return imageData.image_url;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}
// Helper function to poll for image generation completion
async function waitForImage(uid: string, apiKey: string, maxAttempts = 10): Promise<any> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    const response = await fetch(`https://api.bannerbear.com/v2/images/${uid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to check image status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'completed' && data.image_url) {
      return data;
    } else if (data.status === 'failed') {
      throw new Error('Image generation failed');
    }
    
    // Wait 1-2 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  throw new Error('Image generation timed out');
}
// Function to process content response and extract title/body
function processContentResponse(
  response: GeminiResponse, 
  contentType: string
): { title?: string; content: string } {
  // Check if we have a valid response
  if (!response.candidates || response.candidates.length === 0 ||
      !response.candidates[0].content || !response.candidates[0].content.parts) {
    return { content: "Failed to generate content. Please try again." };
  }
  
  // Get the text from the response
  const text = response.candidates[0].content.parts
    .map(part => part.text || "")
    .join("");
  
  // For content types that include titles
  if (["blog-post", "product-description", "ad-copy", "email"].includes(contentType)) {
    const titleMatch = text.match(/Title:\s*(.*?)(?:\n|$)/);
    const title = titleMatch ? titleMatch[1].trim() : undefined;
    
    // Remove the title from the content
    let content = text;
    if (title) {
      content = content.replace(/Title:\s*(.*?)(?:\n|$)/, "").trim();
    }
    
    return { title, content };
  }
  
  // For email, extract subject line
  if (contentType === "email") {
    const subjectMatch = text.match(/Subject:\s*(.*?)(?:\n|$)/);
    const title = subjectMatch ? subjectMatch[1].trim() : undefined;
    
    // Remove the subject from the content
    let content = text;
    if (title) {
      content = content.replace(/Subject:\s*(.*?)(?:\n|$)/, "").trim();
    }
    
    return { title, content };
  }
  
  // For other content types without explicit titles
  return { content: text };
}