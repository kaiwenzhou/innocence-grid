import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Users, Scale, TrendingUp, AlertCircle } from "lucide-react";

interface PatternInsightsProps {
  commissionerInsights: string[];
  innocenceInsights: string[];
  outcomeInsights: string[];
  totalSimilar: number;
  onViewSimilar?: () => void;
}

export function PatternInsights({
  commissionerInsights,
  innocenceInsights,
  outcomeInsights,
  totalSimilar,
  onViewSimilar,
}: PatternInsightsProps) {
  if (
    commissionerInsights.length === 0 &&
    innocenceInsights.length === 0 &&
    outcomeInsights.length === 0
  ) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Pattern Data Available
          </h3>
          <p className="text-sm text-foreground/60">
            Select a case from your assigned cases to see similar case patterns.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-2 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Pattern Insights Across Database
              </h3>
              <p className="text-sm text-foreground/60">
                Found {totalSimilar} similar cases in the database
              </p>
            </div>
          </div>
          {onViewSimilar && (
            <Button variant="outline" onClick={onViewSimilar}>
              View All Similar
            </Button>
          )}
        </div>
      </Card>

      {/* Commissioner Panel Insights */}
      {commissionerInsights.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-rose-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-rose-600" />
              </div>
              <h4 className="font-bold text-foreground">
                Commissioner Panel Patterns
              </h4>
            </div>

            <div className="space-y-3">
              {commissionerInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-rose-50 rounded-lg border border-rose-100"
                >
                  <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium text-rose-900">{insight}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border">
              <p className="text-sm font-semibold text-foreground mb-2">
                💡 What This Means:
              </p>
              <p className="text-sm font-medium text-slate-700">
                Cases with similar commissioner backgrounds often face similar challenges.
                Understanding the panel's typical language and decision patterns can help
                inform narrative strategy.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Innocence Claim Insights */}
      {innocenceInsights.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                <Scale className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="font-bold text-foreground">
                Similar Innocence Claims
              </h4>
            </div>

            <div className="space-y-3">
              {innocenceInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100"
                >
                  <Scale className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium text-purple-900">{insight}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border">
              <p className="text-sm font-semibold text-foreground mb-2">
                💡 What Worked in Similar Cases:
              </p>
              <ul className="text-sm font-medium text-slate-700 space-y-2 list-disc list-inside">
                <li>
                  Narratives that separated empathy for victims from factual innocence
                  claims
                </li>
                <li>
                  Clear documentation of evidence gaps or misconduct
                </li>
                <li>
                  Emphasis on personal growth and rehabilitation alongside innocence
                  maintenance
                </li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Outcome Insights */}
      {outcomeInsights.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <h4 className="font-bold text-foreground">Outcome Patterns</h4>
            </div>

            <div className="space-y-3">
              {outcomeInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100"
                >
                  <TrendingUp className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium text-amber-900">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* National Context Placeholder */}
      <Card className="p-6 border-2 border-dashed border-slate-300 bg-slate-50">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
              <Scale className="h-5 w-5 text-slate-600" />
            </div>
            <h4 className="font-bold text-foreground">
              National Context (Coming Soon)
            </h4>
          </div>

          <p className="text-sm font-medium text-slate-700">
            Future integration with:
          </p>
          <ul className="text-sm font-medium text-slate-700 space-y-1 list-disc list-inside ml-4">
            <li>National Registry of Exonerations</li>
            <li>Similar case databases from other states</li>
            <li>Innocence Project network data</li>
          </ul>

          <Badge variant="outline" className="bg-slate-200 text-slate-800 border-slate-300">
            Currently showing local database only
          </Badge>
        </div>
      </Card>
    </div>
  );
}

