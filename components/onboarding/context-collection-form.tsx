// components/onboarding/context-collection-form.tsx
"use client";

import { ChangeEvent, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  X, 
  Globe, 
  Package, 
  Zap, 
  Upload, 
  Trash2, 
  Terminal, 
  Database, 
  Server, 
  Code
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ContextCollectionData {
  documents: File[];
  socialAccounts: string[];
  productDescriptions: string;
  sellingPoints: string;
}

interface ContextCollectionFormProps {
  data: ContextCollectionData;
  updateData: (fields: Partial<ContextCollectionData>) => void;
}

export function ContextCollectionForm({ data, updateData }: ContextCollectionFormProps) {
  const [socialAccount, setSocialAccount] = useState("");

  const handleDocumentChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const filesArray = Array.from(e.target.files);
    updateData({ documents: [...data.documents, ...filesArray] });
  };

  const removeDocument = (index: number) => {
    const newDocuments = [...data.documents];
    newDocuments.splice(index, 1);
    updateData({ documents: newDocuments });
  };

  const addSocialAccount = () => {
    if (!socialAccount.trim()) return;
    
    updateData({ socialAccounts: [...data.socialAccounts, socialAccount] });
    setSocialAccount("");
  };

  const removeSocialAccount = (index: number) => {
    const newAccounts = [...data.socialAccounts];
    newAccounts.splice(index, 1);
    updateData({ socialAccounts: newAccounts });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center text-gray-200">
          <Database className="h-4 w-4 mr-2 text-[#bcee45]" />
          Upload Source Files
        </Label>
        <div className="flex flex-col gap-4">
          <div className="border-2 border-dashed border-[#323232] rounded-xl p-6 bg-[#232323]/50 hover:bg-[#232323] transition-colors">
            <label className="flex flex-col items-center justify-center cursor-pointer">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <div className="p-3 rounded-full bg-[#bcee45]/20 mb-2 mx-auto">
                  <FileText className="h-6 w-6 text-[#bcee45]" />
                </div>
                <span className="text-sm text-gray-300 font-medium">
                  Click to upload documents
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOCX, TXT (max 10MB each)
                </p>
              </motion.div>
              <input 
                type="file" 
                multiple
                accept=".pdf,.docx,.doc,.txt" 
                className="hidden" 
                onChange={handleDocumentChange}
              />
            </label>
          </div>
          
          <AnimatePresence>
            {data.documents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-[#232323]/50 rounded-xl p-4 border border-[#323232]">
                  <h3 className="font-medium text-sm mb-3 text-gray-200 flex items-center">
                    <Server className="h-4 w-4 mr-2 text-[#bcee45]" />
                    Data Storage ({data.documents.length})
                  </h3>
                  <ul className="space-y-2">
                    {data.documents.map((doc, index) => (
                      <motion.li 
                        key={index} 
                        className="flex justify-between items-center p-2 bg-[#1a1a1a] rounded-lg border border-[#323232] group hover:border-[#bcee45]/30 transition-all"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center">
                          <div className="p-2 bg-[#bcee45]/10 rounded-md mr-3">
                            <FileText className="h-4 w-4 text-[#bcee45]" />
                          </div>
                          <div>
                            <span className="text-sm font-medium truncate block max-w-[180px] text-gray-200 group-hover:text-[#bcee45] transition-colors">{doc.name}</span>
                            <span className="text-xs text-gray-500">{(doc.size / 1024).toFixed(0)} KB</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeDocument(index)}
                          className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-red-400 hover:bg-[#232323]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="text-xs text-gray-500">
          AI will analyze these documents to populate database nodes
        </p>
      </div>
      
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center text-gray-200">
          <Globe className="h-4 w-4 mr-2 text-[#bcee45]" />
          Network Endpoints
        </Label>
        <div className="flex gap-2">
          <Input 
            placeholder="https://linkedin.com/company/yourcompany" 
            value={socialAccount}
            onChange={(e) => setSocialAccount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSocialAccount()}
            className="bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
          />
          <Button 
            type="button" 
            variant="secondary"
            onClick={addSocialAccount}
            className="bg-[#232323] border border-[#323232] text-gray-200 hover:bg-[#1a1a1a] hover:text-[#bcee45] hover:border-[#bcee45]/30"
          >
            Add
          </Button>
        </div>
        
        <AnimatePresence>
          {data.socialAccounts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <ul className="space-y-2">
                {data.socialAccounts.map((account, index) => (
                  <motion.li 
                    key={index} 
                    className="flex justify-between items-center p-2 bg-[#1a1a1a] rounded-lg border border-[#323232] group hover:border-[#bcee45]/30 transition-all"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-sm truncate max-w-[300px] text-gray-300 group-hover:text-[#bcee45] transition-colors">{account}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeSocialAccount(index)}
                      className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-red-400 hover:bg-[#232323]"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
        
        <p className="text-xs text-gray-500">
          AI will analyze your network presence for deeper insights
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="product-descriptions" className="text-sm font-medium flex items-center text-gray-200">
          <Package className="h-4 w-4 mr-2 text-[#bcee45]" />
          Asset Registry
        </Label>
        <Textarea 
          id="product-descriptions" 
          placeholder="Describe your products or services in detail" 
          rows={3}
          value={data.productDescriptions}
          onChange={(e) => updateData({ productDescriptions: e.target.value })}
          className="resize-none bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
        />
        <p className="text-xs text-gray-500">
          This information will be used to generate product-specific marketing content
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="selling-points" className="text-sm font-medium flex items-center text-gray-200">
          <Zap className="h-4 w-4 mr-2 text-[#bcee45]" />
          Core Advantages
        </Label>
        <Textarea 
          id="selling-points" 
          placeholder="What makes your offering unique? List your key advantages and selling points" 
          rows={3}
          value={data.sellingPoints}
          onChange={(e) => updateData({ sellingPoints: e.target.value })}
          className="resize-none bg-[#232323] border-[#323232] text-white focus:border-[#bcee45] focus:ring-[#bcee45]/20"
        />
        <p className="text-xs text-gray-500">
          These will be emphasized in your AI-generated marketing materials
        </p>
      </div>
      
      {/* Cyberpunk detail element */}
      <div className="p-4 bg-[#232323]/80 rounded-lg border border-[#323232] relative overflow-hidden">
        {/* Diagonal cyberpunk slash line */}
        <div className="absolute -right-2 top-0 w-1 h-16 bg-[#bcee45]/20 rotate-45 transform origin-top-right"></div>
        <div className="absolute -left-2 bottom-0 w-1 h-16 bg-[#bcee45]/20 rotate-45 transform origin-bottom-left"></div>
        
        <div className="flex items-start gap-3">
          <Terminal className="h-5 w-5 text-[#bcee45] mt-0.5" />
          <div>
            <div className="text-sm font-medium text-white flex items-center gap-2">
              <span>Initializing AI Analytics</span>
              <span className="inline-block w-2 h-2 rounded-full bg-[#bcee45] animate-pulse"></span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Once your database is populated, the system will automatically configure optimal marketing parameters based on your data inputs. 
              For maximum efficiency, include as much detailed information as possible.
            </p>
            <div className="mt-2">
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <Code className="h-3 w-3 text-[#bcee45]" />
                <span>System readiness: <span className="text-[#bcee45]">83%</span></span>
              </div>
              <div className="mt-1 h-1 w-full bg-[#323232] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#bcee45] to-[#dcff65] rounded-full" style={{ width: "83%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}