import { Transcript } from "@/lib/types";

/**
 * Memo Generator Service
 * Generates formatted CONFIDENTIAL INTEROFFICE MEMORANDUM documents
 */

export interface MemoData {
  clientName: string;
  cdcrNumber: string;
  contactInfo: string;
  dateOfBirth: string;
  
  // Introduction
  convictionSummary: string;
  evidenceUsed: string[];
  theoryOfCase: string;
  
  // Conviction Details
  dateOfCrime: string;
  locationOfCrime: string;
  dateOfArrest: string;
  dateOfConviction: string;
  convictedOf: string;
  countyOfConviction: string;
  sentence: string;
  paroleEligibilityDate: string;
  priorParoleHearing: string;
  clientPriors: string;
  
  // Court Information
  trialCourtCaseNo: string;
  trialCourt: string;
  trialJudge: string;
  trialAttorney: string;
  prosecutingAttorney: string;
  coDefendant: string;
  coDefendantAttorney: string;
  
  // Appellate Information
  appellateCase: string;
  appellateAttorneys: string;
  
  // Post-Conviction
  directAppeal: string;
  habeasPetitions: string;
  
  // Trial Details
  prosecutionPresented: string;
  defensePresented: string;
  
  // Wrongful Conviction Issues
  wrongfulConvictionIssues: string[];
  
  // Raw transcript for reference
  rawText: string;
}

export class MemoGenerator {
  /**
   * Generate memo data from transcript
   */
  static generateMemoData(transcript: Transcript): MemoData {
    const text = transcript.raw_text;
    
    return {
      clientName: this.extractClientName(transcript),
      cdcrNumber: transcript.cdcr_number || "Unknown",
      contactInfo: this.generateContactInfo(transcript),
      dateOfBirth: this.extractDateOfBirth(text),
      
      convictionSummary: this.generateConvictionSummary(text, transcript),
      evidenceUsed: this.extractEvidence(text),
      theoryOfCase: this.generateTheoryOfCase(text),
      
      dateOfCrime: this.extractDateOfCrime(text),
      locationOfCrime: this.extractLocationOfCrime(text),
      dateOfArrest: this.extractDateOfArrest(text),
      dateOfConviction: this.extractDateOfConviction(text),
      convictedOf: this.extractConvictedOf(text),
      countyOfConviction: this.extractCounty(text),
      sentence: this.extractSentence(text),
      paroleEligibilityDate: this.extractParoleEligibility(text),
      priorParoleHearing: this.extractPriorHearings(text),
      clientPriors: this.extractPriors(text),
      
      trialCourtCaseNo: this.extractTrialCaseNumber(text),
      trialCourt: this.extractTrialCourt(text),
      trialJudge: this.extractTrialJudge(text),
      trialAttorney: this.extractTrialAttorney(text),
      prosecutingAttorney: this.extractProsecutor(text),
      coDefendant: this.extractCoDefendant(text),
      coDefendantAttorney: "",
      
      appellateCase: this.extractAppellateCase(text),
      appellateAttorneys: "",
      
      directAppeal: this.extractDirectAppeal(text),
      habeasPetitions: "",
      
      prosecutionPresented: this.extractProsecutionEvidence(text),
      defensePresented: this.extractDefenseEvidence(text),
      
      wrongfulConvictionIssues: this.identifyWrongfulConvictionIssues(text),
      
      rawText: text,
    };
  }

  /**
   * Format memo as downloadable document
   */
  static formatMemoDocument(data: MemoData): string {
    const lines = [
      "CONFIDENTIAL INTEROFFICE MEMORANDUM – WORK PRODUCT",
      "(Parole Transcript: Claiming Innocence)",
      "",
      "(Special Instructions: Please bold the incarcerated person's name, italicize any other",
      "major parties, and underline the name of the victim.)",
      "",
      `Client's Name & CDCR No.: ${data.clientName} (${data.cdcrNumber})`,
      `Contact Information: ${data.contactInfo}`,
      `Date of Birth: ${data.dateOfBirth}`,
      "",
      "═".repeat(80),
      "",
      "INTRODUCTION",
      "",
      "Short Summary",
      data.convictionSummary,
      "",
      "Evidence Used to Convict",
      ...data.evidenceUsed.map((ev, idx) => `${idx + 1}. ${ev}`),
      "",
      "Potential Theory of the Case",
      data.theoryOfCase,
      "",
      "═".repeat(80),
      "",
      "CONVICTION AND DIRECT APPEAL INFORMATION",
      "",
      "Conviction & Sentence Summary",
      `Date of Crime: ${data.dateOfCrime}`,
      `Location of Crime: ${data.locationOfCrime}`,
      `Date of Arrest: ${data.dateOfArrest}`,
      `Date of Conviction: ${data.dateOfConviction}`,
      `Convicted of: ${data.convictedOf}`,
      `County of Conviction: ${data.countyOfConviction}`,
      `Sentence: ${data.sentence}`,
      `Parole Eligibility Date: ${data.paroleEligibilityDate}`,
      `Prior Parole Hearing/Result: ${data.priorParoleHearing}`,
      `Client's Priors/Year of Priors: ${data.clientPriors}`,
      "",
      "Superior Court Case Information",
      "(Gather what you can from transcripts)",
      `Trial Court Case No.: ${data.trialCourtCaseNo}`,
      `Trial Court/Judge/Dpt.: ${data.trialCourt} / ${data.trialJudge}`,
      `Trial Attorney and Bar No: ${data.trialAttorney}`,
      `Prosecuting Attorney: ${data.prosecutingAttorney}`,
      `Co-Defendant: ${data.coDefendant}`,
      `Co-Defendant's Attorney: ${data.coDefendantAttorney}`,
      "",
      "California Appellate Court Case Information",
      "https://appellate.courts.ca.gov",
      `Appellate Case No.: ${data.appellateCase}`,
      `Appellate Attorneys: ${data.appellateAttorneys}`,
      "",
      "═".repeat(80),
      "",
      "POST-CONVICTION ISSUES RAISED",
      "",
      "A. State Direct Appeal (if any)",
      data.directAppeal || "No information available in transcript",
      "",
      "B. Habeas Petitions (if any)",
      data.habeasPetitions || "No information available in transcript",
      "",
      "═".repeat(80),
      "",
      "PROSECUTION Presented (if mentioned)",
      data.prosecutionPresented,
      "",
      "DEFENSE Presented (if mentioned)",
      data.defensePresented,
      "",
      "═".repeat(80),
      "",
      "WRONGFUL CONVICTION ISSUES",
      "*Identify which of the following issues are/might be present in your case by checking the box",
      "next to the issue:",
      "",
      ...this.formatWrongfulConvictionChecklist(data.wrongfulConvictionIssues),
      "",
      "═".repeat(80),
      "",
      "RECOMMENDED NEXT STEPS",
      "□ Review trial transcripts in detail",
      "□ Investigate new evidence",
      "□ Interview witnesses",
      "□ Consult with experts on identified issues",
      "□ Prepare habeas corpus petition",
      "□ Contact appellate court for records",
      "",
      "═".repeat(80),
      "",
      `Generated: ${new Date().toLocaleString()}`,
      "Source: JusticeMAP Parole Hearing Transcript Analysis",
      "This is a work product prepared for legal review and should be treated as confidential.",
    ];
    
    return lines.join("\n");
  }

  // Helper methods for extraction

  private static extractClientName(transcript: Transcript): string {
    return transcript.inmate_name || "Unknown";
  }

  private static generateContactInfo(transcript: Transcript): string {
    return "Look up on CDCR Incarcerated Person Locator (https://inmatelocator.cdcr.ca.gov/)";
  }

  private static extractDateOfBirth(text: string): string {
    const dobPattern = /(?:date of birth|DOB|born)[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i;
    const match = text.match(dobPattern);
    return match ? match[1] : "Not specified in transcript";
  }

  private static generateConvictionSummary(text: string, transcript: Transcript): string {
    const innocencePattern = /(?:maintain|I didn'?t|innocent|wrongly|falsely)[^.]{0,200}\./gi;
    const matches = text.match(innocencePattern);
    
    const summary = matches && matches.length > 0
      ? `${transcript.inmate_name || "The client"} maintains innocence regarding their conviction. ${matches[0]}`
      : `${transcript.inmate_name || "The client"} was convicted and maintains they were wrongfully convicted. Review transcript for detailed innocence claims.`;
    
    return summary;
  }

  private static extractEvidence(text: string): string[] {
    const evidence: string[] = [];
    
    // Look for testimony patterns
    if (text.match(/testimony|testified|witness/i)) {
      evidence.push("Witness testimony (see transcript for details)");
    }
    
    // Look for physical evidence
    if (text.match(/DNA|fingerprint|forensic|evidence/i)) {
      evidence.push("Physical evidence presented (see transcript for details)");
    }
    
    // Look for confession
    if (text.match(/confess|admission|statement to police/i)) {
      evidence.push("Statement or confession (see transcript for details)");
    }
    
    if (evidence.length === 0) {
      evidence.push("Evidence details not clearly identified in transcript - requires further review");
    }
    
    return evidence;
  }

  private static generateTheoryOfCase(text: string): string {
    if (text.match(/misidentif|wrong person|wasn'?t me/i)) {
      return "Potential mistaken identification or wrong person defense";
    }
    if (text.match(/alibi|somewhere else|different location/i)) {
      return "Potential alibi defense - client claims to have been elsewhere";
    }
    if (text.match(/someone else|another person|codefendant/i)) {
      return "Potential actual perpetrator defense - someone else committed the crime";
    }
    if (text.match(/false|lie|lying|fabricat/i)) {
      return "Potential false testimony or witness credibility issues";
    }
    return "Theory requires further investigation based on transcript review";
  }

  private static extractDateOfCrime(text: string): string {
    // Multiple patterns for date extraction
    const patterns = [
      /crime.*?(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /offense.*?(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /incident.*?(\w+ \d{1,2}, \d{4})/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    
    return "Not specified in transcript";
  }

  private static extractLocationOfCrime(text: string): string {
    const pattern = /(?:crime|incident|offense).*?(?:in|at|near)\s+([A-Z][a-z]+(?:,\s*[A-Z][a-z]+)?)\s*,?\s*(?:California|CA)/i;
    const match = text.match(pattern);
    return match ? match[1] + ", California" : "Not specified in transcript";
  }

  private static extractDateOfArrest(text: string): string {
    const pattern = /arrest.*?(\d{1,2}\/\d{1,2}\/\d{4}|\w+ \d{1,2}, \d{4})/i;
    const match = text.match(pattern);
    return match ? match[1] : "Not specified in transcript";
  }

  private static extractDateOfConviction(text: string): string {
    const pattern = /(?:convicted|conviction).*?(\d{1,2}\/\d{1,2}\/\d{4}|\w+ \d{1,2}, \d{4})/i;
    const match = text.match(pattern);
    return match ? match[1] : "Not specified in transcript";
  }

  private static extractConvictedOf(text: string): string {
    const patterns = [
      /convicted of\s+([^.]+)/i,
      /commitment offense[:\s]+([^.]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let crime = match[1].trim();
        if (crime.length > 150) crime = crime.substring(0, 150) + "...";
        return crime;
      }
    }
    
    return "See transcript for conviction details";
  }

  private static extractCounty(text: string): string {
    const pattern = /(?:County of|in)\s+([A-Z][a-z]+)\s+County/i;
    const match = text.match(pattern);
    return match ? match[1] + " County" : "Not specified in transcript";
  }

  private static extractSentence(text: string): string {
    const patterns = [
      /sentenced? to\s+(\d+\s+years?(?:\s+to\s+life)?)/i,
      /sentence[:\s]+(\d+\s+years?(?:\s+to\s+life)?)/i,
      /(life\s+(?:without|with)\s+(?:the\s+)?possibility\s+of\s+parole)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    
    return "Not specified in transcript";
  }

  private static extractParoleEligibility(text: string): string {
    const pattern = /(?:parole eligibility|eligible for parole).*?(\d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i;
    const match = text.match(pattern);
    return match ? match[1] : "Not specified in transcript";
  }

  private static extractPriorHearings(text: string): string {
    if (text.match(/prior hearing|previous hearing|last hearing/i)) {
      return "Prior hearings mentioned - see transcript for details";
    }
    return "Not mentioned in transcript";
  }

  private static extractPriors(text: string): string {
    if (text.match(/prior conviction|previous conviction|criminal history/i)) {
      return "Prior convictions mentioned - see transcript for details";
    }
    return "None mentioned in transcript";
  }

  private static extractTrialCaseNumber(text: string): string {
    const pattern = /(?:case|docket).*?(?:number|no\.?)[:\s]*([A-Z0-9-]+)/i;
    const match = text.match(pattern);
    return match ? match[1] : "Not specified in transcript";
  }

  private static extractTrialCourt(text: string): string {
    const pattern = /(?:superior court|trial court).*?([A-Z][a-z]+\s+County)/i;
    const match = text.match(pattern);
    return match ? match[1] + " Superior Court" : "Not specified in transcript";
  }

  private static extractTrialJudge(text: string): string {
    const pattern = /(?:judge|court)[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i;
    const match = text.match(pattern);
    return match ? match[1] : "Not specified in transcript";
  }

  private static extractTrialAttorney(text: string): string {
    const pattern = /(?:defense attorney|defense counsel|represented by)[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i;
    const match = text.match(pattern);
    return match ? match[1] : "Not specified in transcript";
  }

  private static extractProsecutor(text: string): string {
    const pattern = /(?:prosecutor|district attorney|DA)[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i;
    const match = text.match(pattern);
    return match ? match[1] : "Not specified in transcript";
  }

  private static extractCoDefendant(text: string): string {
    const pattern = /(?:co-defendant|codefendant)[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i;
    const match = text.match(pattern);
    return match ? match[1] : "None mentioned in transcript";
  }

  private static extractAppellateCase(text: string): string {
    return "Not specified in transcript - check https://appellate.courts.ca.gov";
  }

  private static extractDirectAppeal(text: string): string {
    if (text.match(/appeal|appellate/i)) {
      return "Appeal mentioned in transcript - requires further research";
    }
    return "Not mentioned in transcript";
  }

  private static extractProsecutionEvidence(text: string): string {
    const evidence: string[] = [];
    
    if (text.match(/prosecution|state|people/i)) {
      evidence.push("See transcript for prosecution's case presentation");
    }
    
    return evidence.length > 0 ? evidence.join("; ") : "Not detailed in transcript";
  }

  private static extractDefenseEvidence(text: string): string {
    const evidence: string[] = [];
    
    if (text.match(/defense|testified/i)) {
      evidence.push("See transcript for defense presentation");
    }
    
    return evidence.length > 0 ? evidence.join("; ") : "Not detailed in transcript";
  }

  private static identifyWrongfulConvictionIssues(text: string): string[] {
    const issues: string[] = [];
    
    const issuePatterns: Record<string, RegExp> = {
      "Eyewitness identifications": /eyewitness|identif|lineup/i,
      "Confessions": /confess|admission|statement to police/i,
      "DNA": /DNA|genetic/i,
      "Fingerprint analysis": /fingerprint|print analysis/i,
      "Testimony of Children": /child.*testif|juvenile.*witness/i,
      "Gang evidence": /gang|gang.*affiliation/i,
      "Blood Spatter": /blood.*spatter|blood.*pattern/i,
      "Ballistics analysis": /ballistics|bullet|firearm analysis/i,
      "Shaken Baby Syndrome Theory": /shaken baby|SBS/i,
      "Abusive Head Trauma Theory": /abusive head trauma|AHT/i,
    };
    
    for (const [issue, pattern] of Object.entries(issuePatterns)) {
      if (pattern.test(text)) {
        issues.push(issue);
      }
    }
    
    return issues;
  }

  private static formatWrongfulConvictionChecklist(identified: string[]): string[] {
    const allIssues = [
      "Eyewitness identifications",
      "Confessions",
      "Bite mark evidence",
      "Hair comparison analysis",
      "Fingerprint analysis",
      "Arson/explosives testimony",
      "Tool mark analysis",
      "Tire track analysis",
      "DNA",
      "Psychological Evaluations",
      "Shaken Baby Syndrome Theory",
      "Abusive Head Trauma Theory",
      "Ballistics analysis",
      "Shoe print analysis",
      "GPS/Cell Phone Tower Data",
      "Fiber comparison",
      "Gang evidence",
      "Blood Spatter",
      "Testimony of Children",
      "Scent Detection Dogs",
    ];
    
    return allIssues.map(issue => {
      const checked = identified.includes(issue) ? "☑" : "☐";
      return `${checked} ${issue}`;
    });
  }

  /**
   * Download memo as text file
   */
  static downloadMemo(data: MemoData, fileName: string = "memo.txt"): void {
    const content = this.formatMemoDocument(data);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

