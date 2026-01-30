/* eslint-disable @typescript-eslint/no-explicit-any */
/** File Path: ./centenarian-academy/app/actions/embeddings.ts */
'use server'

import { getAdminClient } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/gemini';

/**
 * Server Action to generate and store a transcript embedding for a specific video.
 * This powers the semantic "Choose Your Own Adventure" recommendation engine.
 * * @param videoId - The UUID of the video to process.
 * @returns {Promise<{ success: boolean; message: string }>}
 */
export async function processVideoEmbedding(videoId: string) {
  const supabase = getAdminClient();

  try {
    // 1. Fetch the transcript text for the video
    const { data: video, error: fetchError } = await supabase
      .from('videos')
      .select('title, transcript_text')
      .eq('id', videoId)
      .single();

    if (fetchError || !video) {
      return { success: false, message: "Video or transcript not found." };
    }

    if (!video.transcript_text) {
      return { success: false, message: "Video has no transcript to process." };
    }

    // 2. Log the start of the AI process (Telemetry)
    await supabase.from('activity_logs').insert({
      event_type: 'AI_EMBEDDING_START',
      context: 'gemini_pipeline',
      metadata: { video_id: videoId, video_title: video.title }
    });

    // 3. Generate the 1536-dimension embedding using Gemini
    // We combine title and transcript for better contextual richness
    const contentToEmbed = `Title: ${video.title}\n\nContent: ${video.transcript_text}`;
    const embedding = await generateEmbedding(contentToEmbed);

    // 4. Save the vector back to the Supabase 'videos' table
    const { error: updateError } = await supabase
      .from('videos')
      .update({ embedding: embedding })
      .eq('id', videoId);

    if (updateError) {
      throw updateError;
    }

    // 5. Finalize telemetry
    await supabase.from('activity_logs').insert({
      event_type: 'AI_EMBEDDING_SUCCESS',
      context: 'gemini_pipeline',
      metadata: { video_id: videoId, dimension: embedding.length }
    });

    return { 
      success: true, 
      message: `Successfully generated embedding for: ${video.title}` 
    };

  } catch (err: any) {
    console.error('Embedding Pipeline Failure:', err);
    
    // Log the failure for Admin review
    await supabase.from('activity_logs').insert({
      event_type: 'AI_EMBEDDING_FAILURE',
      context: 'gemini_pipeline',
      metadata: { video_id: videoId, error: err.message }
    });

    return { success: false, message: `Failed to process embedding: ${err.message}` };
  }
}