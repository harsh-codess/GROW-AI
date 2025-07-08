import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callSid = formData.get("CallSid") as string;
    const callStatus = formData.get("CallStatus") as string;
    const callDuration = formData.get("CallDuration") as string;
    
    if (!callSid) {
      return NextResponse.json({ error: "CallSid is required" }, { status: 400 });
    }
    
    // Find the call in our database
    const call = await prisma.callHistory.findUnique({
      where: { callSid }
    });
    
    if (!call) {
      console.log(`Call not found for SID: ${callSid}`);
      return NextResponse.json({ message: "Call not found" }, { status: 404 });
    }
    
    // Update call history with actual call status and duration
    await prisma.callHistory.update({
      where: { callSid },
      data: {
        callAnswered: callStatus === "completed",
        callEndedAt: new Date(),
        callDuration: parseInt(callDuration || "0")
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing Twilio callback:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}