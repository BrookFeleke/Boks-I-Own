/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, BarChart3, Database, LogOut, Sliders, FolderSearch, Download, RefreshCcw } from 'lucide-react';
import { CatalogRepo } from '../../storage/db';
import { LocalDB } from '../../storage/localStorageAdapter';

interface NavbarProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onLock: () => void;
  onReset: () => void;
  onExport: () => void;
  booksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  onLock,
  onReset,
  onExport,
  booksCount
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Command Center', icon: BarChart3 },
    { id: 'library', label: 'My Library', icon: FolderSearch },
    { id: 'analysis', label: 'Deep Analysis', icon: Database },
    { id: 'taxonomies', label: 'Taxonomy Settings', icon: Sliders }
  ];

  return (
    <nav className="w-full border-b-4 border-black bg-[#FFD700] p-4 sticky top-0 z-30 font-sans shadow-[0_4px_0_0_rgba(0,0,0,1)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo & Counter Group */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black flex items-center justify-center rotate-3 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <BookOpen className="w-6 h-6 text-[#FFD700] stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-black leading-none">
              Books I Own
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-black" />
              <span className="text-[10px] font-mono font-black text-black uppercase tracking-wider">
                {CatalogRepo.isCloudActive() ? 'Cloud DB Active: ' : 'Database Mode: '}
                <strong className="text-black bg-white px-1 ml-0.5 border border-black">{booksCount} Records</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-${tab.id}`}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-2 border-2 border-black px-4 py-1.5 font-mono text-xs font-black uppercase tracking-wider cursor-pointer shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150 ${
                  isActive 
                    ? 'bg-[#FF4500] text-white shadow-none translate-x-[2px] translate-y-[2px]' 
                    : 'bg-white text-black hover:bg-[#FDF6E3] hover:translate-x-[1px] hover:translate-y-[1px]'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.5]" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Global Toolbar Utility Actions */}
        <div className="flex items-center gap-2">
          {/* Reset Demo Data Button */}
          <button
            id="nav-reset"
            title="Reset system database back to default library dataset"
            onClick={onReset}
            className="p-2 border-2 border-black bg-white hover:bg-red-100 text-[#1A1A1A] shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none cursor-pointer"
          >
            <RefreshCcw className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Export JSON Button */}
          <button
            id="nav-export"
            title="Export raw book collection data as local JSON file"
            onClick={onExport}
            className="p-2 border-2 border-black bg-white hover:bg-blue-100 text-[#1A1A1A] shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Separation line */}
          <div className="h-6 w-0.5 bg-black mx-1" />

          {/* Lock Session Button */}
          <button
            id="nav-lock"
            title="Lock collection behind password gate"
            onClick={onLock}
            className="flex items-center gap-2 border-2 border-black bg-[#FF4500] hover:bg-red-600 text-white font-mono text-xs font-black uppercase px-4 py-1.5 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">LOCK GATE</span>
          </button>
        </div>

      </div>
    </nav>
  );
};
