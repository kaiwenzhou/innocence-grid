import { Transcript } from "@/lib/types";

/**
 * Enhanced Memo Generator Service
 * Deep parsing with multiple extraction strategies for maximum data capture
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

export class MemoGeneratorEnhanced {
  /**
   * Generate memo data from transcript with enhanced parsing
   */
  static generateMemoData(transcript: Transcript): MemoData {
    const text = transcript.raw_text;
    const normalizedText = this.normalizeText(text);
    
    return {
      clientName: this.extractClientName(transcript),
      cdcrNumber: transcript.cdcr_number || this.extractCDCRNumber(text),
      contactInfo: this.generateContactInfo(transcript),
      dateOfBirth: this.extractDateOfBirth(normalizedText),
      
      convictionSummary: this.generateConvictionSummary(normalizedText, transcript),
      evidenceUsed: this.extractEvidence(normalizedText),
      theoryOfCase: this.generateTheoryOfCase(normalizedText),
      
      dateOfCrime: this.extractDateOfCrime(normalizedText),
      locationOfCrime: this.extractLocationOfCrime(normalizedText),
      dateOfArrest: this.extractDateOfArrest(normalizedText),
      dateOfConviction: this.extractDateOfConviction(normalizedText),
      convictedOf: this.extractConvictedOf(normalizedText),
      countyOfConviction: this.extractCounty(normalizedText),
      sentence: this.extractSentence(normalizedText),
      paroleEligibilityDate: this.extractParoleEligibility(normalizedText),
      priorParoleHearing: this.extractPriorHearings(normalizedText),
      clientPriors: this.extractPriors(normalizedText),
      
      trialCourtCaseNo: this.extractTrialCaseNumber(normalizedText),
      trialCourt: this.extractTrialCourt(normalizedText),
      trialJudge: this.extractTrialJudge(normalizedText),
      trialAttorney: this.extractTrialAttorney(normalizedText),
      prosecutingAttorney: this.extractProsecutor(normalizedText),
      coDefendant: this.extractCoDefendant(normalizedText),
      coDefendantAttorney: this.extractCoDefendantAttorney(normalizedText),
      
      appellateCase: this.extractAppellateCase(normalizedText),
      appellateAttorneys: this.extractAppellateAttorneys(normalizedText),
      
      directAppeal: this.extractDirectAppeal(normalizedText),
      habeasPetitions: this.extractHabeasPetitions(normalizedText),
      
      prosecutionPresented: this.extractProsecutionEvidence(normalizedText),
      defensePresented: this.extractDefenseEvidence(normalizedText),
      
      wrongfulConvictionIssues: this.identifyWrongfulConvictionIssues(normalizedText),
      
      rawText: text,
    };
  }

  /**
   * Normalize text for better pattern matching
   */
  private static normalizeText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/(\d)\s+(\d)/g, '$1$2') // Fix split numbers like "1 9 9 8"
      .trim();
  }

  /**
   * Extract with multiple pattern attempts
   */
  private static extractWithPatterns(text: string, patterns: RegExp[]): string | null {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  /**
   * Extract CDCR number with multiple patterns
   */
  private static extractCDCRNumber(text: string): string {
    const patterns = [
      /CDCR\s*(?:Number|No\.?|#)[:\s]*([A-Z]\d+)/i,
      /CDCR[:\s]*([A-Z]\d+)/i,
      /CDC\s*(?:Number|No\.?)[:\s]*([A-Z]\d+)/i,
      /inmate\s*(?:number|no\.?)[:\s]*([A-Z]\d+)/i,
    ];
    
    return this.extractWithPatterns(text, patterns) || "Unknown";
  }

  /**
   * Extract date of birth with comprehensive patterns
   */
  private static extractDateOfBirth(text: string): string {
    const patterns = [
      /date\s*of\s*birth[:\s]+(\w+\s+\d{1,2},?\s*\d{4})/i,
      /DOB[:\s]+(\w+\s+\d{1,2},?\s*\d{4})/i,
      /born\s+(?:on\s+)?(\w+\s+\d{1,2},?\s*\d{4})/i,
      /birth\s*date[:\s]+(\w+\s+\d{1,2},?\s*\d{4})/i,
      /born\s+(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /DOB[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /\bborn\s+in\s+(\d{4})/i, // Year only
    ];
    
    return this.extractWithPatterns(text, patterns) || "Not specified in transcript";
  }

  /**
   * Generate comprehensive conviction summary
   */
  private static generateConvictionSummary(text: string, transcript: Transcript): string {
    const name = transcript.inmate_name || "The client";
    const parts: string[] = [];
    
    // Extract conviction info
    const conviction = this.extractConvictedOf(text);
    if (conviction && conviction !== "See transcript for conviction details") {
      parts.push(`${name} was convicted of ${conviction}.`);
    }
    
    // Extract defense strategy
    const defensePatterns = [
      /defense\s+(?:argued|claimed|contended|maintained)[^.]{10,200}\./gi,
      /attorney\s+(?:argued|claimed|stated)[^.]{10,200}\./gi,
    ];
    
    for (const pattern of defensePatterns) {
      const matches = text.match(pattern);
      if (matches && matches[0]) {
        parts.push(matches[0]);
        break;
      }
    }
    
    // Extract innocence claims
    const innocencePatterns = [
      /(?:I|he|she)\s+(?:didn'?t|did\s+not)\s+(?:do|commit)[^.]{10,200}\./gi,
      /maintain(?:s|ed)?\s+(?:my|his|her)?\s*innocence[^.]{0,150}\./gi,
      /(?:wrongly|falsely)\s+(?:convicted|accused)[^.]{0,150}\./gi,
    ];
    
    for (const pattern of innocencePatterns) {
      const matches = text.match(pattern);
      if (matches && matches[0]) {
        parts.push(`${name} maintains: "${matches[0]}"`);
        break;
      }
    }
    
    return parts.length > 0 
      ? parts.join(" ") 
      : `${name} was convicted. Review transcript for detailed conviction circumstances and innocence claims.`;
  }

  /**
   * Extract evidence with comprehensive search
   */
  private static extractEvidence(text: string): string[] {
    const evidence: string[] = [];
    const evidenceMap = new Map<string, string>();
    
    // Testimony patterns
    const testimonyPatterns = [
      /testimony\s+(?:from|of|by)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)[^.]{10,150}\./gi,
      /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+testified\s+(?:that|about)[^.]{10,150}\./gi,
      /witness\s+([A-Z][a-z]+\s+[A-Z][a-z]+)[^.]{10,150}\./gi,
    ];
    
    for (const pattern of testimonyPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        if (match[0]) {
          const key = "testimony_" + evidenceMap.size;
          evidenceMap.set(key, `Testimony: ${match[0].substring(0, 150)}...`);
        }
      }
    }
    
    // Physical evidence
    const physicalEvidencePatterns = [
      /DNA\s+(?:evidence|analysis|testing|sample)[^.]{10,150}\./gi,
      /fingerprint(?:s)?\s+(?:evidence|found|matched)[^.]{10,150}\./gi,
      /(?:weapon|gun|knife)\s+(?:found|recovered|seized)[^.]{10,150}\./gi,
      /physical\s+evidence[^.]{10,150}\./gi,
      /forensic\s+(?:evidence|analysis)[^.]{10,150}\./gi,
    ];
    
    for (const pattern of physicalEvidencePatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        if (match[0]) {
          const key = "physical_" + evidenceMap.size;
          evidenceMap.set(key, `Physical Evidence: ${match[0].substring(0, 150)}...`);
        }
      }
    }
    
    // Statements/Confessions
    if (text.match(/confess(?:ed|ion)|admission|statement\s+to\s+police/i)) {
      evidenceMap.set("confession", "Statement or confession to law enforcement (see transcript for details)");
    }
    
    // Eyewitness identification
    const eyewitnessPatterns = [
      /(?:eyewitness|witness)\s+identif(?:ied|ication)[^.]{10,150}\./gi,
      /lineup\s+identification[^.]{10,150}\./gi,
    ];
    
    for (const pattern of eyewitnessPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        if (match[0]) {
          evidenceMap.set("eyewitness_" + evidenceMap.size, `Eyewitness: ${match[0].substring(0, 150)}...`);
        }
      }
    }
    
    // Convert map to array
    evidenceMap.forEach((value) => evidence.push(value));
    
    if (evidence.length === 0) {
      evidence.push("Evidence details require review of full trial transcript");
      evidence.push("Parole hearing transcript contains limited trial evidence detail");
    }
    
    return evidence.slice(0, 10); // Limit to top 10 pieces of evidence
  }

  /**
   * Generate theory of case with deeper analysis
   */
  private static generateTheoryOfCase(text: string): string {
    const theories: string[] = [];
    
    // Mistaken identification
    if (text.match(/(?:wrong|mistaken)\s+(?:person|identification|identity)/i) ||
        text.match(/wasn'?t\s+me|not\s+me|different\s+person/i)) {
      theories.push("Mistaken identification - client maintains wrong person convicted");
    }
    
    // Alibi
    if (text.match(/alibi|somewhere\s+else|different\s+location|wasn'?t\s+there/i)) {
      theories.push("Alibi defense - client claims to have been elsewhere at time of crime");
    }
    
    // Alternative perpetrator
    if (text.match(/someone\s+else|another\s+person|actual\s+perpetrator|real\s+killer/i)) {
      theories.push("Actual perpetrator defense - evidence suggests someone else committed the crime");
    }
    
    // False testimony
    if (text.match(/(?:false|fabricated|lying|lie|lied)\s+(?:testimony|statement|claim)/i) ||
        text.match(/witness\s+(?:lied|fabricated)/i)) {
      theories.push("False testimony - witness credibility issues, potential perjury");
    }
    
    // Coerced confession
    if (text.match(/coerce(?:d)?|force(?:d)?|pressure(?:d)?.*(?:confess|admission|statement)/i)) {
      theories.push("Coerced confession - statement obtained through improper means");
    }
    
    // Ineffective assistance
    if (text.match(/ineffective\s+(?:assistance|counsel)|inadequate\s+representation/i)) {
      theories.push("Ineffective assistance of counsel at trial");
    }
    
    // Prosecutorial misconduct
    if (text.match(/prosecutorial\s+misconduct|Brady\s+violation|withheld\s+evidence/i)) {
      theories.push("Prosecutorial misconduct - potential Brady violations");
    }
    
    // Junk science
    if (text.match(/(?:shaken\s+baby|bite\s+mark|arson|blood\s+spatter).*(?:discredited|unreliable|junk\s+science)/i)) {
      theories.push("Unreliable forensic science - methods now discredited");
    }
    
    return theories.length > 0 
      ? theories.join("; ") 
      : "Theory requires deeper case investigation - multiple defense strategies possible based on transcript review";
  }

  /**
   * Extract date of crime with comprehensive patterns
   */
  private static extractDateOfCrime(text: string): string {
    const patterns = [
      /(?:crime|offense|incident)\s+(?:occurred|happened|took\s+place)\s+(?:on\s+)?(\w+\s+\d{1,2},?\s*\d{4})/i,
      /(?:on|date)\s+(\w+\s+\d{1,2},?\s*\d{4}).*(?:crime|offense|murder|killing)/i,
      /commitment\s+offense.*?(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /crime\s+date[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /offense\s+date[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /(?:in|during)\s+(\d{4}).*(?:crime|offense|murder|killing)/i, // Year only
    ];
    
    const result = this.extractWithPatterns(text, patterns);
    return result || "Not specified in transcript - check trial records";
  }

  /**
   * Extract location of crime with comprehensive search
   */
  private static extractLocationOfCrime(text: string): string {
    const patterns = [
      /(?:crime|offense|incident|murder|killing)\s+(?:occurred|happened|took\s+place)\s+(?:in|at|near)\s+([A-Z][a-z]+(?:,?\s+[A-Z][a-z]+)?),?\s*(?:California|CA)/i,
      /(?:in|at|near)\s+([A-Z][a-z]+(?:,?\s+[A-Z][a-z]+)?),?\s*(?:California|CA).*(?:crime|offense|murder|killing)/i,
      /location[:\s]+([A-Z][a-z]+(?:,?\s+[A-Z][a-z]+)?),?\s*(?:California|CA)/i,
      /(?:County\s+of\s+)?([A-Z][a-z]+)\s+County.*(?:crime|offense)/i,
    ];
    
    const result = this.extractWithPatterns(text, patterns);
    return result ? result + ", California" : "Not specified in transcript";
  }

  /**
   * Extract date of arrest
   */
  private static extractDateOfArrest(text: string): string {
    const patterns = [
      /arrest(?:ed)?\s+(?:on|date)[:\s]+(\w+\s+\d{1,2},?\s*\d{4})/i,
      /arrest(?:ed)?\s+(?:on\s+)?(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /taken\s+into\s+custody\s+(?:on\s+)?(\w+\s+\d{1,2},?\s*\d{4})/i,
      /apprehend(?:ed)?\s+(?:on\s+)?(\w+\s+\d{1,2},?\s*\d{4})/i,
    ];
    
    return this.extractWithPatterns(text, patterns) || "Not specified in transcript";
  }

  /**
   * Extract date of conviction with multiple patterns
   */
  private static extractDateOfConviction(text: string): string {
    const patterns = [
      /convicted\s+(?:on|in)\s+(\w+\s+\d{1,2},?\s*\d{4})/i,
      /conviction\s+date[:\s]+(\w+\s+\d{1,2},?\s*\d{4})/i,
      /convicted\s+(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /jury\s+(?:verdict|returned).*?(\w+\s+\d{1,2},?\s*\d{4})/i,
      /found\s+guilty.*?(\w+\s+\d{1,2},?\s*\d{4})/i,
      /verdict.*?(\d{1,2}\/\d{1,2}\/\d{4})/i,
    ];
    
    return this.extractWithPatterns(text, patterns) || "Not specified in transcript - check court records";
  }

  /**
   * Extract crimes convicted of with comprehensive search
   */
  private static extractConvictedOf(text: string): string {
    const patterns = [
      /convicted\s+of\s+([^.]{15,200}?)(?:\.|sentence|in\s+\d{4})/i,
      /commitment\s+offense[:\s]+([^.]{15,200}?)(?:\.|sentence)/i,
      /(?:guilty|convicted).*?(?:of|to)\s+([^.]{15,150}?)(?:\.|and|with)/i,
      /crime[:\s]+([^.]{15,150}?)(?:\.|sentence|convicted)/i,
    ];
    
    const result = this.extractWithPatterns(text, patterns);
    if (result) {
      // Clean up the extracted text
      let cleaned = result
        .replace(/\s+/g, ' ')
        .replace(/with\s+enhancements?/i, '')
        .trim();
      
      if (cleaned.length > 200) {
        cleaned = cleaned.substring(0, 200) + "...";
      }
      
      return cleaned;
    }
    
    return "See transcript for conviction details";
  }

  /**
   * Extract county with multiple pattern attempts
   */
  private static extractCounty(text: string): string {
    const patterns = [
      /(?:County\s+of|in)\s+([A-Z][a-z]+)\s+County/i,
      /([A-Z][a-z]+)\s+County.*(?:Superior\s+Court|convicted|trial)/i,
      /(?:convicted|sentenced)\s+in\s+([A-Z][a-z]+)\s+County/i,
      /Superior\s+Court.*?([A-Z][a-z]+)\s+County/i,
    ];
    
    const result = this.extractWithPatterns(text, patterns);
    return result ? result + " County, California" : "Not specified in transcript";
  }

  /**
   * Extract sentence with comprehensive patterns
   */
  private static extractSentence(text: string): string {
    const patterns = [
      /sentenced?\s+to\s+(\d+\s+years?\s+to\s+life(?:\s+with(?:out)?\s+(?:the\s+)?possibility\s+of\s+parole)?)/i,
      /sentence[:\s]+(\d+\s+years?\s+to\s+life)/i,
      /(life\s+(?:without|with(?:out)?)\s+(?:the\s+)?possibility\s+of\s+parole)/i,
      /sentenced?\s+to\s+(\d+\s+years?)/i,
      /sentence\s+(?:of|is)\s+(\d+\s+years?)/i,
      /(\d+)\s+years?\s+to\s+life/i,
      /LWOP/i, // Life without parole acronym
    ];
    
    let result = this.extractWithPatterns(text, patterns);
    
    // Check for LWOP acronym
    if (!result && text.match(/LWOP/i)) {
      result = "Life Without Possibility of Parole (LWOP)";
    }
    
    // Check for multiple counts
    if (result && text.match(/consecutive|concurrent/i)) {
      const consecutive = text.match(/consecutive/i);
      result += consecutive ? " (consecutive)" : " (concurrent)";
    }
    
    return result || "Not specified in transcript - check sentencing documents";
  }

  /**
   * Extract parole eligibility date
   */
  private static extractParoleEligibility(text: string): string {
    const patterns = [
      /parole\s+eligibility\s+(?:date|is|in)[:\s]+(\d{4})/i,
      /eligible\s+for\s+parole\s+(?:in|on)[:\s]+(\d{4})/i,
      /minimum\s+eligible\s+parole\s+date[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /MEPD[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /next\s+parole\s+(?:consideration|hearing)[:\s]+(\d{4})/i,
    ];
    
    return this.extractWithPatterns(text, patterns) || "Not specified in transcript";
  }

  /**
   * Extract prior hearing information
   */
  private static extractPriorHearings(text: string): string {
    const patterns = [
      /prior\s+(?:parole\s+)?hearing[s]?[:\s]+([^.]{20,150})/i,
      /previous\s+hearing.*?(\d{4})/i,
      /last\s+hearing.*?(\d{4})/i,
      /denied\s+parole.*?(\d{4})/i,
    ];
    
    const result = this.extractWithPatterns(text, patterns);
    if (result) return result;
    
    // Check if this is mentioned as first hearing
    if (text.match(/first\s+(?:parole\s+)?hearing|initial\s+hearing/i)) {
      return "First parole hearing (initial appearance)";
    }
    
    return "Not mentioned in transcript";
  }

  /**
   * Extract prior convictions
   */
  private static extractPriors(text: string): string {
    const parts: string[] = [];
    
    const patterns = [
      /prior\s+conviction[s]?[:\s]+([^.]{20,200})/i,
      /previous\s+conviction[s]?[:\s]+([^.]{20,200})/i,
      /criminal\s+history[:\s]+([^.]{20,200})/i,
      /prior\s+record[:\s]+([^.]{20,200})/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        parts.push(match[1].trim());
      }
    }
    
    if (parts.length > 0) return parts.join("; ");
    
    // Check for "no priors" statements
    if (text.match(/no\s+prior\s+(?:convictions|record|criminal\s+history)/i)) {
      return "No prior convictions mentioned";
    }
    
    return "Not specified in transcript - check RAP sheet";
  }

  /**
   * Extract trial case number
   */
  private static extractTrialCaseNumber(text: string): string {
    const patterns = [
      /(?:case|docket)\s+(?:number|no\.?|#)[:\s]*([A-Z]{1,3}\d{4,10}(?:-\d+)?)/i,
      /(?:trial|superior)\s+court\s+case[:\s]*([A-Z]{1,3}\d{4,10}(?:-\d+)?)/i,
      /case\s+#?[:\s]*([A-Z]{1,3}\d{4,10})/i,
    ];
    
    return this.extractWithPatterns(text, patterns) || "Not specified in transcript - check court records";
  }

  /**
   * Extract trial court
   */
  private static extractTrialCourt(text: string): string {
    const patterns = [
      /([A-Z][a-z]+)\s+County\s+Superior\s+Court/i,
      /Superior\s+Court.*?([A-Z][a-z]+)\s+County/i,
      /trial\s+(?:in|at)\s+([A-Z][a-z]+)\s+County/i,
    ];
    
    const result = this.extractWithPatterns(text, patterns);
    return result ? result + " County Superior Court" : "Not specified in transcript";
  }

  /**
   * Extract trial judge name
   */
  private static extractTrialJudge(text: string): string {
    const patterns = [
      /(?:Judge|Hon\.|Honorable)\s+([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+)/i,
      /trial\s+judge[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
      /presiding\s+judge[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    ];
    
    return this.extractWithPatterns(text, patterns) || "Not specified in transcript";
  }

  /**
   * Extract trial attorney
   */
  private static extractTrialAttorney(text: string): string {
    const patterns = [
      /(?:defense\s+attorney|defense\s+counsel|represented\s+by)[:\s]+([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+)/i,
      /attorney\s+([A-Z][a-z]+\s+[A-Z][a-z]+)\s+represent(?:ed|ing)/i,
      /counsel\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    ];
    
    const result = this.extractWithPatterns(text, patterns);
    if (result) return result;
    
    // Check for public defender
    if (text.match(/public\s+defender/i)) {
      return "Public Defender (name not specified in transcript)";
    }
    
    return "Not specified in transcript";
  }

  /**
   * Extract prosecutor name
   */
  private static extractProsecutor(text: string): string {
    const patterns = [
      /(?:prosecutor|district\s+attorney|DA)[:\s]+([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+)/i,
      /(?:prosecuted\s+by|prosecution\s+by)[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
      /deputy\s+(?:district\s+attorney|DA)[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    ];
    
    return this.extractWithPatterns(text, patterns) || "Not specified in transcript";
  }

  /**
   * Extract co-defendant information
   */
  private static extractCoDefendant(text: string): string {
    const patterns = [
      /(?:co-defendant|codefendant)[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
      /(?:along\s+with|together\s+with)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
      /jointly\s+tried\s+with\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    ];
    
    const result = this.extractWithPatterns(text, patterns);
    if (result) return result;
    
    if (text.match(/no\s+co-defendant|tried\s+alone|sole\s+defendant/i)) {
      return "None (tried alone)";
    }
    
    return "Not mentioned in transcript";
  }

  /**
   * Extract co-defendant attorney
   */
  private static extractCoDefendantAttorney(text: string): string {
    const patterns = [
      /co-defendant.*?attorney[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
      /co-defendant.*?represented\s+by\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    ];
    
    return this.extractWithPatterns(text, patterns) || "";
  }

  /**
   * Extract appellate case information
   */
  private static extractAppellateCase(text: string): string {
    const patterns = [
      /(?:appellate|appeal)\s+(?:case|court).*?([A-Z]\d{6,10})/i,
      /(?:Court\s+of\s+Appeal|Supreme\s+Court).*?case.*?([A-Z]\d{6,10})/i,
      /appeal.*?docket.*?([A-Z]\d{6,10})/i,
    ];
    
    const result = this.extractWithPatterns(text, patterns);
    if (result) return result;
    
    if (text.match(/no\s+appeal|did\s+not\s+appeal|waived\s+appeal/i)) {
      return "No appeal filed";
    }
    
    return "Not specified - check California Courts Appellate Portal";
  }

  /**
   * Extract appellate attorneys
   */
  private static extractAppellateAttorneys(text: string): string {
    const patterns = [
      /appellate\s+(?:attorney|counsel)[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
      /appeal\s+represented\s+by\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    ];
    
    return this.extractWithPatterns(text, patterns) || "";
  }

  /**
   * Extract direct appeal information
   */
  private static extractDirectAppeal(text: string): string {
    const parts: string[] = [];
    
    if (text.match(/appeal/i)) {
      const appealPatterns = [
        /appeal.*?(?:filed|raised|argued)[^.]{20,250}\./gi,
        /(?:Court\s+of\s+Appeal|appellate\s+court).*?(?:affirmed|reversed|remanded)[^.]{20,150}\./gi,
      ];
      
      for (const pattern of appealPatterns) {
        const matches = [...text.matchAll(pattern)];
        for (const match of matches.slice(0, 3)) { // Limit to 3 mentions
          parts.push(match[0]);
        }
      }
    }
    
    if (parts.length > 0) return parts.join(" ");
    
    if (text.match(/no\s+appeal|did\s+not\s+appeal/i)) {
      return "No direct appeal filed";
    }
    
    return "Not mentioned in transcript - requires separate research";
  }

  /**
   * Extract habeas corpus information
   */
  private static extractHabeasPetitions(text: string): string {
    const parts: string[] = [];
    
    const habeasPatterns = [
      /habeas\s+corpus.*?(?:filed|petition)[^.]{20,200}\./gi,
      /writ\s+of\s+habeas.*?[^.]{20,200}\./gi,
      /habeas.*?(?:denied|granted)[^.]{20,200}\./gi,
    ];
    
    for (const pattern of habeasPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches.slice(0, 2)) {
        parts.push(match[0]);
      }
    }
    
    if (parts.length > 0) return parts.join(" ");
    
    if (text.match(/no\s+habeas|no\s+writ/i)) {
      return "No habeas corpus petitions mentioned";
    }
    
    return "Not mentioned in transcript";
  }

  /**
   * Extract prosecution evidence presented
   */
  private static extractProsecutionEvidence(text: string): string {
    const evidence: string[] = [];
    
    const patterns = [
      /prosecution\s+(?:presented|argued|showed)[^.]{20,200}\./gi,
      /state(?:'s)?\s+evidence\s+included[^.]{20,200}\./gi,
      /prosecutor\s+(?:called|presented)[^.]{20,200}\./gi,
    ];
    
    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches.slice(0, 5)) {
        evidence.push(match[0]);
      }
    }
    
    return evidence.length > 0 
      ? evidence.join(" ") 
      : "Prosecution evidence details not extensively covered in parole hearing transcript - see trial transcripts";
  }

  /**
   * Extract defense evidence presented
   */
  private static extractDefenseEvidence(text: string): string {
    const evidence: string[] = [];
    
    const patterns = [
      /defense\s+(?:presented|argued|showed|called)[^.]{20,200}\./gi,
      /(?:attorney|counsel)\s+argued[^.]{20,200}\./gi,
      /defense\s+(?:witness|evidence)[^.]{20,200}\./gi,
    ];
    
    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches.slice(0, 5)) {
        evidence.push(match[0]);
      }
    }
    
    return evidence.length > 0 
      ? evidence.join(" ") 
      : "Defense presentation details not extensively covered in parole hearing transcript - see trial transcripts";
  }

  /**
   * Identify wrongful conviction issues with deep analysis
   */
  private static identifyWrongfulConvictionIssues(text: string): string[] {
    const issues: string[] = [];
    
    const issuePatterns: Record<string, RegExp[]> = {
      "Eyewitness identifications": [
        /eyewitness|witness.*identif|lineup|photo.*array/i,
        /pointed.*out|identified.*as/i,
      ],
      "Confessions": [
        /confess|confession|admission|statement.*police/i,
        /interrogat|question.*by.*police/i,
      ],
      "DNA": [
        /DNA|genetic|biological.*evidence/i,
      ],
      "Fingerprint analysis": [
        /fingerprint|print.*analysis|latent.*print/i,
      ],
      "Bite mark evidence": [
        /bite.*mark|dental.*impression/i,
      ],
      "Hair comparison analysis": [
        /hair.*comparison|hair.*analysis|hair.*match/i,
      ],
      "Arson/explosives testimony": [
        /arson|fire.*investigat|explosion|accelerant/i,
      ],
      "Ballistics analysis": [
        /ballistics|bullet|firearm.*analysis|gunshot.*residue|GSR/i,
      ],
      "Blood Spatter": [
        /blood.*spatter|blood.*pattern|blood.*stain/i,
      ],
      "Gang evidence": [
        /gang|gang.*member|gang.*affiliation/i,
      ],
      "Testimony of Children": [
        /child.*witness|child.*testif|juvenile.*witness/i,
      ],
      "Shaken Baby Syndrome Theory": [
        /shaken.*baby|SBS/i,
      ],
      "Abusive Head Trauma Theory": [
        /abusive.*head.*trauma|AHT/i,
      ],
      "Psychological Evaluations": [
        /psychological.*evaluat|psych.*eval|mental.*health.*expert/i,
      ],
      "GPS/Cell Phone Tower Data": [
        /GPS|cell.*phone.*tower|cell.*site|phone.*record/i,
      ],
      "Fiber comparison": [
        /fiber.*analysis|fiber.*comparison|textile.*evidence/i,
      ],
      "Tool mark analysis": [
        /tool.*mark|tool.*impression/i,
      ],
      "Tire track analysis": [
        /tire.*track|tire.*impression/i,
      ],
      "Shoe print analysis": [
        /shoe.*print|footprint|foot.*impression/i,
      ],
      "Scent Detection Dogs": [
        /cadaver.*dog|scent.*dog|K-9|canine.*detection/i,
      ],
    };
    
    for (const [issue, patterns] of Object.entries(issuePatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          issues.push(issue);
          break; // Only add once per issue
        }
      }
    }
    
    return issues;
  }

  private static extractClientName(transcript: Transcript): string {
    return transcript.inmate_name || "Unknown";
  }

  private static generateContactInfo(transcript: Transcript): string {
    return "Look up on CDCR Incarcerated Person Locator (https://inmatelocator.cdcr.ca.gov/)";
  }

  /**
   * Format memo document
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
      `Co-Defendant's Attorney: ${data.coDefendantAttorney || "N/A"}`,
      "",
      "California Appellate Court Case Information",
      "https://appellate.courts.ca.gov",
      `Appellate Case No.: ${data.appellateCase}`,
      `Appellate Attorneys: ${data.appellateAttorneys || "Not specified"}`,
      "",
      "═".repeat(80),
      "",
      "POST-CONVICTION ISSUES RAISED",
      "",
      "A. State Direct Appeal (if any)",
      data.directAppeal,
      "",
      "B. Habeas Petitions (if any)",
      data.habeasPetitions,
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
      "□ Review complete trial transcripts",
      "□ Obtain police reports and investigation files",
      "□ Interview witnesses (if available)",
      "□ Consult with experts on identified forensic issues",
      "□ Research case law on identified wrongful conviction issues",
      "□ Prepare detailed innocence investigation report",
      "□ Consider habeas corpus petition if not already filed",
      "□ Contact appellate court for complete case records",
      "",
      "═".repeat(80),
      "",
      `Generated: ${new Date().toLocaleString()}`,
      "Source: JusticeMAP Parole Hearing Transcript Analysis",
      "This is a work product prepared for legal review and should be treated as confidential.",
      "",
      "NOTE: This memorandum is based on parole hearing transcript analysis. Parole hearings",
      "typically do not contain extensive trial evidence details. For comprehensive case review,",
      "obtain and analyze: (1) complete trial transcripts, (2) police reports, (3) discovery",
      "materials, (4) appellate briefs, and (5) any habeas corpus petitions filed.",
    ];
    
    return lines.join("\n");
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

