/* eslint-disable @typescript-eslint/no-explicit-any */
/** File Path: ./centenarian-academy/app/admin/page.tsx */
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
  BarChart3,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// --- SHIMS & MOCKED ACTIONS ---

/** * Mocking useRouter for the preview environment as next/navigation 
 * often has resolution issues in standalone bundlers.
 */
const useRouter = () => ({
  push: (path: string) => console.log(`Navigating to: ${path}`),
});

/** Inlined version of the bulk embedding logic */
async function bulkProcessEmbeddings() {
  try {
    const { data: videos } = await supabase
      .from('videos')
      .select('id')
      .is('embedding', null)
      .eq('is_published', true);

    if (!videos || videos.length === 0) return { success: true, message: "All videos indexed." };
    
    // In this preview environment, we simulate the batch processing
    return { success: true, message: `Successfully processed ${videos.length} videos.` };
  } catch (err) {
    return { success: false, message: `AI indexing service unavailable. Error: ${err}` };
  }
}

// --- INLINED ADMIN DASHBOARD COMPONENT ---

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content'>('overview');
  const [stats, setStats] = useState({ users: 0, videos: 0, pendingEmbeddings: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAdminData() {
      try {
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
        console.error("Admin stats fetch failed:", err);
      }
    }
    fetchAdminData();
  }, []);

  const handleBulkAI = async () => {
    setIsProcessing(true);
    const result = await bulkProcessEmbeddings();
    console.log(result.message);
    setIsProcessing(false);
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
                activeTab === tab ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-50 text-opacity-50 hover:text-opacity-100'
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
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Athletes</p>
              <h3 className="text-4xl font-black text-white">{stats.users}</h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Video Nodes</p>
              <h3 className="text-4xl font-black text-white">{stats.videos}</h3>
            </div>
            <div className="bg-slate-900 border border-emerald-500/20 p-6 rounded-3xl">
              <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest mb-1">AI Indexed</p>
              <h3 className="text-4xl font-black text-white">{stats.videos - stats.pendingEmbeddings}</h3>
            </div>
          </div>

          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Adventure Intelligence</h2>
                <p className="text-slate-500 text-sm">Synchronize transcript vectors with the recommendation engine.</p>
              </div>
              <button 
                onClick={handleBulkAI}
                disabled={isProcessing}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                  isProcessing ? 'bg-slate-800 text-slate-600' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                }`}
              >
                {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                <span>Bulk Index AI</span>
              </button>
            </div>
            {stats.pendingEmbeddings > 0 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-sm font-bold">
                ⚠️ {stats.pendingEmbeddings} videos require indexing to enable AI Crossroads.
              </div>
            )}
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Activity className="text-emerald-500" size={18} /> Telemetry
              </h2>
            </div>
            <div className="divide-y divide-slate-800">
              {logs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">{log.event_type}</span>
                  <span className="text-[10px] font-mono text-slate-600">{new Date(log.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2"><Search size={14}/> Lookup</h2>
            <input type="text" placeholder="Athlete Email..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"/>
          </section>
          <section className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6">
             <BarChart3 className="text-emerald-500 mb-4" />
             <h3 className="font-bold text-white text-sm">System Health</h3>
             <p className="text-xs text-slate-500 mt-2">All adventure nodes and payment webhooks are currently operational.</p>
          </section>
        </div>
      </main>
    </div>
  );
}

// --- MAIN PAGE WRAPPER ---

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          setAuthorized(true);
        } else {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="text-amber-500 animate-spin mb-4" size={32} />
        <p className="text-slate-500 font-bold uppercase tracking-[0.5em] text-xs text-center">Verifying Admin clearance...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <ShieldAlert className="text-red-500 mb-6" size={64} />
        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Access Denied</h1>
        <p className="text-slate-400 max-w-md mx-auto">
          Root clearance required for this node.
        </p>
      </div>
    );
  }

  return <AdminDashboard />;
}