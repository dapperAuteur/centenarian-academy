/** File Path: ./centenarian-academy/app/actions/video.ts */
'use server'

import { getAdminClient } from '@/lib/supabase';
import { getSignedVideoUrl } from '@/lib/cloudinary';

/**
 * Server Action to provide an authorized, time-limited video URL.
 * * @param videoId - The UUID of the video from the Supabase 'videos' table.
 * @returns {Promise<{ success: boolean; url?: string; message?: string }>}
 */
export async function getAuthorizedVideoUrl(videoId: string) {
  const supabase = getAdminClient();
  
  try {
    // 1. Identify the user from the current session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // We don't throw immediately if !user, because 'Chapter Openers' are public.
    const userId = user?.id;

    // 2. Perform the hierarchical access check via the database RPC.
    // This function handles: IsOpener? -> IsGlobalPaid? -> SectionAccess? -> ChapterAccess? -> VideoAccess?
    const { data: hasAccess, error: accessError } = await supabase.rpc('check_resource_access', {
      u_id: userId || null, // Pass null for unauthenticated users
      v_id: videoId
    });

    if (accessError) {
      console.error('Database Permission Error:', accessError);
      return { success: false, message: "Error verifying access permissions." };
    }

    if (!hasAccess) {
      return { success: false, message: "Access Denied: This content requires a premium membership." };
    }

    // 3. Fetch the Cloudinary Public ID for the authorized video
    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .select('cloudinary_public_id')
      .eq('id', videoId)
      .single();

    if (videoError || !videoData) {
      return { success: false, message: "Content not found." };
    }

    // 4. Generate the signed, time-limited URL (expires in 1 hour)
    const signedUrl = await getSignedVideoUrl(videoData.cloudinary_public_id);

    return { 
      success: true, 
      url: signedUrl 
    };

  } catch (err) {
    console.error('Secure Video Action Failure:', err);
    return { success: false, message: "An unexpected error occurred." };
  }
}