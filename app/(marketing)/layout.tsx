// app/(marketing)/layout.tsx
import { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "FlowAI - AI-Powered Marketing Suite for Startups",
    template: "%s | FlowAI",
  },
  description: "Transform your startup's marketing with AI. Create content, generate product images, and build customer engagement - all with FlowAI.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#161616]">
      {children}
      <Toaster position="top-right" />
    </div>
  );
}