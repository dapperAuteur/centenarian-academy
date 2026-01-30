'use server'

import { getAdminClient } from '@/lib/supabase';
import { getSignedVideoUrl } from '@/lib/cloudinary';
import { cookies } from 'next/headers';

export async function getAuthorizedVideoUrl(videoId: string) {
  const supabase = getAdminClient();
  
  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // 2. Call the Database RPC function to check permissions
  // This matches the hierarchical check (Global > Section > Chapter > Video)
  const { data: hasAccess, error } = await supabase.rpc('check_resource_access', {
    u_id: user.id,
    v_id: videoId
  });

  if (error || !hasAccess) throw new Error("Access Denied: Payment Required");

  // 3. Fetch Cloudinary Public ID
  const { data: video } = await supabase
    .from('videos')
    .select('cloudinary_public_id')
    .eq('id', videoId)
    .single();

  if (!video) throw new Error("Video not found");

  // 4. Return the time-limited signed URL
  return await getSignedVideoUrl(video.cloudinary_public_id);
}