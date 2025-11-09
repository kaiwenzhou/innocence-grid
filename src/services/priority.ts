import { Transcript, PriorityRecommendation } from "@/lib/types";

// Commissioner background database (same as Cases page)
const COMMISSIONER_BACKGROUNDS: Record<string, { category: string }> = {
  "MICHAEL RUFF": { category: "Corrections & Law Enforcement" },
  "KEVIN CHAPPELL": { category: "Corrections & Law Enforcement" },
  "GILBERT INFANTE": { category: "Corrections & Law Enforcement" },
  "DAVID LONG": { category: "Corrections & Law Enforcement" },
  "MICHELE MINOR": { category: "Corrections & Law Enforcement" },
  "WILLIAM MUNIZ": { category: "Corrections & Law Enforcement" },
  "NEIL SCHNEIDER": { category: "Corrections & Law Enforcement" },
  "JULIE GARLAND": { category: "Prosecution & State's Attorney" },
  "CATHERINE PURCELL": { category: "Prosecution & State's Attorney" },
  "MARY THORNTON": { category: "Prosecution & State's Attorney" },
  "JACK WEISS": { category: "Prosecution & State's Attorney" },
  "TEAL KOZEL": { category: "Mental Health" },
  "KATHLEEN O'MEARA": { category: "Mental Health" },
  "DIANNE DOBBS": { category: "Legal, Judicial & Mixed Legal" },
  "DAVID NDUDIM": { category: "Legal, Judicial & Mixed Legal" },
  "ROSALIND SARGENT-BURNS": { category: "Legal, Judicial & Mixed Legal" },
  "EXCEL SHARRIEFF": { category: "Legal, Judicial & Mixed Legal" },
  "EMILY SHEFFIELD": { category: "Legal, Judicial & Mixed Legal" },
  "TROY TAIRA": { category: "Legal, Judicial & Mixed Legal" },
  "PATRICIA CASSADY": { category: "Parole Board Administration" },
  "NEAL CHAMBERS": { category: "Unknown Background" },
  "JAMES WEILBACHER": { category: "Unknown Background" },
};

export class PriorityService {
  /**
   * Calculate priority score for a transcript
   * Score breakdown (0-100):
   * - Innocence Claim Strength: 0-30 points (uses AI prediction if available)
   * - Bias Risk: 0-25 points
   * - Case Urgency: 0-25 points
   * - Assignment Status: 0-20 points
   */
  static calculatePriorityScore(transcript: Transcript): PriorityRecommendation {
    // Use AI-powered innocence score if available, otherwise fall back to regex
    const innocenceScore = transcript.prediction?.innocence_score
      ? this.scoreFromAIPrediction(transcript.prediction.innocence_score)
      : this.scoreInnocenceClaim(transcript.raw_text);

    const biasScore = this.scoreBiasRisk(transcript.raw_text);
    const urgencyScore = this.scoreUrgency(transcript.hearing_date);
    const statusScore = this.scoreStatus(transcript.status, transcript.assigned_to);

    const totalScore = innocenceScore + biasScore + urgencyScore + statusScore;
    const reasons = this.generateReasons(
      innocenceScore,
      biasScore,
      urgencyScore,
      statusScore,
      transcript
    );

    return {
      transcript,
      score: Math.round(totalScore),
      rank: 0, // Will be set when ranking all transcripts
      reasons,
      breakdown: {
        innocenceScore,
        biasScore,
        urgencyScore,
        statusScore,
      },
    };
  }

  /**
   * Convert AI prediction score (0-1) to priority points (0-30)
   * Uses the weighted innocence score from Gemini analysis
   */
  private static scoreFromAIPrediction(aiScore: number): number {
    // AI score is 0-1, convert to 0-30 points
    // Higher AI innocence score = higher priority
    return Math.round(aiScore * 30);
  }

  /**
   * Get top N priority recommendations from a list of transcripts
   */
  static getTopRecommendations(
    transcripts: Transcript[],
    count: number = 3
  ): PriorityRecommendation[] {
    const scored = transcripts.map((t) => this.calculatePriorityScore(t));
    
    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    
    // Assign ranks
    scored.forEach((rec, index) => {
      rec.rank = index + 1;
    });
    
    return scored.slice(0, count);
  }

  /**
   * Score innocence claim strength (0-30 points)
   */
  private static scoreInnocenceClaim(text: string): number {
    const strongPatterns = [
      /I did not commit/i,
      /I am innocent/i,
      /wrongly convicted/i,
      /falsely accused/i,
      /maintain.*innocence/i,
    ];

    const mediumPatterns = [
      /maintain.*different/i,
      /circumstances.*different/i,
      /didn't.*do/i,
      /did not.*do/i,
    ];

    const weakPatterns = [
      /innocent/i,
      /wrongly/i,
      /falsely/i,
      /mistake/i,
    ];

    // Check for strong patterns
    const hasStrong = strongPatterns.some((p) => p.test(text));
    if (hasStrong) return 30;

    // Check for medium patterns
    const hasMedium = mediumPatterns.some((p) => p.test(text));
    if (hasMedium) return 20;

    // Check for weak patterns
    const hasWeak = weakPatterns.some((p) => p.test(text));
    if (hasWeak) return 10;

    return 0;
  }

  /**
   * Score bias risk based on panel composition (0-25 points)
   */
  private static scoreBiasRisk(text: string): number {
    const commissioners = this.extractCommissioners(text);
    
    if (commissioners.length === 0) return 0;

    const lawEnforcementCommissioners = [
      "MICHAEL RUFF",
      "KEVIN CHAPPELL",
      "GILBERT INFANTE",
      "DAVID LONG",
      "MICHELE MINOR",
      "WILLIAM MUNIZ",
      "NEIL SCHNEIDER",
    ];

    const prosecutionCommissioners = [
      "JULIE GARLAND",
      "CATHERINE PURCELL",
      "MARY THORNTON",
      "JACK WEISS",
    ];

    const biasedCount = commissioners.filter(
      (c) =>
        lawEnforcementCommissioners.includes(c) ||
        prosecutionCommissioners.includes(c)
    ).length;

    // 100% LE/prosecution panel = high risk
    if (biasedCount === commissioners.length && commissioners.length > 0) {
      return 25;
    }

    // Majority LE/prosecution = medium risk
    if (biasedCount / commissioners.length >= 0.5) {
      return 15;
    }

    // Some LE/prosecution = low risk
    if (biasedCount > 0) {
      return 5;
    }

    return 0;
  }

  /**
   * Score urgency based on hearing date (0-25 points)
   */
  private static scoreUrgency(hearingDate: string | null): number {
    if (!hearingDate) return 5; // Unknown date = low priority

    const hearing = new Date(hearingDate);
    const now = new Date();
    const monthsAgo = (now.getTime() - hearing.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (monthsAgo <= 6) return 25; // Last 6 months = highest urgency
    if (monthsAgo <= 12) return 15; // 6-12 months = medium urgency
    if (monthsAgo <= 24) return 10; // 1-2 years = low urgency
    return 5; // Older = very low urgency
  }

  /**
   * Score based on assignment status (0-20 points)
   */
  private static scoreStatus(
    status: string,
    assignedTo: string | null
  ): number {
    if (status === "completed") return 0; // Already done
    if (status === "unassigned" && !assignedTo) return 20; // Needs attention
    if (status === "assigned" || assignedTo) return 10; // In progress
    if (status === "in_review") return 5; // Being reviewed
    if (status === "flagged") return 15; // Needs re-review

    return 20; // Default: unassigned
  }

  /**
   * Generate human-readable reasons for the score
   */
  private static generateReasons(
    innocenceScore: number,
    biasScore: number,
    urgencyScore: number,
    statusScore: number,
    transcript: Transcript
  ): string[] {
    const reasons: string[] = [];

    // Innocence claim reasons (check if AI prediction was used)
    const usedAI = transcript.prediction?.innocence_score != null;

    if (innocenceScore >= 25) {
      reasons.push(
        usedAI
          ? "High innocence score from AI analysis"
          : "Strong explicit innocence claim detected"
      );
    } else if (innocenceScore >= 15) {
      reasons.push(
        usedAI
          ? "Moderate innocence score from AI analysis"
          : "Innocence-related language found"
      );
    } else if (innocenceScore >= 10) {
      reasons.push(
        usedAI
          ? "AI detected potential innocence signals"
          : "Potential innocence indicators present"
      );
    }

    // Bias risk reasons
    if (biasScore >= 20) {
      reasons.push("100% law enforcement/prosecution panel (high bias risk)");
    } else if (biasScore >= 10) {
      reasons.push("Majority LE/prosecution panel");
    }

    // Urgency reasons
    if (urgencyScore >= 20) {
      reasons.push("Recent hearing (within 6 months)");
    } else if (urgencyScore >= 15) {
      reasons.push("Hearing within past year");
    }

    // Status reasons
    if (statusScore >= 15) {
      if (transcript.status === "flagged") {
        reasons.push("Case flagged for review");
      } else {
        reasons.push("Unassigned - needs volunteer");
      }
    }

    // If no specific reasons, provide a general one
    if (reasons.length === 0) {
      reasons.push("Case ready for review");
    }

    return reasons;
  }

  /**
   * Extract commissioner names from transcript text
   */
  private static extractCommissioners(text: string): string[] {
    const names = new Set<string>();
    const panelSectionMatch = text.match(
      /PANEL PRESENT:?\s*([\s\S]*?)(?:OTHERS PRESENT|$)/i
    );

    if (panelSectionMatch) {
      const panelSection = panelSectionMatch[1];
      const sectionMatches = panelSection.matchAll(
        /([A-Z]+(?:\s+[A-Z]+)+),?\s+(?:Presiding|Deputy)\s+Commissioner/gi
      );

      for (const match of sectionMatches) {
        const name = match[1].trim().toUpperCase();
        const wordCount = name.split(/\s+/).length;
        if (wordCount >= 2 && wordCount <= 4) {
          names.add(name);
        }
      }
    }

    return Array.from(names);
  }
}

