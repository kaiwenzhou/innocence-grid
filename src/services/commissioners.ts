import { supabase } from "@/lib/supabase";
import { Commissioner, CommissionerWithStats, CommissionerStatistics } from "@/lib/types";

/**
 * Commissioner Service
 * Manages commissioner data from the California Board of Parole Hearings
 */
export class CommissionerService {
  /**
   * Get all commissioners
   */
  static async getAllCommissioners(): Promise<Commissioner[]> {
    const { data, error } = await supabase
      .from("commissioners")
      .select("*")
      .order("full_name");

    if (error) {
      console.error("Error fetching commissioners:", error);
      throw new Error(`Failed to fetch commissioners: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get active commissioners only
   */
  static async getActiveCommissioners(): Promise<Commissioner[]> {
    const { data, error } = await supabase
      .from("commissioners")
      .select("*")
      .eq("active", true)
      .order("full_name");

    if (error) {
      console.error("Error fetching active commissioners:", error);
      throw new Error(`Failed to fetch active commissioners: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get commissioner by ID
   */
  static async getCommissionerById(id: string): Promise<Commissioner | null> {
    const { data, error } = await supabase
      .from("commissioners")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching commissioner:", error);
      throw new Error(`Failed to fetch commissioner: ${error.message}`);
    }

    return data;
  }

  /**
   * Get commissioner by name
   */
  static async getCommissionerByName(name: string): Promise<Commissioner | null> {
    const { data, error } = await supabase
      .from("commissioners")
      .select("*")
      .ilike("full_name", name)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        return null;
      }
      console.error("Error fetching commissioner by name:", error);
      throw new Error(`Failed to fetch commissioner: ${error.message}`);
    }

    return data;
  }

  /**
   * Get commissioners with statistics
   */
  static async getCommissionersWithStats(): Promise<CommissionerWithStats[]> {
    const { data, error } = await supabase
      .from("commissioners")
      .select(`
        *,
        statistics:commissioner_statistics(*)
      `)
      .order("full_name");

    if (error) {
      console.error("Error fetching commissioners with stats:", error);
      throw new Error(`Failed to fetch commissioners with stats: ${error.message}`);
    }

    return (data || []).map((commissioner: any) => ({
      ...commissioner,
      statistics: commissioner.statistics?.[0] || null,
    }));
  }

  /**
   * Update commissioner data
   */
  static async updateCommissioner(
    id: string,
    updates: Partial<Commissioner>
  ): Promise<Commissioner> {
    const { data, error } = await supabase
      .from("commissioners")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating commissioner:", error);
      throw new Error(`Failed to update commissioner: ${error.message}`);
    }

    return data;
  }

  /**
   * Create new commissioner
   */
  static async createCommissioner(
    commissioner: Partial<Commissioner>
  ): Promise<Commissioner> {
    const { data, error } = await supabase
      .from("commissioners")
      .insert([commissioner])
      .select()
      .single();

    if (error) {
      console.error("Error creating commissioner:", error);
      throw new Error(`Failed to create commissioner: ${error.message}`);
    }

    return data;
  }

  /**
   * Mark last scraped timestamp
   */
  static async markScraped(id: string): Promise<void> {
    const { error } = await supabase
      .from("commissioners")
      .update({
        last_scraped_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error marking commissioner as scraped:", error);
      throw new Error(`Failed to update scrape timestamp: ${error.message}`);
    }
  }

  /**
   * Get commissioners needing data refresh (not scraped in last 30 days)
   */
  static async getCommissionersNeedingRefresh(): Promise<Commissioner[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from("commissioners")
      .select("*")
      .or(`last_scraped_at.is.null,last_scraped_at.lt.${thirtyDaysAgo.toISOString()}`)
      .order("last_scraped_at", { ascending: true, nullsFirst: true });

    if (error) {
      console.error("Error fetching commissioners needing refresh:", error);
      throw new Error(`Failed to fetch commissioners needing refresh: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get commissioner statistics
   */
  static async getCommissionerStatistics(
    commissionerId: string
  ): Promise<CommissionerStatistics | null> {
    const { data, error } = await supabase
      .from("commissioner_statistics")
      .select("*")
      .eq("commissioner_id", commissionerId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching commissioner statistics:", error);
      throw new Error(`Failed to fetch statistics: ${error.message}`);
    }

    return data;
  }

  /**
   * Calculate and update statistics for a commissioner
   */
  static async calculateStatistics(commissionerId: string): Promise<CommissionerStatistics> {
    // Get all hearings for this commissioner
    const { data: hearings, error: hearingsError } = await supabase
      .from("commissioner_hearings")
      .select("*")
      .eq("commissioner_id", commissionerId);

    if (hearingsError) {
      throw new Error(`Failed to fetch hearings: ${hearingsError.message}`);
    }

    const totalHearings = hearings?.length || 0;
    const totalGrants = hearings?.filter(h => h.hearing_outcome === "grant").length || 0;
    const totalDenials = hearings?.filter(h => h.hearing_outcome === "denial").length || 0;
    const grantRate = totalHearings > 0 ? (totalGrants / totalHearings) * 100 : 0;

    const stats = {
      commissioner_id: commissionerId,
      total_hearings: totalHearings,
      total_grants: totalGrants,
      total_denials: totalDenials,
      grant_rate: parseFloat(grantRate.toFixed(2)),
      innocence_claims_reviewed: 0, // To be calculated based on transcript analysis
      high_bias_cases: 0, // To be calculated based on bias indicators
      last_calculated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Upsert statistics
    const { data, error } = await supabase
      .from("commissioner_statistics")
      .upsert([stats], { onConflict: "commissioner_id" })
      .select()
      .single();

    if (error) {
      console.error("Error updating statistics:", error);
      throw new Error(`Failed to update statistics: ${error.message}`);
    }

    return data;
  }

  /**
   * Link a commissioner to a transcript/hearing
   */
  static async linkCommissionerToHearing(
    commissionerId: string,
    transcriptId: string,
    hearingDetails: {
      hearing_date?: string | null;
      hearing_type?: "parole_suitability" | "youth_offender" | "elderly" | "medical";
      hearing_outcome?: string | null;
      decision_rationale?: string | null;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from("commissioner_hearings")
      .upsert([
        {
          commissioner_id: commissionerId,
          transcript_id: transcriptId,
          ...hearingDetails,
        },
      ], { onConflict: "commissioner_id,transcript_id" });

    if (error) {
      console.error("Error linking commissioner to hearing:", error);
      throw new Error(`Failed to link commissioner to hearing: ${error.message}`);
    }

    // Recalculate statistics
    await this.calculateStatistics(commissionerId);
  }

  /**
   * Find commissioners by name in transcript text
   * Useful for automatically linking commissioners to transcripts
   */
  static async findCommissionersInText(text: string): Promise<Commissioner[]> {
    const allCommissioners = await this.getActiveCommissioners();
    const foundCommissioners: Commissioner[] = [];

    for (const commissioner of allCommissioners) {
      const names = [
        commissioner.full_name,
        commissioner.last_name,
        `Commissioner ${commissioner.last_name}`,
        `COMMISSIONER ${commissioner.last_name?.toUpperCase()}`,
      ].filter(Boolean);

      for (const name of names) {
        if (name && text.includes(name)) {
          foundCommissioners.push(commissioner);
          break;
        }
      }
    }

    return foundCommissioners;
  }
}

