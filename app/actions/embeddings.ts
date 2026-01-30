/* eslint-disable @typescript-eslint/no-explicit-any */
/** File Path: ./centenarian-academy/app/actions/embeddings.ts */
'use server'

import { getAdminClient } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/gemini';

/**
 * Server Action to generate and store a transcript embedding for a specific video.
 * This serves as the "Manual Trigger" for a single video.
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
    const contentToEmbed = `Title: ${video.title}\n\nContent: ${video.transcript_text}`;
    const embedding = await generateEmbedding(contentToEmbed);

    // 4. Save the vector back to the Supabase 'videos' table
    const { error: updateError } = await supabase
      .from('videos')
      .update({ embedding: embedding })
      .eq('id', videoId);

    if (updateError) throw updateError;

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
    
    await supabase.from('activity_logs').insert({
      event_type: 'AI_EMBEDDING_FAILURE',
      context: 'gemini_pipeline',
      metadata: { video_id: videoId, error: err.message }
    });

    return { success: false, message: `Failed to process embedding: ${err.message}` };
  }
}

/**
 * Server Action for Bulk Processing.
 * Finds all published videos that are missing embeddings and processes them.
 * * @returns {Promise<{ success: boolean; processedCount: number; message: string }>}
 */
export async function bulkProcessEmbeddings() {
  const supabase = getAdminClient();
  
  try {
    // 1. Find videos missing embeddings
    const { data: videos, error } = await supabase
      .from('videos')
      .select('id')
      .is('embedding', null)
      .eq('is_published', true);

    if (error) throw error;
    if (!videos || videos.length === 0) {
      return { success: true, processedCount: 0, message: "All videos are already indexed." };
    }

    let successCount = 0;
    
    // 2. Process in sequence (to avoid rate limits and manage logs clearly)
    for (const video of videos) {
      const result = await processVideoEmbedding(video.id);
      if (result.success) successCount++;
    }

    return {
      success: true,
      processedCount: successCount,
      message: `Successfully indexed ${successCount} of ${videos.length} videos.`
    };

  } catch (err: any) {
    console.error('Bulk Processing Failure:', err);
    return { success: false, processedCount: 0, message: `Bulk error: ${err.message}` };
  }
}