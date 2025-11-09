import { supabase } from '@/lib/supabase';

/**
 * Utility to fix malformed names in existing transcripts
 * Fixes patterns like "M ICHAEL" -> "MICHAEL", "W ARDELL" -> "WARDELL"
 */

function fixMalformedName(name: string | null): string | null {
  if (!name) return null;
  
  // Fix pattern where single letter is followed by space then more letters
  // Match: single uppercase letter + space + uppercase letter(s)
  // Replace: merge them together
  let fixed = name.replace(/\b([A-Z])\s+([A-Z][a-z]*)/g, '$1$2');
  
  // Also handle all-caps names like "M ICHAEL NICHELINI" -> "MICHAEL NICHELINI"
  fixed = fixed.replace(/\b([A-Z])\s+([A-Z]+)/g, '$1$2');
  
  // Handle multiple spaces
  fixed = fixed.replace(/\s+/g, ' ').trim();
  
  return fixed;
}

export async function fixAllTranscriptNames() {
  try {
    console.log('🔍 Fetching all transcripts...');
    
    // Get all transcripts
    const { data: transcripts, error: fetchError } = await supabase
      .from('transcripts')
      .select('id, inmate_name');
    
    if (fetchError) {
      console.error('❌ Error fetching transcripts:', fetchError);
      return { success: false, error: fetchError.message };
    }
    
    if (!transcripts || transcripts.length === 0) {
      console.log('ℹ️  No transcripts found');
      return { success: true, updated: 0 };
    }
    
    console.log(`📋 Found ${transcripts.length} transcripts`);
    
    let updatedCount = 0;
    const updates: Array<{ id: string; oldName: string; newName: string }> = [];
    
    // Process each transcript
    for (const transcript of transcripts) {
      if (transcript.inmate_name) {
        const fixedName = fixMalformedName(transcript.inmate_name);
        
        if (fixedName && fixedName !== transcript.inmate_name) {
          // Name was changed, update it
          const { error: updateError } = await supabase
            .from('transcripts')
            .update({ inmate_name: fixedName })
            .eq('id', transcript.id);
          
          if (updateError) {
            console.error(`❌ Error updating transcript ${transcript.id}:`, updateError);
          } else {
            updatedCount++;
            updates.push({
              id: transcript.id,
              oldName: transcript.inmate_name,
              newName: fixedName
            });
            console.log(`✅ Fixed: "${transcript.inmate_name}" -> "${fixedName}"`);
          }
        }
      }
    }
    
    console.log(`\n🎉 Complete! Updated ${updatedCount} names`);
    
    if (updates.length > 0) {
      console.log('\n📝 Summary of changes:');
      updates.forEach(update => {
        console.log(`  - "${update.oldName}" → "${update.newName}"`);
      });
    }
    
    return { 
      success: true, 
      updated: updatedCount,
      changes: updates
    };
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Export for use in console or as a utility
if (typeof window !== 'undefined') {
  (window as any).fixAllTranscriptNames = fixAllTranscriptNames;
  console.log('💡 To fix all transcript names, run: fixAllTranscriptNames()');
}

