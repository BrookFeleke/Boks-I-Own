/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Book, BookGenre } from '../../types';
import { Award, Layers, Target, Compass, Sparkles, BookOpen, Clock, Printer, Scroll } from 'lucide-react';
import { StatsService } from '../../services/statsService';

interface ExtrasProps {
  books: Book[];
  bookGenres: BookGenre[];
}

export const VisualExtras: React.FC<ExtrasProps> = ({ books, bookGenres }) => {
  if (!books || books.length === 0) return null;

  // 1. Library DNA Computing
  const total = books.length;
  const avgPages = Math.round(books.reduce((sum, b) => sum + (b.PageCount || 0), 0) / total);
  const classicsCount = books.filter(b => b.PublishedYear < 1900).length;
  const paperbacks = books.filter(b => b.Format === 'Paperback').length;
  const unread = books.filter(b => b.ReadStatus === 'Unread').length;

  const topNationality = StatsService.computeDashboardStats(books, bookGenres).topNationality;

  // Formulate 5 traits
  const dnaTraits = [
    {
      title: classicsCount / total > 0.4 ? 'Classics Heavy Anchor' : 'Modern Collection Focus',
      desc: classicsCount / total > 0.4 
        ? `${Math.round((classicsCount/total)*100)}% of your books are dated pre-1900, grounding your library in historic roots.`
        : 'Your collecting trends strongly toward post-1900 works and modern insights.',
      icon: Award,
      color: 'bg-yellow-300'
    },
    {
      title: avgPages > 400 ? 'Epic Volume Collector' : 'Short / Digest Prefers',
      desc: avgPages > 400
        ? `Average length of ${avgPages} pages suggests confidence in deep-immersion epic literature.`
        : `Average under-400 length (${avgPages} pgs) reflects an appreciation of concise masterpieces.`,
      icon: Layers,
      color: 'bg-emerald-300'
    },
    {
      title: paperbacks / total > 0.6 ? 'Vanguard Paperback Reader' : 'Hardback Preserver',
      desc: paperbacks / total > 0.6 
        ? 'Prefers durable, lightweight formats for dynamic, multi-location active reading.'
        : 'High percentage of hardbacks indicates historical archiving and display commitment.',
      icon: Target,
      color: 'bg-rose-300'
    },
    {
      title: `Global Focus: ${topNationality}`,
      desc: `Your historical interests skew prominently toward ${topNationality} authors.`,
      icon: Compass,
      color: 'bg-teal-300'
    },
    {
      title: unread / total > 0.4 ? 'Passionate Tsundoku' : 'Active Completionist',
      desc: unread / total > 0.4 
        ? `${Math.round((unread/total)*100)}% unread density represents a rich, aspirational backlog waiting online.`
        : `Over ${Math.round((1 - unread/total)*100)}% read status indicates solid follow-through and active consumption.`,
      icon: Sparkles,
      color: 'bg-violet-300'
    }
  ];

  // 2. Biggest Cluster: Group by Author Nationality or Genre. Let's find highest count
  const itemsByNationality: Record<string, number> = {};
  books.forEach(b => {
    itemsByNationality[b.AuthorNationality] = (itemsByNationality[b.AuthorNationality] || 0) + 1;
  });
  const maxNationalityEntry = Object.entries(itemsByNationality).sort((a,b) => b[1] - a[1])[0];

  // 3. Rare Tags
  const genreTotalCounts: Record<string, number> = {};
  bookGenres.forEach(g => {
    genreTotalCounts[g.Genre] = (genreTotalCounts[g.Genre] || 0) + 1;
  });
  const rareGenres = Object.entries(genreTotalCounts)
    .filter(([_, count]) => count === 1)
    .map(([genre]) => genre);

  // 4. Oldest Shelf: Books pre-1850
  const oldestShelf = [...books].filter(b => b.PublishedYear < 1850).slice(0, 4);

  // 5. Publisher Ecosystem
  const totalImprintClassics = books.filter(b => 
    b.Publisher.includes('Classics') || b.Publisher.includes("Everyman's")
  ).length;

  // 6. Book Length Spectrum
  const sortedByLength = [...books].sort((a,b) => b.PageCount - a.PageCount);
  const longestBook = sortedByLength[0];
  const shortestBook = sortedByLength[sortedByLength.length - 1];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans text-black">
      
      {/* CARD 1: Library DNA */}
      <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col justify-between rounded-none">
        <div className="mb-4">
          <div className="font-mono text-[10px] font-black text-[#FF4500] uppercase tracking-widest mb-1">
            ANALYSIS BLOCK A
          </div>
          <h2 className="text-xl font-black uppercase italic tracking-tight text-black border-b-4 border-black pb-2 mb-4">
            🧬 LIBRARY DNA DETAILS
          </h2>
          <div className="space-y-4">
            {dnaTraits.slice(0, 4).map((trait, index) => {
              const Icon = trait.icon;
              return (
                <div key={index} className="flex gap-3 items-start">
                  <div className={`p-1.5 border-2 border-black ${trait.color} shadow-[1px_1px_0_0_rgba(0,0,0,1)] rounded-none`}>
                    <Icon className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-black">{trait.title}</h3>
                    <p className="text-[10px] text-gray-800 mt-0.5 leading-normal">{trait.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-[#F0E68C] p-2 border-2 border-black font-mono text-[10px] text-black font-black uppercase text-center mt-2 rounded-none">
          TRAITS AGGREGATED FROM CORE FIELDS
        </div>
      </div>

      {/* CARD 2: Biggest Cluster & Rare Tags */}
      <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col justify-between rounded-none">
        <div>
          <div className="font-mono text-[10px] font-black text-[#FF4500] uppercase tracking-widest mb-1">
            ANALYSIS BLOCK B
          </div>
          <h2 className="text-xl font-black uppercase italic tracking-tight text-black border-b-4 border-black pb-2 mb-4">
            🎯 NODE CONCENTRATION
          </h2>
          
          {/* Biggest Node cluster */}
          {maxNationalityEntry && (
            <div className="bg-[#FFD700] border-4 border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] mb-4 rounded-none">
              <div className="flex items-center gap-2 mb-1">
                <Compass className="w-5 h-5 text-black stroke-[2.5]" />
                <span className="font-mono text-[10px] font-black uppercase text-black">Dominant Nationality Anchor</span>
              </div>
              <div className="text-xl font-black text-black uppercase italic">{maxNationalityEntry[0]}</div>
              <div className="font-mono text-[10px] mt-1 text-black font-bold">
                Found {maxNationalityEntry[1]} books representing this cluster in database.
              </div>
            </div>
          )}

          {/* Rare categories */}
          <div className="mt-4">
            <h3 className="text-xs font-black uppercase text-black mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-black stroke-[3]" />
              Unique / Single tags
            </h3>
            {rareGenres.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {rareGenres.slice(0, 8).map(g => (
                  <span key={g} className="border-2 border-black bg-[#90EE90] px-2 py-0.5 font-mono text-[10px] font-black uppercase shadow-[1.5px_1.5px_0_0_rgba(0,0,0,1)] rounded-none text-black">
                    #{g}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-gray-500 italic">No single-occurrence tag clusters detected.</p>
            )}
          </div>
        </div>

        <div className="border-t-2 border-black border-dashed pt-4 mt-6">
          <div className="flex justify-between items-center text-xs font-bold text-black uppercase">
            <span>Tag Diversity Index:</span>
            <span className="font-mono font-black">{Object.keys(genreTotalCounts).length} unique tags</span>
          </div>
        </div>
      </div>

      {/* CARD 3: Book Length Spectrum */}
      <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col justify-between rounded-none">
        <div>
          <div className="font-mono text-[10px] font-black text-[#FF4500] uppercase tracking-widest mb-1">
            ANALYSIS BLOCK C
          </div>
          <h2 className="text-xl font-black uppercase italic tracking-tight text-black border-b-4 border-black pb-2 mb-4">
            📏 VOLUMETRIC SPECTRUM
          </h2>

          <div className="space-y-6">
            {/* Longest */}
            {longestBook && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <Scroll className="w-4 h-4 text-black stroke-[2.5]" />
                  <span className="text-[10px] font-mono font-black uppercase text-[#1A1A1A]">Longest Work Owned</span>
                </div>
                <div className="border-2 border-black bg-[#ADD8E6] p-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)] rounded-none">
                  <div className="text-xs font-black uppercase truncate text-black">{longestBook.Title}</div>
                  <div className="flex justify-between font-mono text-[10px] text-black mt-1 font-bold">
                    <span>{longestBook.Author}</span>
                    <span className="font-black bg-white px-1 border border-black">{longestBook.PageCount} PGS</span>
                  </div>
                </div>
              </div>
            )}

            {/* Shortest */}
            {shortestBook && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-black stroke-[2.5]" />
                  <span className="text-[10px] font-mono font-black uppercase text-[#1A1A1A]">Concise / Shortest Work</span>
                </div>
                <div className="border-2 border-black bg-[#FF7F50] p-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)] rounded-none">
                  <div className="text-xs font-black uppercase truncate text-black">{shortestBook.Title}</div>
                  <div className="flex justify-between font-mono text-[10px] text-black mt-1 font-bold">
                    <span>{shortestBook.Author}</span>
                    <span className="font-black bg-white px-1 border border-black">{shortestBook.PageCount} PGS</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t-2 border-black border-dashed pt-4 mt-6">
          <div className="flex justify-between items-center text-xs font-bold text-black uppercase">
            <span>Avg library spacing:</span>
            <span className="font-mono font-black">{avgPages} pgs / book</span>
          </div>
        </div>
      </div>

      {/* CARD 4: Oldest Shelf Pre-1850 */}
      <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-none">
        <div className="font-mono text-[10px] font-black text-[#FF4500] uppercase tracking-widest mb-1">
          HISTORICAL SHELF
        </div>
        <h2 className="text-xl font-black uppercase italic tracking-tight text-black border-b-4 border-black pb-2 mb-4">
          📜 PRE-1850 BINDINGS
        </h2>
        
        {oldestShelf.length > 0 ? (
          <div className="space-y-3 pt-1">
            {oldestShelf.map((b) => (
              <div key={b.BookID} className="flex justify-between items-center gap-4 bg-white border-2 border-black p-2.5 shadow-[3px_3px_0_0_rgba(0,0,0,1)] rounded-none">
                <div className="truncate flex-1">
                  <div className="text-xs font-black text-black uppercase truncate">{b.Title}</div>
                  <div className="text-[10px] font-mono text-gray-800 font-bold">{b.Author}</div>
                </div>
                <div className="border border-black bg-[#FFD700] font-mono text-[11px] font-black py-0.5 px-2 rounded-none">
                  {StatsService.formatYear(b.PublishedYear)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-gray-500 italic">No books in the classical era catalog found.</p>
        )}
      </div>

      {/* CARD 5: Publisher Ecosystem */}
      <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] col-span-1 md:col-span-2 rounded-none">
        <div className="font-mono text-[10px] font-black text-[#FF4500] uppercase tracking-widest mb-1">
          PRINT REGISTRY
        </div>
        <h2 className="text-xl font-black uppercase italic tracking-tight text-black border-b-4 border-black pb-2 mb-4">
          🖨️ PUBLISHER ECOSYSTEM & IMPRINTS
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border-3 border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col justify-between rounded-none">
            <div>
              <div className="flex items-center gap-2 mb-1 text-black">
                <Clock className="w-5 h-5 stroke-[2.5]" />
                <span className="font-mono text-[10px] font-black uppercase tracking-wider text-black">Classics Imprints</span>
              </div>
              <div className="text-3xl font-black mt-2 text-black">
                {totalImprintClassics} <span className="text-xs uppercase font-bold text-black bg-[#FFF7E8] px-1 border border-black inline-block">Volumes</span>
              </div>
              <p className="text-[10px] text-black leading-normal mt-2">
                Includes imprints bearing &quot;Classics&quot; or &quot;Everyman&apos;s&quot; branding in their registered publisher field.
              </p>
            </div>
            <div className="pt-2 font-mono text-[10px] text-[#FF4500] font-black uppercase">
              CONCENTRATION: {Math.round((totalImprintClassics / total) * 100)}% OF TOTAL
            </div>
          </div>

          <div className="bg-white border-3 border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col justify-between rounded-none">
            <div>
              <div className="flex items-center gap-2 mb-1 text-black">
                <Printer className="w-5 h-5 stroke-[2.5]" />
                <span className="font-mono text-[10px] font-black uppercase tracking-wider text-black">Publisher Split</span>
              </div>
              <div className="text-xs font-bold text-black space-y-1 mt-1 pt-1">
                {StatsService.getPublisherDistribution(books).slice(0, 4).map((p) => (
                  <div key={p.name} className="flex justify-between items-center border-b border-black border-dashed pb-0.5">
                    <span className="truncate flex-1 max-w-[150px] font-bold">{p.name}</span>
                    <span className="font-mono font-black">{p.count} books</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-black border-dashed pt-2 mt-2 font-mono text-[10px] text-[#FF4500] font-black uppercase">
              TOP REGISTERED: {StatsService.computeDashboardStats(books, bookGenres).topPublisher}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
