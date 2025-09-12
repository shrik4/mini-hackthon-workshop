import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Settings, CheckCircle, Loader2 } from "lucide-react";

interface GenerationProgressProps {
  generation: {
    id: string;
    status: string;
    marketResearch?: string | null;
    features?: any | null;
    scaffoldZip?: string | null;
    pitchDeckPdf?: string | null;
  };
}

export function GenerationProgress({ generation }: GenerationProgressProps) {
  const steps = [
    {
      name: "Market Research & Competitor Analysis",
      completed: !!generation.marketResearch,
      active: !generation.marketResearch,
    },
    {
      name: "Feature Prioritization & MVP Planning", 
      completed: !!generation.features,
      active: !!generation.marketResearch && !generation.features,
    },
    {
      name: "React Code Scaffold Generation",
      completed: !!generation.scaffoldZip,
      active: !!generation.features && !generation.scaffoldZip,
    },
    {
      name: "Pitch Deck Creation",
      completed: !!generation.pitchDeckPdf,
      active: !!generation.scaffoldZip && !generation.pitchDeckPdf,
    },
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <Card className="mb-12 bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold text-foreground">Generating Your Package</span>
          <div className="animate-spin">
            <Settings className="text-primary text-xl" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center space-x-3" data-testid={`progress-step-${index}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                step.completed 
                  ? "bg-primary" 
                  : step.active 
                    ? "border-2 border-primary animate-pulse-slow" 
                    : "border-2 border-muted-foreground/30"
              }`}>
                {step.completed ? (
                  <CheckCircle className="text-primary-foreground text-xs" />
                ) : step.active ? (
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                ) : null}
              </div>
              <span className={step.completed || step.active ? "text-foreground" : "text-muted-foreground"}>
                {step.name}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Progress value={progressPercentage} className="mb-2" />
          <p className="text-xs text-muted-foreground">
            Estimated time: 30-45 seconds
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
