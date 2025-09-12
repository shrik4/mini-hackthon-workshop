import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Rocket, Key, Lightbulb, Shield } from "lucide-react";
import { GenerationProgress } from "@/components/generation-progress";
import { ResultsDisplay } from "@/components/results-display";
import { Typewriter } from "@/components/typewriter";

export default function Home() {
  const [problemStatement, setProblemStatement] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [generationId, setGenerationId] = useState<string | null>(null);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async ({ problemStatement, apiKey }: { problemStatement: string; apiKey: string }) => {
      const response = await apiRequest("POST", "/api/generate", { problemStatement, apiKey });
      return response.json();
    },
    onSuccess: (data) => {
      setGenerationId(data.generationId);
      toast({
        title: "Generation Started",
        description: "Your hackathon package is being generated...",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to start generation",
        variant: "destructive",
      });
    },
  });

  const { data: generation } = useQuery({
    queryKey: ["/api/generation", generationId],
    enabled: !!generationId,
    refetchInterval: generationId && generation?.status !== "completed" && generation?.status !== "failed" ? 2000 : false,
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemStatement.trim() || !apiKey.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both the problem statement and API key.",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate({ problemStatement: problemStatement.trim(), apiKey: apiKey.trim() });
  };

  const handleNewGeneration = () => {
    setGenerationId(null);
    setProblemStatement("");
    setApiKey("");
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
                <Rocket className="text-primary-foreground text-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  HackPal
                </h1>
                <p className="text-xs text-muted-foreground">AI-Powered Hackathon Assistant</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Ship Your Hackathon Idea{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                <Typewriter text="Faster" />
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform your problem statement into market research, prioritized features, React scaffold, and a pitch deck—all in seconds.
            </p>
          </div>

          {!generationId && (
            <Card className="bg-card border-border shadow-2xl">
              <CardContent className="p-8">
                <form onSubmit={handleGenerate} className="space-y-6">
                  <div className="text-left">
                    <Label htmlFor="problemStatement" className="block text-sm font-medium text-foreground mb-3">
                      <Lightbulb className="inline w-4 h-4 text-primary mr-2" />
                      Problem Statement
                    </Label>
                    <div className="gradient-border rounded-lg">
                      <Textarea
                        id="problemStatement"
                        data-testid="input-problem-statement"
                        rows={4}
                        className="w-full p-4 bg-background rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder-muted-foreground resize-none"
                        placeholder="Describe your hackathon idea in a few sentences. E.g., 'Smart Water Bottle that tracks hydration and reminds users to drink water throughout the day.'"
                        value={problemStatement}
                        onChange={(e) => setProblemStatement(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-accent mr-1"></span>
                      Be specific about the problem you're solving and your target users.
                    </p>
                  </div>

                  <div className="text-left">
                    <Label htmlFor="geminiapikey" className="block text-sm font-medium text-foreground mb-3">
                      <Key className="inline w-4 h-4 text-accent mr-2" />
                      Gemini API Key
                    </Label>
                    <div className="gradient-border rounded-lg">
                      <Input
                        type="password"
                        id="geminiapikey"
                        data-testid="input-api-key"
                        className="w-full p-4 bg-background rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder-muted-foreground font-mono text-sm"
                        placeholder="AIzaSy..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <Shield className="inline w-3 h-3 mr-1" />
                      Your API key is processed securely and never stored.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    data-testid="button-generate"
                    className="w-full gradient-bg text-primary-foreground font-semibold py-4 px-8 rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    disabled={generateMutation.isPending}
                  >
                    <Rocket className="mr-2" />
                    {generateMutation.isPending ? "Starting Generation..." : "Generate Complete Package"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Generation Progress */}
        {generationId && generation && generation.status !== "completed" && generation.status !== "failed" && (
          <GenerationProgress generation={generation} />
        )}

        {/* Results Display */}
        {generationId && generation && generation.status === "completed" && (
          <ResultsDisplay generation={generation} onNewGeneration={handleNewGeneration} />
        )}

        {/* Error State */}
        {generationId && generation && generation.status === "failed" && (
          <Card className="bg-destructive/10 border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Generation Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Something went wrong while generating your package. Please try again.
              </p>
              <Button onClick={handleNewGeneration} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-foreground mb-3">About HackPal</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered assistant that transforms ideas into complete hackathon packages. Built for developers, by developers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="w-2 h-2 bg-accent rounded-full inline-block mr-2"></span>Market Research</li>
                <li><span className="w-2 h-2 bg-accent rounded-full inline-block mr-2"></span>Feature Prioritization</li>
                <li><span className="w-2 h-2 bg-accent rounded-full inline-block mr-2"></span>Code Generation</li>
                <li><span className="w-2 h-2 bg-accent rounded-full inline-block mr-2"></span>Pitch Deck Creation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">GitHub Repository</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Made with ❤️ for the hackathon community • <span className="text-accent">HackPal v1.0</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
