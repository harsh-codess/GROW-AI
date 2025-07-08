"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { fetchProducts, analyzeProduct } from "../../../../actions/competiotionAnalysis/actions";
import { toast } from "sonner";
import { Loader2, BarChart2, TrendingUp, ArrowUpRight } from "lucide-react";

interface Product {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

interface Analysis {
  marketAnalysis: string;
  improvementSuggestions: string[];
  competitorInsights: string[];
}

export default function CompetitionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data.organic_results || []);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (product: Product) => {
    setSelectedProduct(product);
    setAnalyzing(true);
    try {
      const analysisData = await analyzeProduct(product.title);
      setAnalysis(analysisData);
    } catch (error) {
      toast.error("Failed to analyze product");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <motion.h1
            className="text-3xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Competition Analysis
          </motion.h1>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Analyze your competitors and get market insights
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Button
            onClick={loadProducts}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BarChart2 className="mr-2 h-4 w-4" />
            )}
            Load Products
          </Button>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
          >
            <Card className="border-gray-100 hover:border-purple-200 hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle className="text-lg">{product.title}</CardTitle>
                <CardDescription>{product.source}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{product.snippet}</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleAnalyze(product)}
                  disabled={analyzing}
                >
                  {analyzing && selectedProduct?.title === product.title ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <TrendingUp className="mr-2 h-4 w-4" />
                  )}
                  Analyze
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {analysis && selectedProduct && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <Card className="border-gray-100">
            <CardHeader>
              <CardTitle>Analysis for {selectedProduct.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Market Analysis</h3>
                <p className="text-sm text-gray-600">{analysis.marketAnalysis}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Improvement Suggestions</h3>
                <ul className="space-y-2">
                  {analysis.improvementSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <ArrowUpRight className="h-4 w-4 text-purple-600 mr-2 mt-1" />
                      <span className="text-sm text-gray-600">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Competitor Insights</h3>
                <ul className="space-y-2">
                  {analysis.competitorInsights.map((insight, index) => (
                    <li key={index} className="flex items-start">
                      <BarChart2 className="h-4 w-4 text-blue-600 mr-2 mt-1" />
                      <span className="text-sm text-gray-600">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
