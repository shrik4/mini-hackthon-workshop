import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";
import type { HackathonScore } from "@shared/schema";

interface HackathonScoreProps {
  score: HackathonScore;
}

export default function HackathonScore({ score }: HackathonScoreProps) {
  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 8) return "text-green-600";
    if (scoreValue >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (scoreValue: number) => {
    if (scoreValue >= 8) return "bg-green-100 text-green-800";
    if (scoreValue >= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6" data-testid="hackathon-score">
      {/* Overall Score Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="h-6 w-6 text-purple-600" />
            <CardTitle className="text-2xl">HackPal Score</CardTitle>
          </div>
          <div className="text-4xl font-bold mb-2" data-testid="overall-score">
            <span className={getScoreColor(score.overallScore)}>
              {score.overallScore}/10
            </span>
          </div>
          <p className="text-gray-600 text-lg" data-testid="judge-summary">
            {score.summary}
          </p>
        </CardHeader>
      </Card>

      {/* Individual Scores */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Originality */}
        <Card data-testid="originality-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-blue-600" />
              Originality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold" data-testid="originality-score">
                  {score.originality.score}/10
                </span>
                <Badge className={getScoreBadgeColor(score.originality.score)}>
                  {score.originality.score >= 8 ? 'Excellent' : 
                   score.originality.score >= 6 ? 'Good' : 'Needs Work'}
                </Badge>
              </div>
              <Progress value={score.originality.score * 10} className="h-2" />
              <p className="text-sm text-gray-600" data-testid="originality-feedback">
                {score.originality.feedback}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feasibility */}
        <Card data-testid="feasibility-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Feasibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold" data-testid="feasibility-score">
                  {score.feasibility.score}/10
                </span>
                <Badge className={getScoreBadgeColor(score.feasibility.score)}>
                  {score.feasibility.score >= 8 ? 'Excellent' : 
                   score.feasibility.score >= 6 ? 'Good' : 'Needs Work'}
                </Badge>
              </div>
              <Progress value={score.feasibility.score * 10} className="h-2" />
              <p className="text-sm text-gray-600" data-testid="feasibility-feedback">
                {score.feasibility.feedback}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Market Fit */}
        <Card data-testid="market-fit-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Market Fit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold" data-testid="market-fit-score">
                  {score.marketFit.score}/10
                </span>
                <Badge className={getScoreBadgeColor(score.marketFit.score)}>
                  {score.marketFit.score >= 8 ? 'Excellent' : 
                   score.marketFit.score >= 6 ? 'Good' : 'Needs Work'}
                </Badge>
              </div>
              <Progress value={score.marketFit.score * 10} className="h-2" />
              <p className="text-sm text-gray-600" data-testid="market-fit-feedback">
                {score.marketFit.feedback}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths and Improvements */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-green-700">
              <CheckCircle className="h-5 w-5" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2" data-testid="strengths-list">
              {score.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2" data-testid="improvements-list">
              {score.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}