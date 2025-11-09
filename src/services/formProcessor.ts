import { Transcript } from "@/lib/types";

/**
 * Form Processor Service
 * Extracts data from parole transcripts and maps it to client intake form fields
 */

export interface ClientFormData {
  // I. PERSONAL INFORMATION
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  alias: string;
  cdcrNumber: string;
  dateOfBirth: string;
  currentPrison: string;
  mailingAddress: string;
  city: string;
  state: string;
  zipCode: string;
  currentCellLocation: string;
  raceEthnicity: string;
  primaryLanguage: string;
  highestEducation: string;
  militaryService: string;
  disability: string;
  
  // II. ATTORNEY INFORMATION
  trialAttorney: {
    firstName: string;
    lastName: string;
    type: string;
  } | null;
  appellateAttorney: {
    firstName: string;
    lastName: string;
  } | null;
  
  // III. FAMILY/FRIEND INFORMATION
  familyContacts: Array<{
    firstName: string;
    lastName: string;
    relation: string;
  }>;
  
  // IV. BASIC CASE INFORMATION
  ageAtCrime: string;
  dateOfCrime: string;
  locationOfCrime: string;
  dateOfArrest: string;
  locationOfArrest: string;
  bookingNumber: string;
  trialJudge: {
    firstName: string;
    lastName: string;
  } | null;
  typeOfTrial: string;
  multipleTrials: string;
  prosecutor: {
    firstName: string;
    lastName: string;
  } | null;
  prosecutorClaim: string;
  victimNames: string[];
  crimesConvicted: string;
  countyOfConviction: string;
  dateOfSentencing: string;
  sentence: string;
  paroleEligibilityDate: string;
  priorParoleHearings: string;
  otherConvictions: string;
  priorConvictions: string;
  actuallyInnocent: string;
  howBecameSuspect: string;
  otherSuspects: string;
  gaveStatementToPolice: string;
  expertTestimony: string[];
  physicalEvidenceCollected: string;
  knewVictim: string;
  victimIdentification: string;
  othersClaimedCrime: string;
  witnessReasonsToLie: string;
  witnessesWantToRecant: string;
  presentAtScene: string;
  defenseStrategies: string;
  defendantTestify: string;
  alibiWitnessTestify: string;
  defenseWitnesses: string;
  whoCommittedCrime: string;
  evidenceOfInnocence: string[];
  
  // VI. CODEFENDANTS
  othersArrestedCharged: string;
  codefendantStatement: string;
  codefendantTestified: string;
  knewCodefendantPrior: string;
  contactSinceTrial: string;
  
  // VII. DESCRIPTIVE INFORMATION
  heightAtCrime: string;
  weightAtCrime: string;
  skinColor: string;
  hairLengthStyle: string;
  facialHair: string;
  scarsTattoos: string;
  
  // VIII. ADDITIONAL INFORMATION
  additionalInfo: string;
  
  // Commissioner Information (for context)
  commissioners: string[];
  panelComposition: string;
  
  // Raw data for reference
  rawTranscript: string;
  
  // Additional fields used in other methods
  facilityName?: string;
  facilityAddress?: string;
  hearingDate?: string;
  hasInnocenceClaim?: boolean;
  innocenceStatement?: string;
  programsCompleted?: string[];
  supportLetters?: string;
}

export class FormProcessor {
  /**
   * Process transcript and extract form data
   * Leaves fields blank ("") if not found so volunteers can fill manually
   */
  static processTranscriptForForm(transcript: Transcript): ClientFormData {
    const text = transcript.raw_text;
    const inmateName = transcript.inmate_name || "";
    
    return {
      // I. PERSONAL INFORMATION
      firstName: this.extractFirstName(inmateName),
      middleName: this.extractMiddleName(inmateName),
      lastName: this.extractLastName(inmateName),
      fullName: inmateName,
      alias: this.extractAlias(text),
      cdcrNumber: transcript.cdcr_number || "",
      dateOfBirth: this.extractDateOfBirth(text),
      currentPrison: this.extractFacilityName(text),
      mailingAddress: this.constructMailingAddress(text),
      city: this.extractCity(text),
      state: "California", // Default for CA transcripts
      zipCode: this.extractZipCode(text),
      currentCellLocation: "", // Not typically in transcripts
      raceEthnicity: "", // Not appropriate to auto-extract
      primaryLanguage: this.detectPrimaryLanguage(text),
      highestEducation: this.extractEducation(text),
      militaryService: this.extractMilitaryService(text),
      disability: this.extractDisability(text),
      
      // II. ATTORNEY INFORMATION
      trialAttorney: this.extractTrialAttorney(text),
      appellateAttorney: this.extractAppellateAttorney(text),
      
      // III. FAMILY/FRIEND INFORMATION
      familyContacts: this.extractFamilyContacts(text),
      
      // IV. BASIC CASE INFORMATION
      ageAtCrime: this.calculateAgeAtCrime(text, transcript.hearing_date),
      dateOfCrime: this.extractDateOfCrime(text),
      locationOfCrime: this.extractLocationOfCrime(text),
      dateOfArrest: this.extractDateOfArrest(text),
      locationOfArrest: this.extractLocationOfArrest(text),
      bookingNumber: transcript.cdcr_number || "", // May be same or different
      trialJudge: this.extractTrialJudge(text),
      typeOfTrial: this.extractTypeOfTrial(text),
      multipleTrials: this.detectMultipleTrials(text),
      prosecutor: this.extractProsecutor(text),
      prosecutorClaim: this.extractProsecutorClaim(text),
      victimNames: this.extractVictimNames(text),
      crimesConvicted: this.extractConvictionDetails(text),
      countyOfConviction: this.extractCounty(text),
      dateOfSentencing: this.extractSentencingDate(text),
      sentence: this.extractSentenceLength(text),
      paroleEligibilityDate: this.extractParoleEligibility(text),
      priorParoleHearings: this.extractPriorHearings(text),
      otherConvictions: this.extractOtherConvictions(text),
      priorConvictions: this.extractPriorConvictions(text),
      actuallyInnocent: this.detectInnocenceClaim(text) ? "Yes" : "",
      howBecameSuspect: this.extractHowBecameSuspect(text),
      otherSuspects: this.extractOtherSuspects(text),
      gaveStatementToPolice: this.detectPoliceStatement(text),
      expertTestimony: this.extractExpertTestimony(text),
      physicalEvidenceCollected: this.detectPhysicalEvidence(text),
      knewVictim: this.detectKnewVictim(text),
      victimIdentification: this.extractVictimIdentification(text),
      othersClaimedCrime: this.extractOthersClaimedCrime(text),
      witnessReasonsToLie: this.extractWitnessMotivation(text),
      witnessesWantToRecant: this.detectRecantation(text),
      presentAtScene: this.extractPresenceAtScene(text),
      defenseStrategies: this.extractDefenseStrategies(text),
      defendantTestify: this.detectDefendantTestimony(text),
      alibiWitnessTestify: this.detectAlibiWitness(text),
      defenseWitnesses: this.extractDefenseWitnesses(text),
      whoCommittedCrime: this.extractActualPerpetrator(text),
      evidenceOfInnocence: this.extractEvidenceTypes(text),
      
      // VI. CODEFENDANTS
      othersArrestedCharged: this.detectCodefendants(text),
      codefendantStatement: this.extractCodefendantStatement(text),
      codefendantTestified: this.detectCodefendantTestimony(text),
      knewCodefendantPrior: this.extractCodefendantRelationship(text),
      contactSinceTrial: "", // Not typically in transcripts
      
      // VII. DESCRIPTIVE INFORMATION
      heightAtCrime: "", // Not typically in transcripts
      weightAtCrime: "", // Not typically in transcripts
      skinColor: "", // Not appropriate to auto-extract
      hairLengthStyle: "", // Not typically in transcripts
      facialHair: "", // Not typically in transcripts
      scarsTattoos: "", // Not typically in transcripts
      
      // VIII. ADDITIONAL INFORMATION
      additionalInfo: this.generateAdditionalInfo(text, transcript),
      
      // Commissioner Information
      commissioners: this.extractCommissioners(text),
      panelComposition: this.analyzePanelComposition(text),
      
      // Raw data
      rawTranscript: text,
      
      // Additional fields
      facilityName: this.extractFacilityName(text),
      facilityAddress: this.extractFacilityAddress(text),
      hearingDate: transcript.hearing_date ? new Date(transcript.hearing_date).toLocaleDateString() : "",
      hasInnocenceClaim: this.detectInnocenceClaim(text),
      innocenceStatement: this.extractInnocenceStatement(text),
      programsCompleted: this.extractPrograms(text),
      supportLetters: this.extractSupportInfo(text),
    };
  }

  /**
   * Extract first name from full name
   */
  private static extractFirstName(fullName: string | null): string {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    return parts[0] || "";
  }

  /**
   * Extract middle name from full name
   */
  private static extractMiddleName(fullName: string | null): string {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length > 2) {
      return parts.slice(1, -1).join(" ");
    }
    return "";
  }

  /**
   * Extract last name from full name
   */
  private static extractLastName(fullName: string | null): string {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    return parts.length > 1 ? parts[parts.length - 1] : "";
  }

  /**
   * Extract facility name
   */
  private static extractFacilityName(text: string): string {
    // Look for patterns like "California State Prison, San Quentin" or "CDCR - San Quentin"
    const facilityPatterns = [
      /(?:at|from)\s+([A-Z][A-Za-z\s]+(?:State Prison|Correctional Facility|Prison))/i,
      /(?:CDCR|California State Prison)[,\s-]+([A-Za-z\s]+)/i,
    ];
    
    for (const pattern of facilityPatterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    
    return "Not specified in transcript";
  }

  /**
   * Extract facility address
   */
  private static extractFacilityAddress(text: string): string {
    // This would typically come from a database of known facilities
    // For now, return a placeholder
    return "California Department of Corrections and Rehabilitation";
  }

  /**
   * Extract conviction details
   */
  private static extractConvictionDetails(text: string): string {
    const convictionPatterns = [
      /convicted of\s+([^.]+)/i,
      /commitment offense[:\s]+([^.]+)/i,
      /crime[:\s]+([^.]+)/i,
    ];
    
    for (const pattern of convictionPatterns) {
      const match = text.match(pattern);
      if (match) {
        let detail = match[1].trim();
        // Limit to reasonable length
        if (detail.length > 200) {
          detail = detail.substring(0, 200) + "...";
        }
        return detail;
      }
    }
    
    return "See transcript for details";
  }

  /**
   * Extract sentence length
   */
  private static extractSentenceLength(text: string): string {
    const sentencePatterns = [
      /sentenced to\s+(\d+\s+years?(?:\s+to\s+life)?)/i,
      /sentence[:\s]+(\d+\s+years?(?:\s+to\s+life)?)/i,
      /(\d+\s+years?\s+to\s+life)/i,
      /(life\s+(?:without|with)\s+(?:the\s+)?possibility\s+of\s+parole)/i,
    ];
    
    for (const pattern of sentencePatterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    
    return "Not specified in transcript";
  }

  /**
   * Detect innocence claim
   */
  private static detectInnocenceClaim(text: string): boolean {
    const innocencePatterns = [
      /maintain.*different/i,
      /I\s+(?:did\s+not|didn't)\s+do/i,
      /innocent/i,
      /wrongly\s+convicted/i,
      /falsely\s+accused/i,
      /I\s+didn't\s+commit/i,
    ];
    
    return innocencePatterns.some(pattern => pattern.test(text));
  }

  /**
   * Extract innocence statement
   */
  private static extractInnocenceStatement(text: string): string {
    const innocencePatterns = [
      /I\s+(?:did\s+not|didn't)\s+do[^.]{0,300}\./i,
      /maintain.*different[^.]{0,300}\./i,
      /innocent[^.]{0,300}\./i,
    ];
    
    for (const pattern of innocencePatterns) {
      const match = text.match(pattern);
      if (match) return match[0].trim();
    }
    
    return this.detectInnocenceClaim(text) 
      ? "Applicant maintains innocence. See transcript for full statement."
      : "No explicit innocence claim detected.";
  }

  /**
   * Extract commissioner names
   */
  private static extractCommissioners(text: string): string[] {
    const commissioners: string[] = [];
    const panelMatch = text.match(/PANEL PRESENT:?\s*([\s\S]*?)(?:OTHERS PRESENT|$)/i);
    
    if (panelMatch) {
      const panelSection = panelMatch[1];
      const matches = panelSection.matchAll(/([A-Z]+(?:\s+[A-Z]+)+),?\s+(?:Presiding|Deputy)?\s*Commissioner/gi);
      
      for (const match of matches) {
        const name = match[1].trim();
        if (name.split(/\s+/).length >= 2) {
          commissioners.push(name);
        }
      }
    }
    
    return commissioners;
  }

  /**
   * Analyze panel composition
   */
  private static analyzePanelComposition(text: string): string {
    const commissioners = this.extractCommissioners(text);
    
    if (commissioners.length === 0) {
      return "Panel composition not identified in transcript";
    }
    
    return `Panel of ${commissioners.length}: ${commissioners.join(", ")}`;
  }

  /**
   * Extract completed programs
   */
  private static extractPrograms(text: string): string[] {
    const programs: string[] = [];
    
    // Look for common program mentions
    const programPatterns = [
      /(?:completed|participated in|took)\s+([A-Z][A-Za-z\s&-]+(?:program|class|therapy|counseling))/gi,
      /([A-Z][A-Za-z\s&-]+(?:program|class|therapy|counseling))/gi,
    ];
    
    const programKeywords = [
      "Alcoholics Anonymous", "AA", "Narcotics Anonymous", "NA",
      "anger management", "victim impact", "substance abuse",
      "education", "vocational", "GED", "college", "therapy"
    ];
    
    // Check for program keywords
    for (const keyword of programKeywords) {
      const regex = new RegExp(keyword, "gi");
      if (regex.test(text)) {
        if (!programs.includes(keyword)) {
          programs.push(keyword);
        }
      }
    }
    
    return programs.slice(0, 10); // Limit to 10 programs
  }

  /**
   * Extract support information
   */
  private static extractSupportInfo(text: string): string {
    const supportPatterns = [
      /letters of support from\s+([^.]{0,200})/i,
      /support from\s+([^.]{0,200})/i,
      /family members?\s+([^.]{0,200})/i,
    ];
    
    for (const pattern of supportPatterns) {
      const match = text.match(pattern);
      if (match) return match[0].trim();
    }
    
    return "See transcript for support information";
  }

  // ============ Additional Helper Methods ============

  private static extractAlias(text: string): string { return ""; }
  private static extractDateOfBirth(text: string): string {
    const dobPattern = /(?:date of birth|DOB|born)[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i;
    const match = text.match(dobPattern);
    return match ? match[1] : "";
  }
  private static constructMailingAddress(text: string): string { return this.extractFacilityAddress(text); }
  private static extractCity(text: string): string { return ""; }
  private static extractZipCode(text: string): string { return ""; }
  private static detectPrimaryLanguage(text: string): string { 
    if (text.match(/interpreter|translator|spanish|language barrier/i)) return "Other";
    return "English"; 
  }
  private static extractEducation(text: string): string {
    if (text.match(/college degree|bachelor|master/i)) return "College";
    if (text.match(/GED|high school diploma/i)) return "GED/High School";
    return "";
  }
  private static extractMilitaryService(text: string): string {
    if (text.match(/military|army|navy|air force|marines|veteran/i)) return "Yes";
    return "No";
  }
  private static extractDisability(text: string): string { return ""; }
  private static extractTrialAttorney(text: string): { firstName: string; lastName: string; type: string; } | null {
    const match = text.match(/(?:represented by|defense attorney|defense counsel)[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i);
    if (match) {
      const parts = match[1].split(/\s+/);
      return { firstName: parts[0], lastName: parts[1] || "", type: "Unknown" };
    }
    return null;
  }
  private static extractAppellateAttorney(text: string): { firstName: string; lastName: string; } | null { return null; }
  private static extractFamilyContacts(text: string): Array<{ firstName: string; lastName: string; relation: string; }> { return []; }
  private static calculateAgeAtCrime(text: string, hearingDate: string | null): string { return ""; }
  private static extractDateOfCrime(text: string): string {
    const pattern = /(?:crime|offense).*?(\d{1,2}\/\d{1,2}\/\d{4}|\w+ \d{1,2}, \d{4})/i;
    const match = text.match(pattern);
    return match ? match[1] : "";
  }
  private static extractLocationOfCrime(text: string): string {
    const pattern = /(?:in|at|near)\s+([A-Z][a-z]+(?:,\s*[A-Z][a-z]+)?)\s*,?\s*(?:California|CA)/i;
    const match = text.match(pattern);
    return match ? match[1] + ", California" : "";
  }
  private static extractDateOfArrest(text: string): string { return ""; }
  private static extractLocationOfArrest(text: string): string { return ""; }
  private static extractTrialJudge(text: string): { firstName: string; lastName: string; } | null { return null; }
  private static extractTypeOfTrial(text: string): string {
    if (text.match(/jury trial/i)) return "Jury";
    if (text.match(/bench trial/i)) return "Bench";
    return "";
  }
  private static detectMultipleTrials(text: string): string { return ""; }
  private static extractProsecutor(text: string): { firstName: string; lastName: string; } | null { return null; }
  private static extractProsecutorClaim(text: string): string { return ""; }
  private static extractVictimNames(text: string): string[] { return []; }
  private static extractCounty(text: string): string {
    const pattern = /(?:County of|in)\s+([A-Z][a-z]+)\s+County/i;
    const match = text.match(pattern);
    return match ? match[1] + " County" : "";
  }
  private static extractSentencingDate(text: string): string { return ""; }
  private static extractParoleEligibility(text: string): string { return ""; }
  private static extractPriorHearings(text: string): string { return ""; }
  private static extractOtherConvictions(text: string): string { return ""; }
  private static extractPriorConvictions(text: string): string { return ""; }
  private static extractHowBecameSuspect(text: string): string { return ""; }
  private static extractOtherSuspects(text: string): string { return ""; }
  private static detectPoliceStatement(text: string): string { return ""; }
  private static extractExpertTestimony(text: string): string[] { return []; }
  private static detectPhysicalEvidence(text: string): string { return ""; }
  private static detectKnewVictim(text: string): string { return ""; }
  private static extractVictimIdentification(text: string): string { return ""; }
  private static extractOthersClaimedCrime(text: string): string { return ""; }
  private static extractWitnessMotivation(text: string): string { return ""; }
  private static detectRecantation(text: string): string { return ""; }
  private static extractPresenceAtScene(text: string): string { return ""; }
  private static extractDefenseStrategies(text: string): string { return ""; }
  private static detectDefendantTestimony(text: string): string { return ""; }
  private static detectAlibiWitness(text: string): string { return ""; }
  private static extractDefenseWitnesses(text: string): string { return ""; }
  private static extractActualPerpetrator(text: string): string { return ""; }
  private static extractEvidenceTypes(text: string): string[] { return []; }
  private static detectCodefendants(text: string): string { return ""; }
  private static extractCodefendantStatement(text: string): string { return ""; }
  private static detectCodefendantTestimony(text: string): string { return ""; }
  private static extractCodefendantRelationship(text: string): string { return ""; }
  private static generateAdditionalInfo(text: string, transcript: Transcript): string {
    return `This form was auto-generated from parole hearing transcript. Review transcript for complete details.`;
  }

  /**
   * Generate form submission data
   */
  static generateFormSubmission(formData: ClientFormData): Record<string, any> {
    return {
      // Personal Info
      first_name: formData.firstName,
      last_name: formData.lastName,
      full_name: formData.fullName,
      cdcr_number: formData.cdcrNumber,
      
      // Contact
      facility: formData.facilityName,
      facility_address: formData.facilityAddress,
      
      // Case Details
      hearing_date: formData.hearingDate,
      conviction: formData.convictionDetails,
      sentence: formData.sentenceLength,
      
      // Innocence
      innocence_claim: formData.hasInnocenceClaim ? "Yes" : "No",
      innocence_statement: formData.innocenceStatement,
      
      // Panel
      commissioners: formData.commissioners.join(", "),
      panel_info: formData.panelComposition,
      
      // Programs
      programs_completed: formData.programsCompleted.join(", "),
      support_info: formData.supportLetters,
      
      // Metadata
      processed_date: new Date().toISOString(),
      data_source: "Parole Hearing Transcript",
    };
  }

  /**
   * Generate PDF-ready data structure
   */
  static generatePDFData(formData: ClientFormData): string {
    const lines = [
      "CLIENT INTAKE FORM",
      "=" .repeat(60),
      "",
      "PERSONAL INFORMATION",
      "-".repeat(60),
      `Full Name: ${formData.fullName}`,
      `CDCR Number: ${formData.cdcrNumber}`,
      `Facility: ${formData.facilityName}`,
      "",
      "CASE INFORMATION",
      "-".repeat(60),
      `Hearing Date: ${formData.hearingDate}`,
      `Conviction: ${formData.convictionDetails}`,
      `Sentence: ${formData.sentenceLength}`,
      "",
      "INNOCENCE CLAIM",
      "-".repeat(60),
      `Has Innocence Claim: ${formData.hasInnocenceClaim ? "YES" : "NO"}`,
      `Statement: ${formData.innocenceStatement}`,
      "",
      "HEARING PANEL",
      "-".repeat(60),
      `Commissioners: ${formData.commissioners.join(", ")}`,
      `Panel Composition: ${formData.panelComposition}`,
      "",
      "REHABILITATION",
      "-".repeat(60),
      `Programs Completed: ${formData.programsCompleted.join(", ") || "None specified"}`,
      `Support: ${formData.supportLetters}`,
      "",
      "=" .repeat(60),
      `Generated: ${new Date().toLocaleString()}`,
      "Source: Parole Hearing Transcript - Auto-processed by JusticeMAP",
    ];
    
    return lines.join("\n");
  }

  /**
   * Validate form data completeness
   */
  static validateFormData(formData: ClientFormData): {
    isComplete: boolean;
    missingFields: string[];
    warnings: string[];
  } {
    const missingFields: string[] = [];
    const warnings: string[] = [];
    
    // Required fields
    if (!formData.fullName || formData.fullName === "Unknown") {
      missingFields.push("Full Name");
    }
    if (!formData.cdcrNumber || formData.cdcrNumber === "Unknown") {
      missingFields.push("CDCR Number");
    }
    
    // Recommended fields
    if (formData.commissioners.length === 0) {
      warnings.push("Commissioner information not found");
    }
    if (!formData.hearingDate || formData.hearingDate === "Unknown") {
      warnings.push("Hearing date not specified");
    }
    if (formData.convictionDetails === "See transcript for details") {
      warnings.push("Conviction details not automatically extracted");
    }
    
    return {
      isComplete: missingFields.length === 0,
      missingFields,
      warnings,
    };
  }
}

