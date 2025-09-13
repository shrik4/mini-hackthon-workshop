import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  List, 
  Code, 
  Presentation,
  Download, 
  CheckCircle,
  RefreshCw,
  Rocket,
  Github
} from "lucide-react";
import type { Generation, MarketResearch, Feature, HackathonScore } from "@shared/schema";
import HackathonScoreDisplay from "./HackathonScore";

interface ResultsDisplayProps {
  generation: Generation;
  onNewGeneration: () => void;
}

export function ResultsDisplay({ generation, onNewGeneration }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState("market");
  
  const marketResearch: MarketResearch = generation.marketResearch 
    ? JSON.parse(generation.marketResearch) 
    : { summary: "", competitors: [] };
    
  const features: Feature[] = Array.isArray(generation.features) ? generation.features as Feature[] : [];
  const mvpFeatures = features.filter(f => f.priority === "mvp");
  const stretchFeatures = features.filter(f => f.priority === "stretch");
  
  const hackathonScore: HackathonScore | null = generation.hackathonScore 
    ? JSON.parse(generation.hackathonScore as string) 
    : null;

  const handleDownload = (type: "zip" | "pdf") => {
    window.open(`/api/generation/${generation.id}/download/${type}`, "_blank");
  };

  return (
    <div className="space-y-8">
      {/* Judge Mode - Hackathon Score */}
      {hackathonScore && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-purple-800">
              🏆 Judge Mode: AI Hackathon Evaluation
            </CardTitle>
            <p className="text-center text-purple-600">
              Auto-scored by AI • Would make judges go 🤯
            </p>
          </CardHeader>
          <CardContent>
            <HackathonScoreDisplay score={hackathonScore} />
          </CardContent>
        </Card>
      )}

      {/* Market Research Results */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-foreground flex items-center">
            <TrendingUp className="text-accent mr-3" />
            Market Research & Analysis
          </CardTitle>
          <Badge className="bg-accent/20 text-accent" data-testid="badge-market-completed">
            Completed
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium text-foreground mb-2">Market Summary</h4>
            <p className="text-muted-foreground leading-relaxed" data-testid="text-market-summary">
              {marketResearch.summary}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-3">Top Competitors</h4>
            <div className="grid md:grid-cols-3 gap-4">
              {marketResearch.competitors.map((competitor, index) => (
                <div 
                  key={index}
                  className="bg-muted/30 rounded-lg p-4"
                  data-testid={`competitor-card-${index}`}
                >
                  <h5 className="font-medium text-foreground mb-1">{competitor.name}</h5>
                  <p className="text-sm text-muted-foreground">{competitor.description}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Prioritization */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-foreground flex items-center">
            <List className="text-primary mr-3" />
            Feature Prioritization
          </CardTitle>
          <Badge className="bg-primary/20 text-primary">
            AI-Ranked
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center">
                <span className="w-3 h-3 bg-accent rounded-full mr-2"></span>
                MVP Features
              </h4>
              <div className="space-y-3">
                {mvpFeatures.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-accent/10 rounded-lg border border-accent/20"
                    data-testid={`mvp-feature-${index}`}
                  >
                    <div className="w-6 h-6 bg-accent rounded text-accent-foreground flex items-center justify-center text-xs font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground">{feature.title}</h5>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                      <span className="text-xs text-accent font-mono">{feature.techStack}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-3 flex items-center">
                <span className="w-3 h-3 bg-primary/50 rounded-full mr-2"></span>
                Stretch Features
              </h4>
              <div className="space-y-3">
                {stretchFeatures.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg"
                    data-testid={`stretch-feature-${index}`}
                  >
                    <div className="w-6 h-6 bg-muted rounded text-muted-foreground flex items-center justify-center text-xs font-bold mt-0.5">
                      {mvpFeatures.length + index + 1}
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground">{feature.title}</h5>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                      <span className="text-xs text-muted-foreground font-mono">{feature.techStack}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Scaffold */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-foreground flex items-center">
            <Code className="text-blue-400 mr-3" />
            React Code Scaffold
          </CardTitle>
          <Badge className="bg-blue-400/20 text-blue-400">
            Ready to Deploy
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground font-mono">hackathon-app.zip</h4>
              <span className="text-xs text-muted-foreground">Generated</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Complete React application with TypeScript, Tailwind CSS, and component library. Includes mock API integration, responsive design, and development setup.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-1" />
                  React 18
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-1" />
                  Tailwind
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-1" />
                  TypeScript
                </span>
              </div>
              <Button 
                onClick={() => handleDownload("zip")}
                className="gradient-bg text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
                data-testid="button-download-zip"
              >
                <Download className="mr-2 w-4 h-4" />
                Download ZIP
              </Button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div className="bg-muted/20 rounded p-3">
              <div className="font-mono text-muted-foreground mb-1">📁 Components</div>
              <div className="space-y-0.5 text-muted-foreground">
                {features.slice(0, 4).map((feature, index) => (
                  <div key={index}>• {feature.title.replace(/[^a-zA-Z0-9]/g, '')}.tsx</div>
                ))}
              </div>
            </div>
            <div className="bg-muted/20 rounded p-3">
              <div className="font-mono text-muted-foreground mb-1">📁 Hooks</div>
              <div className="space-y-0.5 text-muted-foreground">
                <div>• useFeatureData.ts</div>
                <div>• useApiIntegration.ts</div>
                <div>• useLocalStorage.ts</div>
                <div>• useAppState.ts</div>
              </div>
            </div>
            <div className="bg-muted/20 rounded p-3">
              <div className="font-mono text-muted-foreground mb-1">📁 Utils</div>
              <div className="space-y-0.5 text-muted-foreground">
                <div>• apiClient.ts</div>
                <div>• storageHelper.ts</div>
                <div>• validationUtils.ts</div>
                <div>• formatters.ts</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pitch Deck */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-foreground flex items-center">
            <Presentation className="text-orange-400 mr-3" />
            3-Slide Pitch Deck
          </CardTitle>
          <Badge className="bg-orange-400/20 text-orange-400">
            Investor Ready
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground">Pitch Deck.pdf</h4>
              <span className="text-xs text-muted-foreground">Generated</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Professional 3-slide presentation covering problem statement, solution overview, and funding ask. Optimized for 2-minute pitch format.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-1" />
                  PDF Format
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-1" />
                  2min Pitch
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-1" />
                  Market Data
                </span>
              </div>
              <Button 
                onClick={() => handleDownload("pdf")}
                className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
                data-testid="button-download-pdf"
              >
                <Download className="mr-2 w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-muted/20 rounded-lg p-4 border border-muted/30">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded mb-3 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h5 className="font-medium text-foreground text-sm mb-1">Slide 1: The Problem</h5>
              <p className="text-xs text-muted-foreground">
                Identifies the key problem and market opportunity your solution addresses
              </p>
            </div>
            <div className="bg-muted/20 rounded-lg p-4 border border-muted/30">
              <div className="aspect-video bg-gradient-to-br from-accent/20 to-primary/20 rounded mb-3 flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
              <h5 className="font-medium text-foreground text-sm mb-1">Slide 2: Our Solution</h5>
              <p className="text-xs text-muted-foreground">
                Showcases your solution with key features and competitive advantages
              </p>
            </div>
            <div className="bg-muted/20 rounded-lg p-4 border border-muted/30">
              <div className="aspect-video bg-gradient-to-br from-orange-400/20 to-primary/20 rounded mb-3 flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <h5 className="font-medium text-foreground text-sm mb-1">Slide 3: The Ask</h5>
              <p className="text-xs text-muted-foreground">
                Clear call-to-action for next steps and collaboration opportunities
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary & Next Steps */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              <CheckCircle className="inline text-accent mr-2" />
              Package Generated Successfully!
            </h3>
            <p className="text-muted-foreground mb-6">
              Your complete hackathon package is ready. Deploy the React app, present with the pitch deck, and start building your MVP.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="gradient-bg text-primary-foreground px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                data-testid="button-deploy"
              >
                <Rocket className="mr-2" />
                Deploy to Vercel
              </Button>
              <Button 
                variant="secondary"
                className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
                data-testid="button-github"
              >
                <Github className="mr-2" />
                Push to GitHub
              </Button>
              <Button 
                variant="outline"
                onClick={onNewGeneration}
                className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
                data-testid="button-generate-another"
              >
                <RefreshCw className="mr-2" />
                Generate Another
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
