/** File Path: ./centenarian-academy/components/features/TranscriptReader.tsx */
'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { Search, FileText, Download, Loader2, Zap } from 'lucide-react';
// Updated to use absolute alias for reliable resolution in the Next.js environment
import { supabase } from '@/lib/supabase';

interface TranscriptReaderProps {
  videoId: string;
  currentTime?: number;
  onSeek?: (time: number) => void;
}

interface TranscriptLine {
  text: string;
  startTime: number;
}

/**
 * The Transcript Reader provides a searchable, interactive text version of the video.
 * It allows students to jump to specific points in the curriculum by clicking the text
 * and provides access to downloadable study assets.
 */
export default function TranscriptReader({ videoId, currentTime = 0, onSeek }: TranscriptReaderProps) {
  const [transcript, setTranscript] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchTranscript() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('transcript_text')
          .eq('id', videoId)
          .single();

        if (!error && data) {
          setTranscript(data.transcript_text);
        }
      } catch (err) {
        console.error("Transcript Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTranscript();
  }, [videoId]);

  /**
   * Parses the transcript text for [MM:SS] timestamps.
   * Expects format: "[01:23] This is the text content."
   */
  const lines = useMemo((): TranscriptLine[] => {
    if (!transcript) return [];
    
    const regex = /\[(\d+):(\d+)\]\s*([^[]+)/g;
    const result: TranscriptLine[] = [];
    let match;

    while ((match = regex.exec(transcript)) !== null) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      result.push({
        startTime: minutes * 60 + seconds,
        text: match[3].trim()
      });
    }

    // Fallback if no timestamps are found: split into one block
    return result.length > 0 ? result : [{ startTime: 0, text: transcript }];
  }, [transcript]);

  const filteredLines = useMemo(() => {
    if (!searchQuery) return lines;
    return lines.filter(line => 
      line.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [lines, searchQuery]);

  // Telemetry handler for asset downloads
  const handleDownload = async (type: 'transcript' | 'guide') => {
    await supabase.from('activity_logs').insert({
      event_type: 'STUDY_ASSET_DOWNLOAD',
      context: 'transcript_reader',
      metadata: { video_id: videoId, asset_type: type }
    });
    // Implementation for actual file download would go here
  };

  if (loading) {
    return (
      <div className="h-125 flex flex-col items-center justify-center bg-slate-800/20 rounded-3xl border border-slate-700/50 p-8">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Hydrating Transcript...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header & Tool Bar */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm tracking-tight">Athlete Logbook</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Interactive Study Node</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleDownload('transcript')}
              className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
              title="Download Transcript PDF"
            >
              <Download size={18} />
            </button>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={16} />
          <input 
            type="text"
            placeholder="Search within this lecture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Interactive Text Body */}
      <div className="grow overflow-y-auto p-6 space-y-2 custom-scrollbar scroll-smooth">
        {filteredLines.length > 0 ? (
          filteredLines.map((line, idx) => {
            // Check if this line is currently playing
            const isActive = currentTime >= line.startTime && 
                             (idx === lines.length - 1 || currentTime < (lines[idx + 1]?.startTime ?? Infinity));

            return (
              <div 
                key={idx}
                onClick={() => onSeek?.(line.startTime)}
                className={`group cursor-pointer p-3 rounded-xl transition-all border border-transparent ${
                  isActive 
                    ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' 
                    : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <span className={`text-[10px] font-black mt-1.5 tabular-nums min-w-8.75 ${isActive ? 'text-emerald-500' : 'text-slate-600'}`}>
                    {Math.floor(line.startTime / 60).toString().padStart(2, '0')}:
                    {(line.startTime % 60).toString().padStart(2, '0')}
                  </span>
                  <p className={`text-sm leading-relaxed transition-colors ${
                    isActive ? 'text-white font-medium' : 'text-slate-400 group-hover:text-slate-200'
                  }`}>
                    {/* Highlight search terms if needed */}
                    {line.text}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="text-slate-800 w-12 h-12 mb-4" />
            <p className="text-slate-500 text-sm italic">No curriculum matches found for &quot;{searchQuery}&quot;</p>
          </div>
        )}
      </div>

      {/* Footer / Status */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-600 tracking-widest uppercase">
            <Zap size={12} className="text-emerald-500" />
            <span>Synced with Centenarian Engine</span>
          </div>
          <span className="text-[10px] text-slate-700 font-bold uppercase">Click text to seek</span>
        </div>
      </div>
    </div>
  );
}