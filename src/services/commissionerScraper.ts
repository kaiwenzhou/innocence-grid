/**
 * Commissioner Web Scraper
 * 
 * This service scrapes commissioner data from the California Board of Parole Hearings website
 * https://www.cdcr.ca.gov/bph/commissioners/
 * 
 * IMPORTANT: Web scraping requires a backend service due to CORS restrictions.
 * This file provides the structure. You'll need to either:
 * 1. Use a backend proxy service
 * 2. Use a serverless function (Vercel, Netlify, etc.)
 * 3. Manual data entry with periodic updates
 */

import { Commissioner } from "@/lib/types";
import { CommissionerService } from "./commissioners";

export interface ScrapedCommissionerData {
  full_name: string;
  profile_url?: string;
  photo_url?: string;
  biography?: string;
  appointment_date?: string;
  previous_roles?: Array<{
    title: string;
    organization: string;
    description?: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
  }>;
}

/**
 * Commissioner Scraper Service
 */
export class CommissionerScraperService {
  private static readonly BASE_URL = "https://www.cdcr.ca.gov/bph";
  private static readonly COMMISSIONERS_URL = `${this.BASE_URL}/commissioners/`;

  /**
   * Scrape the main commissioners page
   * NOTE: This is a placeholder. Real implementation needs backend/proxy
   */
  static async scrapeCommissionersPage(): Promise<ScrapedCommissionerData[]> {
    console.warn(
      "Direct web scraping from browser is blocked by CORS. " +
      "Use a backend service or manual data entry."
    );

    // Placeholder return with known commissioners
    return this.getKnownCommissioners();
  }

  /**
   * Get list of known commissioners from the website (manual data entry)
   * This can be updated periodically
   */
  static getKnownCommissioners(): ScrapedCommissionerData[] {
    return [
      {
        full_name: "Robert Barton",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "Patricia Cassady",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "Kevin Chappell",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "Dianne Dobbs",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "Julie Garland",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "Gilbert Infante",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "Teal Kozel",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "David Long",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "Michele Minor",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "William Muniz",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "David Ndudim",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "Kathleen O'Meara",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "Catherine Purcell",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "Michael Ruff",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "Rosalind Sargent-Burns",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "Neil Schneider",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "Excel Sharrieff",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "Emily Sheffield",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "Troy Taira",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "Mary Thornton",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
      {
        full_name: "Jack Weiss",
        profile_url: `${this.COMMISSIONERS_URL}`,
      },
    ];
  }

  /**
   * Update database with scraped commissioner data
   */
  static async updateCommissionersInDatabase(): Promise<{
    updated: number;
    created: number;
    errors: string[];
  }> {
    const scrapedData = this.getKnownCommissioners();
    const results = {
      updated: 0,
      created: 0,
      errors: [] as string[],
    };

    for (const data of scrapedData) {
      try {
        // Check if commissioner exists
        const existing = await CommissionerService.getCommissionerByName(
          data.full_name
        );

        if (existing) {
          // Update existing
          await CommissionerService.updateCommissioner(existing.id, {
            profile_url: data.profile_url,
            photo_url: data.photo_url,
            biography: data.biography,
            previous_roles: data.previous_roles || [],
            education: data.education || [],
            last_scraped_at: new Date().toISOString(),
          });
          results.updated++;
        } else {
          // Create new
          const nameParts = data.full_name.split(" ");
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(" ");

          await CommissionerService.createCommissioner({
            full_name: data.full_name,
            first_name: firstName,
            last_name: lastName,
            profile_url: data.profile_url,
            photo_url: data.photo_url,
            biography: data.biography,
            previous_roles: data.previous_roles || [],
            education: data.education || [],
            active: true,
            last_scraped_at: new Date().toISOString(),
          });
          results.created++;
        }
      } catch (error) {
        const errorMsg = `Failed to process ${data.full_name}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    return results;
  }

  /**
   * Manually add commissioner data
   * Use this function to add detailed commissioner information
   */
  static async addCommissionerManually(
    commissionerData: Partial<Commissioner>
  ): Promise<Commissioner> {
    const existing = await CommissionerService.getCommissionerByName(
      commissionerData.full_name || ""
    );

    if (existing) {
      return await CommissionerService.updateCommissioner(existing.id, {
        ...commissionerData,
        last_scraped_at: new Date().toISOString(),
      });
    } else {
      return await CommissionerService.createCommissioner({
        ...commissionerData,
        active: true,
        last_scraped_at: new Date().toISOString(),
      });
    }
  }

  /**
   * Extract commissioner names from transcript text
   * and automatically link them
   */
  static async linkCommissionersFromTranscript(
    transcriptId: string,
    transcriptText: string
  ): Promise<string[]> {
    const commissioners = await CommissionerService.findCommissionersInText(
      transcriptText
    );

    const linkedCommissionerIds: string[] = [];

    for (const commissioner of commissioners) {
      try {
        await CommissionerService.linkCommissionerToHearing(
          commissioner.id,
          transcriptId,
          {
            hearing_type: "parole_suitability", // Default, can be refined
          }
        );
        linkedCommissionerIds.push(commissioner.id);
      } catch (error) {
        console.error(
          `Failed to link commissioner ${commissioner.full_name}:`,
          error
        );
      }
    }

    return linkedCommissionerIds;
  }
}

/**
 * USAGE EXAMPLES:
 * 
 * // Update commissioners from known list
 * const results = await CommissionerScraperService.updateCommissionersInDatabase();
 * console.log(`Updated: ${results.updated}, Created: ${results.created}`);
 * 
 * // Manually add detailed commissioner info
 * await CommissionerScraperService.addCommissionerManually({
 *   full_name: "Robert Barton",
 *   biography: "Commissioner Barton has extensive experience in...",
 *   previous_roles: [
 *     { title: "Deputy District Attorney", organization: "Los Angeles County" }
 *   ],
 *   education: [
 *     { degree: "J.D.", institution: "USC Gould School of Law" }
 *   ]
 * });
 * 
 * // Auto-link commissioners when processing a transcript
 * const linkedIds = await CommissionerScraperService.linkCommissionersFromTranscript(
 *   transcriptId,
 *   transcriptText
 * );
 */

