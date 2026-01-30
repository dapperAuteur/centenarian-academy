/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Video, 
  Activity, 
  ShieldAlert, 
  Zap, 
  RefreshCw, 
  Search,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
// Using relative paths to ensure resolution across different environments
import { supabase } from '../../lib/supabase';
import { bulkProcessEmbeddings } from '../../app/actions/embeddings';

/**
 * The Admin Command Center is the management hub for the Academy.
 * It allows the administrator to monitor system health, manage AI indexing,
 * and oversee student progress and permissions.
 */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content'>('overview');
  const [stats, setStats] = useState({ users: 0, videos: 0, pendingEmbeddings: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        // 1. Fetch counts for the overview stats
        const [userCount, videoCount, embeddingCount, logData] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('videos').select('*', { count: 'exact', head: true }),
          supabase.from('videos').select('*', { count: 'exact', head: true }).is('embedding', null),
          supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(10)
        ]);

        setStats({
          users: userCount.count || 0,
          videos: videoCount.count || 0,
          pendingEmbeddings: embeddingCount.count || 0
        });
        setLogs(logData.data || []);
      } catch (err) {
        console.error("Admin data fetch failed:", err);
      }
    }

    fetchAdminData();
  }, []);

  const handleBulkAI = async () => {
    setIsProcessing(true);
    try {
      const result = await bulkProcessEmbeddings();
      console.log(result.message);
      
      // Refresh pending stats after processing
      const { count } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .is('embedding', null);
        
      setStats(prev => ({ ...prev, pendingEmbeddings: count || 0 }));
    } catch (err) {
      console.error(`AI Processing failed. Error ${err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-10 font-sans">
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-500 font-black text-xs tracking-[0.3em] uppercase mb-2">
            <ShieldAlert size={14} />
            <span>Root Administrator</span>
          </div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Command Center</h1>
        </div>

        <nav className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          {(['overview', 'users', 'content'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
              <Users className="absolute -right-2 -bottom-2 text-slate-800 w-24 h-24 rotate-12 transition-transform group-hover:rotate-0" />
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Athletes</p>
              <h3 className="text-4xl font-black text-white">{stats.users}</h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
              <Video className="absolute -right-2 -bottom-2 text-slate-800 w-24 h-24 rotate-12 transition-transform group-hover:rotate-0" />
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Video Nodes</p>
              <h3 className="text-4xl font-black text-white">{stats.videos}</h3>
            </div>
            <div className="bg-slate-900 border border-emerald-500/20 p-6 rounded-3xl relative overflow-hidden group">
              <Zap className="absolute -right-2 -bottom-2 text-emerald-500/10 w-24 h-24 rotate-12 transition-transform group-hover:rotate-0" />
              <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest mb-1">AI Ready</p>
              <h3 className="text-4xl font-black text-white">
                {stats.videos - stats.pendingEmbeddings}/{stats.videos}
              </h3>
            </div>
          </div>

          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Adventure Intelligence</h2>
                <p className="text-slate-500 text-sm">Manage semantic embeddings for the Choose Your Own Adventure engine.</p>
              </div>
              <button 
                onClick={handleBulkAI}
                disabled={isProcessing || stats.pendingEmbeddings === 0}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                  isProcessing 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                }`}
              >
                {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                <span>{isProcessing ? 'Indexing...' : 'Bulk Index Curriculum'}</span>
              </button>
            </div>

            {stats.pendingEmbeddings > 0 ? (
              <div className="flex items-center space-x-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500">
                <ShieldAlert size={20} />
                <p className="text-sm font-bold">
                  Attention: {stats.pendingEmbeddings} video(s) are currently &quot;Blind&quot; to the AI engine. Recommendation accuracy is limited.
                </p>
              </div>
            ) : (
              <div className="flex items-center space-x-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500">
                <CheckCircle size={20} />
                <p className="text-sm font-bold">The Adventure Engine is fully optimized. All transcripts indexed.</p>
              </div>
            )}
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Activity className="text-emerald-500" size={18} />
                Live Telemetry
              </h2>
              <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
                View Full Logs
              </button>
            </div>
            <div className="divide-y divide-slate-800">
              {logs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      log.event_type?.includes('ERROR') || log.event_type?.includes('FAILURE') ? 'bg-red-500' : 'bg-emerald-500'
                    }`} />
                    <div>
                      <p className="text-sm font-bold text-slate-200 tracking-tight">{log.event_type}</p>
                      <p className="text-[10px] text-slate-500 font-mono uppercase">{log.context}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Search className="text-emerald-500" size={14} />
              Athlete Lookup
            </h2>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="User ID or Email..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-center">
                <p className="text-xs text-slate-600 italic">Enter a user identifier to manage permissions or view study trails.</p>
              </div>
            </div>
          </section>

          <section className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6">
            <BarChart3 className="text-emerald-500 mb-4" size={24} />
            <h3 className="font-bold text-emerald-100 text-sm mb-2">Academy Health</h3>
            <p className="text-xs text-emerald-500/60 leading-relaxed mb-4">
              The Adventure Engine is processing requests with optimized latency.
            </p>
            <div className="h-1.5 w-full bg-emerald-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[98%]" />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}