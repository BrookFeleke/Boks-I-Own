/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, ShieldCheck, KeyRound } from 'lucide-react';
import { LocalDB } from '../storage/localStorageAdapter';

interface LoginPageProps {
  onUnlock: () => void;
}

export const APP_PASSWORD = "change-this-password";

export const LoginPage: React.FC<LoginPageProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === APP_PASSWORD) {
      LocalDB.setUnlockState(true);
      setError(false);
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div id="login-screen" className="min-h-screen bg-[#FDF6E3] flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans select-none text-black">
      
      {/* Visual background details resembling a wood-cut stamp or book bindings */}
      <div className="absolute inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Main card box with high contrast borders and offset hard shadow */}
      <div 
        id="login-card"
        className="relative w-full max-w-md border-4 border-black bg-white rounded-none p-8 md:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,1)] z-10"
      >
        {/* Retro Header Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-black border-b-2 border-black" />

        {/* Vintage Logo icon branding */}
        <div className="flex flex-col items-center text-center mt-4 mb-8">
          <div className="w-16 h-16 bg-[#FFD700] border-4 border-black flex items-center justify-center p-1.5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] mb-4 rotate-3">
            <BookOpen className="w-10 h-10 text-black stroke-[3]" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight italic text-black border-b-4 border-black pb-2">
            BOOKS I OWN
          </h1>
          <p className="text-[10px] font-mono font-black tracking-widest text-[#FF4500] uppercase mt-3">
            LIBRARY COMMAND CENTER & CORE ANALYTICS
          </p>
        </div>

        {/* Access barrier / authentication form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-mono font-black uppercase tracking-wider text-black">
              Enter Personal Access Key :
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <KeyRound className="w-5 h-5 text-black stroke-[2.5]" />
              </span>
              <input
                id="password-input"
                type="password"
                placeholder="••••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className="w-full border-4 border-black bg-white py-3 pl-11 pr-4 text-xs font-mono font-black text-black placeholder-gray-400 focus:outline-none focus:bg-[#FFF7E8] focus:border-[#FF4500] rounded-none shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]"
              />
            </div>
          </div>

          {error && (
            <div id="login-error" className="border-4 border-black bg-[#FF6347] p-3 text-center rounded-none font-mono text-[11px] font-black text-black animate-pulse uppercase shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
              ❌ ACCESS KEY REJECTED. CHECK CONFIG.
            </div>
          )}

          <button
            id="unlock-button"
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-[#FF4500] hover:bg-black hover:text-[#90EE90] active:translate-x-[2px] active:translate-y-[2px] text-white border-4 border-black font-mono font-black text-xs uppercase tracking-widest py-3.5 px-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none cursor-pointer transition-all duration-150"
          >
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            Decrypt & Open Shard
          </button>
        </form>

        {/* Explanatory footer panel in typewriter layout */}
        <div className="mt-8 pt-6 border-t-4 border-black border-dashed flex flex-col gap-2 font-mono text-[10px] text-black leading-relaxed font-bold">
          <div className="flex justify-between">
            <span>SECURE STACK ID:</span>
            <span className="text-[#FF4500]">AES-256-SHA-DEMO</span>
          </div>
          <div>
            * Unlock state caches securely in your local browser sandbox database (`localStorage`). No remote credentials are exchanged.
          </div>
          <div className="bg-[#FFF7E8] border-2 border-black p-2.5 text-black font-black mt-2">
            💡 HINT: ENTER THE ACCESS KEY: <code className="bg-white px-1 leading-none border border-black font-black text-[#FF4500] select-all">change-this-password</code>
          </div>
        </div>
      </div>
    </div>
  );
};
