"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, useAnimation } from "framer-motion";
import { toast } from "sonner";
import { Terminal, Zap, Code, Layout, Sparkles, CheckCircle2 } from "lucide-react";

export interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  icon: React.ReactNode;
  iconBg: string;
}

export const templates: Template[] = [
  {
    id: "minimal",
    name: "Minimal Business Email",
    description: "Clean and professional template for business communications",
    icon: <Code className="h-5 w-5 text-[#161616]" />,
    iconBg: "bg-gradient-to-br from-[#bcee45] to-[#9bc42c]",
    preview: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Minimal Business Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
            <td style="padding: 20px; background-color: #2c3e50; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">[Company Name]</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
                <p style="margin-top: 0; color: #333333; font-size: 16px;">Dear [Recipient Name],</p>
                <p style="color: #333333; font-size: 16px; line-height: 1.5;">[Email Content]</p>
                <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #2c3e50;">
                    <h3 style="margin-top: 0; color: #2c3e50; font-size: 18px;">Key Benefits:</h3>
                    <ul style="color: #333333; font-size: 16px; line-height: 1.5; padding-left: 20px;">
                        <li>[Benefit 1]</li>
                        <li>[Benefit 2]</li>
                        <li>[Benefit 3]</li>
                    </ul>
                </div>
                <p style="color: #333333; font-size: 16px; line-height: 1.5; margin-bottom: 0;">Best regards,</p>
                <p style="color: #333333; font-size: 16px; line-height: 1.5; margin-top: 5px;">
                    [Your Name]<br>
                    [Your Position]
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px; background-color: #f1f1f1; text-align: center; border-top: 3px solid #2c3e50;">
                <p style="margin: 0; color: #666666; font-size: 14px;">© 2025 [Company Name]. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>`
  },
  {
    id: "colorful",
    name: "Colorful Announcement Email",
    description: "Vibrant template for announcements and promotions",
    icon: <Sparkles className="h-5 w-5 text-[#161616]" />,
    iconBg: "bg-gradient-to-br from-[#bcee45] to-[#9bc42c]",
    preview: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Colorful Announcement Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f0f0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
            <td>
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td style="background-color: #8e44ad; padding: 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">[Announcement Title]</h1>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding: 30px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
                <p style="color: #333333; font-size: 16px; line-height: 1.5;">Hello [Recipient Name],</p>
                <p style="color: #333333; font-size: 16px; line-height: 1.5;">[Email Content]</p>
                <div style="margin: 25px 0; padding: 25px; background-color: #f3e5f5; border-radius: 10px; text-align: center;">
                    <h2 style="color: #8e44ad; margin: 0 0 15px 0; font-size: 24px;">[Feature Title]</h2>
                    <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">[Feature Description]</p>
                </div>
                <p style="color: #333333; font-size: 16px; line-height: 1.5; margin-bottom: 0;">Warm regards,</p>
                <p style="color: #333333; font-size: 16px; line-height: 1.5; margin-top: 5px;">The [Company Name] Team</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px; background-color: #8e44ad; text-align: center;">
                <p style="margin: 0; color: #ffffff; font-size: 12px;">© 2025 [Company Name]. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>`
  },
  {
    id: "newsletter",
    name: "Modern Newsletter Email",
    description: "Contemporary template for newsletters and updates",
    icon: <Layout className="h-5 w-5 text-[#161616]" />,
    iconBg: "bg-gradient-to-br from-[#bcee45] to-[#9bc42c]",
    preview: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Modern Newsletter Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f7f7;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
            <td style="padding: 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td style="background-color: #3498db; padding: 15px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 300; letter-spacing: 1px;">[Newsletter Title]</h1>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding: 30px 20px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">
                <p style="color: #555555; font-size: 16px; line-height: 1.5;">Hello [Recipient Name],</p>
                <p style="color: #555555; font-size: 16px; line-height: 1.5;">[Email Content]</p>
                <div style="margin: 30px 0; padding-bottom: 20px; border-bottom: 1px solid #e0e0e0;">
                    <h2 style="color: #3498db; margin: 0 0 15px 0; font-size: 22px; font-weight: 600;">[Article Title]</h2>
                    <p style="color: #555555; font-size: 16px; line-height: 1.5;">[Article Content]</p>
                </div>
                <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-bottom: 0;">Best regards,</p>
                <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-top: 5px;">The [Company Name] Team</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px; background-color: #ecf0f1; text-align: center; border-top: 3px solid #3498db;">
                <p style="margin: 0; color: #555555; font-size: 12px;">© 2025 [Company Name]. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>`
  }
];

interface EmailTemplatesProps {
  onTemplateSelect: (template: string) => void;
}

export function EmailTemplates({ onTemplateSelect }: EmailTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Ref for glowing border animation
  const glowRef = useRef<HTMLDivElement>(null);
  const glowControls = useAnimation();

  // Load selected template from localStorage on component mount
  useEffect(() => {
    const savedTemplate = localStorage.getItem('selectedEmailTemplate');
    if (savedTemplate) {
      setSelectedTemplate(savedTemplate);
      const template = templates.find(t => t.id === savedTemplate);
      if (template) {
        onTemplateSelect(template.preview);
      }
    }
    
    // Animate the glow effect
    const animateGlow = async () => {
      while (true) {
        await glowControls.start({
          opacity: [0.3, 0.5, 0.3],
          transition: { duration: 3, ease: "easeInOut" }
        });
      }
    };
    
    animateGlow();
  }, [onTemplateSelect, glowControls]);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      onTemplateSelect(template.preview);
      // Save selected template to localStorage
      localStorage.setItem('selectedEmailTemplate', templateId);
      toast.success(`Selected ${template.name} template`, {
        style: {
          background: "#232323",
          color: "white",
          border: "1px solid #323232"
        }
      });
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Animated glow spots */}
      <motion.div 
        ref={glowRef}
        animate={glowControls}
        className="absolute top-40 left-20 w-96 h-96 bg-[#bcee45]/5 rounded-full blur-[120px] opacity-30 pointer-events-none"
      ></motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {templates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="col-span-1"
          >
            <Card 
              className={`cursor-pointer transition-all border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm hover:shadow-xl hover:shadow-[#bcee45]/5 rounded-xl overflow-hidden group relative ${
                selectedTemplate === template.id
                  ? 'border-[#bcee45]/40 shadow-[#bcee45]/10 shadow-lg'
                  : 'border-[#323232] hover:border-[#bcee45]/20'
              }`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              {/* Glowing border effect on hover */}
              <div className="absolute inset-0 border border-[#bcee45]/0 rounded-xl group-hover:border-[#bcee45]/20 transition-all pointer-events-none"></div>
              
              {/* Animated corner piece */}
              <div className="absolute top-0 right-0 w-6 h-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-1 bg-[#bcee45] rotate-45 transform origin-bottom-right opacity-30"></div>
              </div>
              
              <CardHeader className="pb-2 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-md font-medium text-gray-300 group-hover:text-white transition-colors">
                    {template.name}
                  </CardTitle>
                  <div className={`rounded-md p-2 ${template.iconBg} group-hover:shadow-lg group-hover:shadow-[#bcee45]/20 transition-all`}>
                    {template.icon}
                  </div>
                </div>
                <p className="text-sm text-gray-400">{template.description}</p>
              </CardHeader>
              <CardContent className="relative z-10">
                <div
                  className="h-40 overflow-hidden rounded-lg border border-[#323232] bg-white/10 relative"
                >
                  <div className="absolute inset-0 p-1">
                    <iframe
                      srcDoc={template.preview}
                      title={template.name}
                      className="w-full h-full bg-white opacity-30"
                      style={{ pointerEvents: "none" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-[#232323]/80 px-2 py-1 rounded text-xs text-[#bcee45]">
                        Preview
                      </div>
                    </div>
                  </div>
                </div>

                {selectedTemplate === template.id && (
                  <div className="mt-2 flex justify-center">
                    <span className="flex items-center text-xs text-[#bcee45]">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Selected
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedTemplate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          <Card className="border-[#323232] bg-gradient-to-br from-[#1a1a1a]/80 to-[#161616]/80 backdrop-blur-sm rounded-xl shadow-lg shadow-black/20 overflow-hidden relative group">
            {/* Top illuminated border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#bcee45]/30 to-transparent"></div>
            
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Terminal className="mr-2 h-4 w-4 text-[#bcee45]" />
                Template Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="h-[500px] overflow-auto rounded-lg border border-[#323232] bg-white/10 relative"
              >
                <iframe
                  srcDoc={templates.find(t => t.id === selectedTemplate)?.preview || ''}
                  title="Template Preview"
                  className="w-full h-full bg-white"
                  style={{ pointerEvents: "none" }}
                />
              </div>
              <div className="mt-4 p-4 bg-[#232323]/80 rounded-lg border border-[#323232] relative overflow-hidden group">
                <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#bcee45]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-start gap-3">
                  <Code className="h-4 w-4 text-[#bcee45] mt-1" />
                  <div>
                    <p className="text-sm text-gray-300 mb-1">Template Customization</p>
                    <p className="text-xs text-gray-400">
                      This template will be automatically customized with your campaign content and recipient details when sent.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}