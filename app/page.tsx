/**
 * File Path: ./centenarian-academy/app/page.tsx
 * Description: The main landing page for the Centenarian Athlete Academy.
 * Features: Coming soon announcement, repo link, and logo integration.
 */

import React from 'react';
import Image from 'next/image';
import { Github, Timer, Shield, Zap } from 'lucide-react';
import { Analytics } from "@vercel/analytics/next"
import Link from 'next/link';

export default function LandingPage() {
  const repoUrl = "https://the.worldsfastestcentenarian.com/academy-repo"; // Replace with your actual repo URL

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col selection:bg-emerald-500/30">
      <Analytics />
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          {/* Using a placeholder for the logo - you can swap the src with your actual local logo path */}
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-900 text-xl">
            <Image
              src={'/images/FlyWitUSLogoVer3.png'}
              alt={"World's Fastest Centenarian Logo"}
              width={500}
              height={500}
            />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
            CENTENARIAN ACADEMY
          </span>
        </div>
        <Link 
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full transition-colors text-sm font-medium"
        >
          <Github size={18} />
          <span>View Repo</span>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold mb-8 animate-pulse">
          <Zap size={14} />
          <span>NOW IN ACTIVE DEVELOPMENT</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Built for the <br />
          <span className="text-emerald-500">Long Run.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
          The ultimate &quot;Choose Your Own Adventure&quot; platform for NASM fitness professionals. 
          Master your certification through non-linear AI-guided paths.
        </p>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-16 w-full sm:w-auto">
          <a 
            href={repoUrl}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-8 py-4 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
          >
            <span>Follow Progress on GitHub</span>
          </a>
          <button className="bg-slate-800 border border-slate-700 hover:bg-slate-700 px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 text-slate-300">
            <span>Get Pre-launch Updates</span>
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
              <Zap size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Adventure Engine</h3>
            <p className="text-sm text-slate-400">Non-linear navigation that lets you map your own learning journey.</p>
          </div>
          
          <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
              <Shield size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Secure Content</h3>
            <p className="text-sm text-slate-400">Gated high-performance curriculum with hierarchical access controls.</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
              <Timer size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Intent Logging</h3>
            <p className="text-sm text-slate-400">Advanced telemetry tracking your growth from CPT student to Centenarian.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center text-slate-500 text-sm border-t border-slate-800">
        <p>© {new Date().getFullYear()} Centenarian Athlete Academy. All rights reserved.</p>
      </footer>
    </div>
  );
}