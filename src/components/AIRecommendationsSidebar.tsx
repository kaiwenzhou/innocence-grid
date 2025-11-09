import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriorityRecommendation } from "@/lib/types";
import { Bot, TrendingUp, Info } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AIRecommendationsSidebarProps {
  recommendations: PriorityRecommendation[];
  onViewCase: (transcriptId: string) => void;
  onAnalyze: (transcriptId: string) => void;
  onAssign: (transcriptId: string) => void;
  isLoading?: boolean;
}

export function AIRecommendationsSidebar({
  recommendations,
  onViewCase,
  onAnalyze,
  onAssign,
  isLoading = false,
}: AIRecommendationsSidebarProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const getRankEmoji = (rank: number): string => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getScoreBadgeColor = (score: number): string => {
    if (score >= 80) return "bg-rose-50 text-rose-700 border-rose-200";
    if (score >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  if (isLoading) {
    return (
      <Card className="p-4 border-2 border-primary/20">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-foreground">AI Priority Picks</h3>
            <p className="text-xs text-muted-foreground mt-1">Analyzing...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="p-4 border-2 border-primary/20">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-foreground">AI Priority Picks</h3>
            <p className="text-xs text-muted-foreground mt-1">No cases available</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold text-slate-900">AI Priority Picks</h3>
          </div>
          
          <Dialog open={showExplanation} onOpenChange={setShowExplanation}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Info className="h-4 w-4 text-slate-700" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>AI Scoring Methodology</DialogTitle>
                <DialogDescription>
                  How we calculate priority scores
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4 text-sm">
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="font-semibold text-purple-900 mb-1">Innocence (0-30 pts)</p>
                  <p className="text-xs text-purple-800">Strong claims get higher scores</p>
                </div>
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <p className="font-semibold text-rose-900 mb-1">Bias Risk (0-25 pts)</p>
                  <p className="text-xs text-rose-800">100% LE/prosecution panels = high risk</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="font-semibold text-amber-900 mb-1">Urgency (0-25 pts)</p>
                  <p className="text-xs text-amber-800">Recent hearings prioritized</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="font-semibold text-slate-900 mb-1">Status (0-20 pts)</p>
                  <p className="text-xs text-slate-800">Unassigned cases get priority</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <p className="text-xs text-slate-700 font-medium">
          AI suggestions - review carefully
        </p>

        {/* Compact Recommendations */}
        <div className="space-y-3">
          {recommendations.map((rec) => {
            const displayName =
              rec.transcript.inmate_name ||
              rec.transcript.cdcr_number ||
              rec.transcript.file_name.replace(".pdf", "");

            return (
              <div
                key={rec.transcript.id}
                className="p-3 bg-white/95 rounded-lg border shadow-sm space-y-2"
              >
                {/* Rank & Name */}
                <div className="flex items-start gap-2">
                  <span className="text-lg">{getRankEmoji(rec.rank)}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground truncate">
                      {displayName}
                    </h4>
                    {rec.transcript.cdcr_number && (
                      <p className="text-xs text-slate-700 font-medium">
                        CDCR #{rec.transcript.cdcr_number}
                      </p>
                    )}
                  </div>
                </div>

                {/* Score Badge */}
                <Badge
                  variant="outline"
                  className={`text-xs ${getScoreBadgeColor(rec.score)}`}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Score: {rec.score}/100
                </Badge>

                {/* Top Reason */}
                <p className="text-xs text-slate-800 font-semibold leading-snug">
                  {rec.reasons[0]}
                </p>

                {/* Compact Score Breakdown */}
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span className="text-slate-800 font-medium">Inn: {rec.breakdown.innocenceScore}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className="text-slate-800 font-medium">Bias: {rec.breakdown.biasScore}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-slate-800 font-medium">Urg: {rec.breakdown.urgencyScore}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                    <span className="text-slate-800 font-medium">Stat: {rec.breakdown.statusScore}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 text-xs"
                    onClick={() => onAnalyze(rec.transcript.id)}
                  >
                    Analyze
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 h-7 text-xs bg-primary hover:bg-primary/90"
                    onClick={() => onAssign(rec.transcript.id)}
                  >
                    Assign
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

