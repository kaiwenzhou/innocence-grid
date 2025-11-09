import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriorityRecommendation } from "@/lib/types";
import { Bot, AlertCircle, TrendingUp, Info } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AIRecommendationsProps {
  recommendations: PriorityRecommendation[];
  onViewCase: (transcriptId: string) => void;
  onAnalyze: (transcriptId: string) => void;
  onAssign: (transcriptId: string) => void;
  isLoading?: boolean;
}

export function AIRecommendations({
  recommendations,
  onViewCase,
  onAnalyze,
  onAssign,
  isLoading = false,
}: AIRecommendationsProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const getRankEmoji = (rank: number): string => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-rose-600";
    if (score >= 60) return "text-amber-600";
    return "text-slate-600";
  };

  const getScoreBadgeColor = (score: number): string => {
    if (score >= 80) return "bg-rose-50 text-rose-700 border-rose-200";
    if (score >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  if (isLoading) {
    return (
      <Card className="p-6 mb-6 border-2 border-primary/20">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-primary animate-pulse" />
          <div>
            <h3 className="text-lg font-bold text-foreground">
              AI-Powered Priority Recommendations
            </h3>
            <p className="text-sm text-slate-600 font-medium mt-1">
              Analyzing transcripts...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="p-6 mb-6 border-2 border-primary/20">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-primary" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">
              AI-Powered Priority Recommendations
            </h3>
            <p className="text-sm text-slate-600 font-medium mt-1">
              No cases available for recommendation at this time.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                AI-Powered Priority Recommendations
              </h3>
              <p className="text-sm text-slate-600 font-medium mt-1 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                These are suggestions only. Review each case carefully.
              </p>
            </div>
          </div>
          
          <Dialog open={showExplanation} onOpenChange={setShowExplanation}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Info className="h-4 w-4 mr-2" />
                How it works
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>AI Scoring Methodology</DialogTitle>
                <DialogDescription>
                  Understanding how we calculate priority scores
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Priority Score (0-100 points)
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="font-semibold text-purple-900 mb-1">
                        Innocence Claim Strength (0-30 points)
                      </p>
                      <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
                        <li>Strong explicit claim: 30 points</li>
                        <li>Implicit innocence language: 20 points</li>
                        <li>Weak/ambiguous indicators: 10 points</li>
                        <li>No claim detected: 0 points</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                      <p className="font-semibold text-rose-900 mb-1">
                        Bias Risk (0-25 points)
                      </p>
                      <ul className="text-sm text-rose-800 space-y-1 list-disc list-inside">
                        <li>100% LE/prosecution panel: 25 points</li>
                        <li>Majority LE/prosecution: 15 points</li>
                        <li>Some LE/prosecution: 5 points</li>
                        <li>Balanced panel: 0 points</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="font-semibold text-amber-900 mb-1">
                        Case Urgency (0-25 points)
                      </p>
                      <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                        <li>Hearing in last 6 months: 25 points</li>
                        <li>Hearing 6-12 months ago: 15 points</li>
                        <li>Hearing 1-2 years ago: 10 points</li>
                        <li>Older hearings: 5 points</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="font-semibold text-slate-900 mb-1">
                        Assignment Status (0-20 points)
                      </p>
                      <ul className="text-sm text-slate-800 space-y-1 list-disc list-inside">
                        <li>Unassigned: 20 points</li>
                        <li>Flagged for review: 15 points</li>
                        <li>Assigned but no progress: 10 points</li>
                        <li>In progress: 5 points</li>
                        <li>Completed: 0 points</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-slate-700">
                    <strong>Important:</strong> These scores are suggestions based on objective
                    criteria. Human judgment is essential. Always review the full transcript
                    and context before making decisions.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          {recommendations.map((rec) => {
            const displayName =
              rec.transcript.inmate_name ||
              rec.transcript.cdcr_number ||
              rec.transcript.file_name.replace(".pdf", "");

            return (
              <div
                key={rec.transcript.id}
                className="p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Rank Badge */}
                  <div className="text-2xl">{getRankEmoji(rec.rank)}</div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-foreground flex items-center gap-2">
                          {displayName}
                          {rec.transcript.cdcr_number && (
                            <span className="text-sm font-normal text-slate-600">
                              CDCR #{rec.transcript.cdcr_number}
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={getScoreBadgeColor(rec.score)}
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Priority Score: {rec.score}/100
                          </Badge>
                          {rec.transcript.hearing_date && (
                            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                              {new Date(rec.transcript.hearing_date).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reasons */}
                    <div className="text-sm">
                      <p className="font-semibold mb-1 text-foreground">Why this case:</p>
                      <ul className="space-y-1">
                        {rec.reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span className="text-slate-700 font-medium">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Score Breakdown */}
                    <div className="flex gap-2 text-xs">
                      <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                        Innocence: {rec.breakdown.innocenceScore}/30
                      </Badge>
                      <Badge variant="outline" className="bg-rose-50 text-rose-800 border-rose-200">
                        Bias: {rec.breakdown.biasScore}/25
                      </Badge>
                      <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                        Urgency: {rec.breakdown.urgencyScore}/25
                      </Badge>
                      <Badge variant="outline" className="bg-slate-50 text-slate-800 border-slate-200">
                        Status: {rec.breakdown.statusScore}/20
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewCase(rec.transcript.id)}
                      >
                        View Case
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAnalyze(rec.transcript.id)}
                      >
                        Analyze
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => onAssign(rec.transcript.id)}
                      >
                        Assign to Me
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

