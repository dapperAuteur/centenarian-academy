'use client'

import React, { useState, useEffect, useRef } from 'react';
// Fixed the import path to use a relative reference to ensure resolution
import { getAuthorizedVideoUrl } from '../../app/actions/video';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  onEnded: () => void;
  onProgress?: (progress: number) => void;
}

/**
 * The Video Player Shell handles the secure delivery of premium fitness content.
 * It integrates with the Cloudinary signed URL server action and monitors
 * playback events to trigger the non-linear "Crossroads" navigation.
 */
export default function VideoPlayer({ videoId, onEnded, onProgress }: VideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch the authorized signed URL whenever the videoId changes
  useEffect(() => {
    async function fetchUrl() {
      setLoading(true);
      setError(null);
      try {
        const result = await getAuthorizedVideoUrl(videoId);
        if (result.success && result.url) {
          setVideoUrl(result.url);
        } else {
          setError(result.message || "Failed to load curriculum video.");
        }
      } catch (err) {
        setError("Connection to the academy lost. Please refresh.");
      } finally {
        setLoading(false);
      }
    }

    fetchUrl();
  }, [videoId]);

  const handleTimeUpdate = () => {
    if (videoRef.current && onProgress) {
      // Calculate progress percentage for the Logbook/Telemetry
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      onProgress(progress);
    }
  };

  // State: Loading the curriculum node
  if (loading) {
    return (
      <div className="aspect-video w-full bg-slate-800/50 flex flex-col items-center justify-center rounded-3xl border border-slate-700/50 animate-pulse">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">
          Verifying Credentials...
        </p>
      </div>
    );
  }

  // State: Permission Denied or Error
  if (error) {
    return (
      <div className="aspect-video w-full bg-slate-800 flex flex-col items-center justify-center rounded-3xl border border-red-500/20 p-8 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <Lock className="text-red-500 w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Athletic Access Restricted</h3>
        <p className="text-slate-400 mb-8 max-w-md leading-relaxed">
          {error}
        </p>
        <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
          Unlock the Full Journey for $100
        </button>
      </div>
    );
  }

  return (
    <div className="group relative aspect-video w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 ring-1 ring-white/5">
      {/* Main Content Node (The Video) */}
      <video
        ref={videoRef}
        src={videoUrl!}
        className="w-full h-full cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onEnded={onEnded}
        controlsList="nodownload"
        autoPlay
        playsInline
        controls
      />
      
      {/* Centenarian Academy Branding Overlay */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none transition-all duration-500 opacity-100 group-hover:opacity-40">
        <div className="flex items-center space-x-2 bg-slate-900/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">
            Encrypted Athlete Stream
          </span>
        </div>
      </div>

      {/* Progress gradient hint */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
        <div 
          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-300" 
          style={{ width: `${videoRef.current ? (videoRef.current.currentTime / videoRef.current.duration) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}