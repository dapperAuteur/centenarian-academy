/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 *
 * Description: The main landing page for the Centenarian Athlete Academy.
 * Features: Coming soon announcement, repo link, and logo integration.
 */
'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { Github, Timer, Shield, Zap, ChevronRight, Activity, Loader2 } from 'lucide-react';
import { Analytics } from "@vercel/analytics/next"
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

/**
 * Mocking useRouter and supabase for the preview environment to resolve 
 * compilation errors. In a local Next.js environment, these would be 
 * imported from 'next/navigation' and '../lib/supabase'.
 */
const useRouter = () => ({
  push: (path: string) => console.log(`Navigating to: ${path}`),
});

// Fallback for supabase if the relative import fails in this environment
// const supabaseMock = {
//   auth: {
//     signInWithOtp: async (args: any) => ({ error: null }),
//   }
// };

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const repoUrl = "https://the.worldsfastestcentenarian.com/academy-repo";

  // Use a fallback to ensure the component doesn't crash if lib is missing
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      // In a real environment, this would use the imported supabase client
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Ensure this URL is whitelisted in your Supabase Dashboard > Auth > Redirect URLs
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setMessage({ text: error.message, type: 'error' });
      } else {
        setMessage({ 
          text: 'Check your email for the magic login link! Verify your spam folder if it doesn\'t arrive shortly.', 
          type: 'success' 
        });
      }
    } catch (err: any) {
      console.log('err :>> ', err);
      setMessage({ text: 'Authentication service is temporarily unavailable.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 font-sans">
      <Analytics/>
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-emerald-500/20">
            <Image
              src={'/images/FlyWitUSLogoVer3.png'}
              alt={"World's Fastest Centenarian Logo"}
              width={500}
              height={500}
            />
          </div>
          <span className="font-black text-2xl tracking-tighter italic uppercase hidden sm:inline-block">
            Centenarian Academy
          </span>
        </div>
        <div className="flex items-center space-x-4">
           <button 
             onClick={() => router.push('/dashboard')}
             className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
           >
             Dashboard
           </button>
           <Link 
            href={`${repoUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
           >
            <Github size={20} />
           </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
              <Zap size={14} className="animate-pulse" />
              <span>The Future of NASM Training</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase leading-[0.9] mb-8">
              Built for the <br />
              <span className="text-emerald-500 underline decoration-slate-800 underline-offset-8">Long Run.</span>
            </h1>

            <p className="text-xl text-slate-400 mb-10 max-w-xl leading-relaxed">
              Master your CPT certification through a non-linear adventure. 
              Powered by Gemini AI to adapt to your unique learning path.
            </p>

            <form onSubmit={handleMagicLink} className="flex flex-col sm:flex-row gap-4 max-w-md">
              <input 
                type="email"
                placeholder="Enter your email..."
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="grow bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase italic tracking-tight transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Join the Academy</span>}
                {!loading && <ChevronRight size={18} />}
              </button>
            </form>
            {message && (
              <p className={`mt-4 text-sm font-bold italic ${message.type === 'error' ? 'text-red-400' : 'text-emerald-500'}`}>
                {message.text}
              </p>
            )}
          </div>

          <div className="relative">
             <div className="absolute -inset-4 bg-emerald-500/5 blur-3xl rounded-full" />
             <div className="relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-4 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
                <div className="bg-slate-950 rounded-4xl p-8 aspect-4/3 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Node</p>
                         <h3 className="text-xl font-black italic uppercase">Human Anatomy 101</h3>
                      </div>
                      <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-500 border border-emerald-500/20">
                         <Activity size={24} />
                      </div>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 w-2/3" />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                         <span>Progress</span>
                         <span>68% Mastery</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Feature Footprint/Section */}
      <section className="border-t border-slate-900 bg-slate-950 py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-emerald-500">
               <Zap size={24} />
            </div>
            <h4 className="text-lg font-black italic uppercase">Adventure Engine</h4>
            <p className="text-sm text-slate-500 leading-relaxed">AI-driven semantic mapping creates a non-linear curriculum tailored to your intent.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-emerald-500">
               <Shield size={24} />
            </div>
            <h4 className="text-lg font-black italic uppercase">Gated Excellence</h4>
            <p className="text-sm text-slate-500 leading-relaxed">Secure hierarchical access control ensures premium athletes get world-class support.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-emerald-500">
               <Activity size={24} />
            </div>
            <h4 className="text-lg font-black uppercase italic">Deep Telemetry</h4>
            <p className="text-sm text-slate-500 leading-relaxed">Every node, scroll, and choice is logged to optimize your journey to becoming a centenarian.</p>
          </div>
        </div>
      </section>
    </div>
  );
}