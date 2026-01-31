/* eslint-disable @typescript-eslint/no-explicit-any */

'use server'

import { getAdminClient } from '@/lib/supabase';

/**
 * Fetches semantic recommendations for the "Crossroads" UI.
 * This is the heart of the "Choose Your Own Adventure" non-linear logic.
 * * @param videoId - The current video the user just finished.
 * @param limit - How many recommendations to return (usually 2 for Related A/B).
 * @returns {Promise<{ success: boolean; recommendations: any[] }>}
 */
export async function getSemanticRecommendations(videoId: string, limit: number = 2) {
  const supabase = getAdminClient();

  try {
    // 1. Get the embedding for the current video
    const { data: currentVideo, error: fetchError } = await supabase
      .from('videos')
      .select('embedding')
      .eq('id', videoId)
      .single();

    if (fetchError || !currentVideo?.embedding) {
      // Fallback: If no embedding exists, we might return random or latest videos
      return { success: false, recommendations: [], message: "No embedding found for current video." };
    }

    // 2. Call the RPC function 'match_videos' for vector similarity search
    // We set a threshold (e.g., 0.5) to ensure we only show reasonably related content
    const { data: relatedVideos, error: matchError } = await supabase.rpc('match_videos', {
      query_embedding: currentVideo.embedding,
      match_threshold: 0.5,
      match_count: limit,
      exclude_id: videoId
    });

    if (matchError) throw matchError;

    // 3. Log the recommendation event for behavioral analytics
    // This helps the Admin see which "Semantic Bridges" the AI is building
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('activity_logs').insert({
        event_type: 'AI_RECOMMENDATION_GENERATED',
        context: 'adventure_engine',
        metadata: {
          source_video_id: videoId,
          recommendation_count: relatedVideos?.length || 0,
          recommendation_ids: relatedVideos?.map((v: any) => v.id)
        }
      });
    }

    return {
      success: true,
      recommendations: relatedVideos || []
    };

  } catch (err: any) {
    console.error('Recommendation Engine Error:', err);
    return { success: false, recommendations: [] };
  }
}

/**
 * Fetches a random video that the user hasn't necessarily watched.
 * Powers "The Unknown Path" button.
 */
export async function getRandomPath(excludeId: string) {
  const supabase = getAdminClient();
  
  try {
    // Simple random selection: Use Postgres random() via a direct query
    // We wrap this in a simple RPC if needed, or just a random offset in JS
    const { data: countData } = await supabase
      .from('videos')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true)
      .neq('id', excludeId);

    const total = countData?.length || 0;
    if (total === 0) return null;

    const randomOffset = Math.floor(Math.random() * total);

    const { data: randomVideo } = await supabase
      .from('videos')
      .select('id, title, description')
      .eq('is_published', true)
      .neq('id', excludeId)
      .range(randomOffset, randomOffset)
      .single();

    return randomVideo;
  } catch (err) {
    console.error('Random Path Error:', err);
    return null;
  }
}