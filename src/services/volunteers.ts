import { supabase } from "@/lib/supabase";
import type { Volunteer } from "@/lib/types";

export const VolunteerService = {
  // Get all volunteers
  async getAllVolunteers(): Promise<Volunteer[]> {
    const { data, error } = await supabase
      .from("volunteers")
      .select("*")
      .eq("active", true)
      .order("full_name");

    if (error) throw error;
    return data || [];
  },

  // Get volunteer by email (for login)
  async getVolunteerByEmail(email: string): Promise<Volunteer | null> {
    const { data, error } = await supabase
      .from("volunteers")
      .select("*")
      .eq("email", email)
      .eq("active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }

    // Update last login
    await supabase
      .from("volunteers")
      .update({ last_login: new Date().toISOString() })
      .eq("id", data.id);

    return data;
  },

  // Assign case to volunteer
  async assignCase(transcriptId: string, volunteerId: string): Promise<void> {
    const now = new Date().toISOString();

    // Update transcript
    const { error: transcriptError } = await supabase
      .from("transcripts")
      .update({
        assigned_to: volunteerId,
        assigned_at: now,
        status: "assigned",
      })
      .eq("id", transcriptId);

    if (transcriptError) throw transcriptError;

    // Create assignment record
    const { error: assignmentError } = await supabase
      .from("case_assignments")
      .insert({
        transcript_id: transcriptId,
        volunteer_id: volunteerId,
        status: "active",
      });

    if (assignmentError) throw assignmentError;
  },

  // Unassign case from volunteer
  async unassignCase(transcriptId: string): Promise<void> {
    const { error } = await supabase
      .from("transcripts")
      .update({
        assigned_to: null,
        assigned_at: null,
        status: "unassigned",
      })
      .eq("id", transcriptId);

    if (error) throw error;

    // Mark assignment as completed/reassigned
    await supabase
      .from("case_assignments")
      .update({ status: "reassigned", completed_at: new Date().toISOString() })
      .eq("transcript_id", transcriptId)
      .eq("status", "active");
  },

  // Get volunteer's assigned cases
  async getVolunteerCases(volunteerId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("transcripts")
      .select("*")
      .eq("assigned_to", volunteerId)
      .order("assigned_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get workload statistics
  async getWorkloadStats(): Promise<any> {
    const { data: volunteers, error: volError } = await supabase
      .from("volunteers")
      .select("id, full_name")
      .eq("active", true);

    if (volError) throw volError;

    const stats = [];

    for (const volunteer of volunteers || []) {
      const { count: assigned } = await supabase
        .from("transcripts")
        .select("*", { count: "exact", head: true })
        .eq("assigned_to", volunteer.id);

      const { count: completed } = await supabase
        .from("transcripts")
        .select("*", { count: "exact", head: true })
        .eq("assigned_to", volunteer.id)
        .eq("status", "completed");

      stats.push({
        volunteer_id: volunteer.id,
        full_name: volunteer.full_name,
        assigned_cases: assigned || 0,
        completed_cases: completed || 0,
      });
    }

    return stats;
  },

  // Update case status
  async updateCaseStatus(
    transcriptId: string,
    status: "unassigned" | "assigned" | "in_review" | "completed" | "flagged"
  ): Promise<void> {
    const { error } = await supabase
      .from("transcripts")
      .update({ status })
      .eq("id", transcriptId);

    if (error) throw error;

    // If completed, mark assignment as completed
    if (status === "completed") {
      await supabase
        .from("case_assignments")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("transcript_id", transcriptId)
        .eq("status", "active");
    }
  },

  // Add case note
  async addCaseNote(
    transcriptId: string,
    volunteerId: string,
    noteText: string,
    noteType: "general" | "innocence_flag" | "bias_detected" | "follow_up"
  ): Promise<void> {
    const { error } = await supabase.from("case_notes").insert({
      transcript_id: transcriptId,
      volunteer_id: volunteerId,
      note_text: noteText,
      note_type: noteType,
    });

    if (error) throw error;
  },

  // Get case notes
  async getCaseNotes(transcriptId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("case_notes")
      .select(`
        *,
        volunteers:volunteer_id (full_name)
      `)
      .eq("transcript_id", transcriptId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

