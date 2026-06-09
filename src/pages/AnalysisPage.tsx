/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Book, BookGenre } from '../types';
import { StatsService } from '../services/statsService';
import { 
  BarChart3, 
  Sparkles, 
  Clock, 
  Printer, 
  Layers, 
  CheckSquare, 
  HelpCircle, 
  ChevronRight, 
  Activity, 
  UserCircle2, 
  AlertTriangle,
  Heart,
  TrendingUp,
  MapPin
} from 'lucide-react';

interface AnalysisPageProps {
  books: Book[];
  bookGenres: BookGenre[];
  onViewBook: (bookId: string) => void;
  onNavigateToTaxonomies: () => void;
  onViewAuthor?: (author: string) => void;
}

type ActiveSection = 'identity' | 'history' | 'genres' | 'publishers' | 'physical' | 'quality';

export const AnalysisPage: React.FC<AnalysisPageProps> = ({
  books,
  bookGenres,
  onViewBook,
  onNavigateToTaxonomies,
  onViewAuthor
}) => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('identity');

  const detailed = StatsService.getDetailedAnalysis(books, bookGenres);
  const dashboard = StatsService.computeDashboardStats(books, bookGenres);

  if (!detailed || books.length === 0) {
    return (
      <div className="border-4 border-black bg-white p-12 text-center shadow-[4px_4px_0px_#000] font-sans">
        <h3 className="text-xl font-black uppercase text-gray-805">Insufficient Dataset</h3>
        <p className="text-xs text-gray-500 mt-2">Log at least 3 books in your shelf ledger to unlocked core analytical index engines.</p>
      </div>
    );
  }

  // Section options
  const sections: { id: ActiveSection; title: string; icon: any; color: string }[] = [
    { id: 'identity', title: 'Collection Insights', icon: Heart, color: 'bg-[#FFD700]' },
    { id: 'history', title: 'Historical Eras', icon: Clock, color: 'font-bold bg-[#FF4500] text-white' },
    { id: 'genres', title: 'Genre Groupings', icon: BarChart3, color: 'bg-[#90EE90]' },
    { id: 'publishers', title: 'Publishers & Imprints', icon: Printer, color: 'bg-[#EBF5FB]' },
    { id: 'physical', title: 'Sizing & Formats', icon: Layers, color: 'bg-orange-100' },
    { id: 'quality', title: 'Catalog Checklist', icon: CheckSquare, color: 'bg-[#FFF7E8]' }
  ];

  return (
    <div className="space-y-6 pb-12 font-sans text-black animate-fade-in">
      
      {/* 1. Introductory Header with analytical DNA details */}
      <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tight text-black flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-[#FF4500] stroke-[3]" />
            Detailed Collection Analysis
          </h2>
          <p className="text-xs text-black mt-2 max-w-xl font-bold font-mono uppercase tracking-tight">
            Explore deep trends, publication era distributions, genre co-occurrences, and overall catalog health.
          </p>
        </div>
        <div className="font-mono text-xs font-black text-black bg-white border-4 border-black inline-block px-4 py-2 shadow-[3px_3px_0_0_rgba(0,0,0,1)] rounded-none">
          COLLECTION STATUS: {books.length} BOOKS
        </div>
      </div>

      {/* 2. Top Section Switcher Ribbons */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 border-4 border-black bg-[#FFF7E8] p-3 shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-none">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center justify-center gap-1.5 border-4 border-black px-2 py-3 font-mono text-[9px] font-black uppercase tracking-wider cursor-pointer shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all rounded-none ${
                isActive 
                  ? `${sec.color} shadow-none translate-x-[2px] translate-y-[2px]` 
                  : 'bg-white hover:bg-[#FFD700] text-black'
              }`}
            >
              <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="truncate">{sec.title}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Render Selection Modules */}
      <div className="border-4 border-black bg-white p-6 md:p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-none">
        
        {/* ==================================================================== */}
        {/* SECTION A: COLLECTION IDENTITY */}
        {/* ==================================================================== */}
        {activeSection === 'identity' && (
          <div className="space-y-6">
            <div className="border-b-4 border-black pb-3">
              <h3 className="text-xl font-black uppercase tracking-tight text-black">🧬 Core Collection Identity Profile</h3>
              <p className="text-[10px] text-[#FF4500] font-mono font-bold uppercase mt-1">Overview of your library's distribution and publishing history</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Collection Identity Card */}
              <div className="border-4 border-black bg-[#FFF7E8] p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-4 rounded-none text-black">
                <h4 className="text-xs font-mono font-black uppercase text-black border-b-2 border-black pb-1.5 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 stroke-[3]" />
                  COLLECTION FOCUS
                </h4>
                <div className="text-xl font-black text-black uppercase tracking-tight">
                  {detailed.eraRatio > 0.5 ? 'Vintage / Classics Dominated' : 'Modernist & Contemporary skew'}
                </div>
                <p className="text-xs text-black leading-relaxed font-bold font-mono">
                  Pre-1900 works represent <strong className="text-[#FF4500] text-sm font-black">{Math.round(detailed.eraRatio * 100)}%</strong> of your owned libraries. 
                  {detailed.eraRatio > 0.5 
                    ? " Your active collecting leans heavily into historical classics, realist, and ancient cornerstones."
                    : " Your active shelves are highly aligned with 20th century postmodernism, science fiction, and modern developments."}
                </p>
                <div className="pt-2">
                  <div className="h-6 w-full bg-white border-4 border-black rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,1)] overflow-hidden flex font-mono text-[9px] font-black">
                    <div className="bg-[#FF4500] h-full border-r-4 border-black flex items-center justify-center text-white" style={{ width: `${detailed.eraRatio*100}%` }}>
                      CLASSICS ({Math.round(detailed.eraRatio*100)}%)
                    </div>
                    <div className="bg-[#90EE90] h-full flex items-center justify-center text-black" style={{ width: `${(1-detailed.eraRatio)*100}%` }}>
                      MODERN ({Math.round((1-detailed.eraRatio)*100)}%)
                    </div>
                  </div>
                </div>
              </div>

              {/* Dominant attributes card */}
              <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-4 rounded-none">
                <h4 className="text-xs font-mono font-black uppercase text-black border-b-2 border-black pb-1.5">
                  🌐 GLOBAL & AUTHOR STATISTICS
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-[#FFF7E8] p-2.5 border-2 border-black">
                    <span className="font-black text-black uppercase font-mono text-[10px]">Most Frequent Author Origin:</span>
                    <strong className="font-mono bg-white border-2 border-black px-2 py-0.5 font-black">{dashboard.topNationality}</strong>
                  </div>
                  <div className="flex justify-between items-center bg-[#FFF7E8] p-2.5 border-2 border-black">
                    <span className="font-black text-black uppercase font-mono text-[10px]">Most Common Publisher:</span>
                    <strong className="font-mono bg-white border-2 border-black px-2 py-0.5 font-black">{dashboard.topPublisher}</strong>
                  </div>
                  <div className="flex justify-between items-center bg-[#FFF7E8] p-2.5 border-2 border-black">
                    <span className="font-black text-black uppercase font-mono text-[10px]">Most Common Genre:</span>
                    <strong className="font-mono bg-white border-2 border-black px-2 py-0.5 font-black">{dashboard.topGenre}</strong>
                  </div>
                </div>
              </div>

              {/* Top Represented Authors */}
              <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:col-span-2 rounded-none">
                <h4 className="text-xs font-mono font-black uppercase text-black border-b-2 border-black pb-2 mb-3">
                  ✒️ Most Popular Authors on Your Shelves
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {detailed.topAuthors.map((auth, idx) => (
                    <div key={auth.name} className="bg-white border-4 border-black p-3 text-center shadow-[2px_2px_0_0_rgba(0,0,0,1)] relative overflow-hidden flex flex-col justify-between rounded-none">
                      <div className="absolute top-0 left-0 bg-black text-white font-mono text-[10px] w-6 h-6 flex items-center justify-center font-black">
                        #{idx + 1}
                      </div>
                      <button 
                        type="button"
                        onClick={() => onViewAuthor?.(auth.name)}
                        className="text-xs font-black text-black hover:text-[#FF4500] underline mt-4 truncate focus:outline-none block w-full text-center"
                        title={`View ${auth.name}'s profile`}
                      >
                        {auth.name}
                      </button>
                      <div className="font-mono text-[10px] font-black text-[#FF4500] mt-2">
                        {auth.count} works owned
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* SECTION B: HISTORICAL SPREAD & ERAS */}
        {/* ==================================================================== */}
        {activeSection === 'history' && (
          <div className="space-y-6">
            <div className="border-b-4 border-black pb-3">
              <h3 className="text-xl font-black uppercase text-gray-950">📅 Publication Dates & Chronology</h3>
              <p className="text-xs text-gray-500 font-mono font-bold uppercase mt-1">Oldest and newest books registered in your collection</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Oldest 10 Works */}
              <div className="border-3 border-black bg-orange-50 p-5 shadow-[3px_3px_0px_#000000]">
                <h4 className="text-xs font-mono font-black uppercase text-orange-900 border-b border-black/15 pb-2 mb-3">
                  📜 Oldest works registered
                </h4>
                <div className="space-y-2">
                  {detailed.oldestWorks.map(b => (
                    <div 
                      key={b.BookID} 
                      onClick={() => onViewBook(b.BookID)}
                      className="flex justify-between items-center bg-white p-2.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000] hover:bg-yellow-50 hover:-translate-y-0.5 cursor-pointer transition-all"
                    >
                      <div className="truncate flex-1">
                        <strong className="text-xs text-gray-900 uppercase truncate block">{b.Title}</strong>
                        <span className="text-[10px] text-gray-500 font-sans">
                          by{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewAuthor?.(b.Author);
                            }}
                            className="hover:text-[#FF4500] underline font-bold cursor-pointer focus:outline-none"
                            title={`View ${b.Author}'s profile`}
                          >
                            {b.Author}
                          </button>
                        </span>
                      </div>
                      <span className="font-mono text-xs font-black bg-yellow-300 border border-black py-0.5 px-2">
                        {StatsService.formatYear(b.PublishedYear)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newest 10 Works */}
              <div className="border-3 border-black bg-[#EBF5FB] p-5 shadow-[3px_3px_0px_#000000]">
                <h4 className="text-xs font-mono font-black uppercase text-blue-900 border-b border-black/15 pb-2 mb-3">
                  ✨ Modern / Newest creations registered
                </h4>
                <div className="space-y-2">
                  {detailed.newestWorks.map(b => (
                    <div 
                      key={b.BookID} 
                      onClick={() => onViewBook(b.BookID)}
                      className="flex justify-between items-center bg-white p-2.5 border-2 border-black shadow-[1.5px_1.5px_0px_#000] hover:bg-yellow-50 hover:-translate-y-0.5 cursor-pointer transition-all"
                    >
                      <div className="truncate flex-1">
                        <strong className="text-xs text-gray-900 uppercase truncate block">{b.Title}</strong>
                        <span className="text-[10px] text-gray-500 font-sans">
                          by{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewAuthor?.(b.Author);
                            }}
                            className="hover:text-[#FF4500] underline font-bold cursor-pointer focus:outline-none"
                            title={`View ${b.Author}'s profile`}
                          >
                            {b.Author}
                          </button>
                        </span>
                      </div>
                      <span className="font-mono text-xs font-black bg-blue-300 border border-black py-0.5 px-2">
                        {StatsService.formatYear(b.PublishedYear)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* SECTION C: GENRE METADATA CO-OCCURRENCE */}
        {/* ==================================================================== */}
        {activeSection === 'genres' && (
          <div className="space-y-6">
            <div className="border-b-4 border-black pb-3">
              <h3 className="text-xl font-black uppercase text-gray-950">📊 Genre Variety & Categorization</h3>
              <p className="text-xs text-gray-500 font-mono font-bold uppercase mt-1">Details about depth of categorizations on your shelves</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Deep Tagged Records 3+ genres */}
              <div className="border-3 border-black bg-orange-50 p-5 shadow-[3px_3px_0px_#000000]">
                <h4 className="text-xs font-mono font-black uppercase text-orange-950 border-b border-black/15 pb-2 mb-3">
                  🔮 Highly Categorized Books (3+ Genres)
                </h4>
                {detailed.highlyTagged.length > 0 ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {detailed.highlyTagged.map(b => (
                      <div key={b.Title} className="bg-white border-2 border-black p-3.5 shadow-[1.5px_1.5px_0px_#000]">
                        <div className="flex justify-between items-start gap-4">
                          <strong className="text-xs text-gray-900 uppercase select-all block leading-tight">{b.Title}</strong>
                          <span className="shrink-0 font-mono text-[9px] bg-red-400 border border-black font-black px-1.5 py-0.5 uppercase tracking-wide">
                            {b.count} tags
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-550 block mt-0.5 font-semibold">by {b.Author}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No books with 3 or more genres found.</p>
                )}
              </div>

              {/* Poor Genre tagging check */}
              <div className="border-3 border-black bg-yellow-50 p-5 shadow-[3px_3px_0px_#000000]">
                <h4 className="text-xs font-mono font-black uppercase text-gray-700 border-b border-black/15 pb-2 mb-3">
                  ⚠️ Books with Single Genre Tag
                </h4>
                <p className="text-[11px] text-gray-600 mb-4 font-semibold leading-relaxed">
                  These books have only one genre tag and could be tagged more specifically inside the Add/Edit form for richer navigation.
                </p>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {books.filter(b => bookGenres.filter(g => g.BookID === b.BookID).length <= 1).map(b => (
                    <div 
                      key={b.BookID} 
                      onClick={() => onViewBook(b.BookID)}
                      className="bg-white border-2 border-black p-2.5 shadow-[1px_1px_0px_#000] hover:bg-yellow-50 cursor-pointer text-xs font-bold text-gray-800 flex justify-between"
                    >
                      <span className="truncate">{b.Title}</span>
                      <ChevronRight className="w-4 h-4 text-[#B57614]" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* SECTION D: PUBLISHER CONCENTRATION ANALYSIS */}
        {/* ==================================================================== */}
        {activeSection === 'publishers' && (
          <div className="space-y-6">
            <div className="border-b-4 border-black pb-3">
              <h3 className="text-xl font-black uppercase text-gray-950">🖨️ Publishers & Editions</h3>
              <p className="text-xs text-gray-500 font-mono font-bold uppercase mt-1">Overview of print publishers represented in your library</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Density statistics */}
              <div className="border-3 border-black bg-blue-50 p-5 shadow-[3px_3px_0px_#000000] space-y-4">
                <h4 className="text-xs font-mono font-black uppercase text-blue-900 border-b border-black/20 pb-1">
                  Classics Imprints Ratio
                </h4>
                <div className="text-3xl font-black text-gray-900">
                  {Math.round((detailed.classicsImprintCount / books.length) * 100)}% 
                  <span className="text-xs font-bold text-gray-500 uppercase ml-2">Classics Editions</span>
                </div>
                <p className="text-xs text-gray-700 leading-normal font-semibold">
                  Out of your {books.length} volumes, <strong className="text-black">{detailed.classicsImprintCount}</strong> are registered under Penguin, Oxford, Everyman or other prominent Classics series imprints.
                </p>
                <div className="bg-white border border-black/10 p-3 text-xs leading-relaxed font-mono mt-2">
                  * High classics concentration marks a rich dedication to historic editions, curated translations, and classic design.
                </div>
              </div>

              {/* Canonical normalizer link strip */}
              <div className="border-3 border-black bg-[#FFF7E8] p-5 shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-mono font-black uppercase text-gray-700 border-b border-black/20 pb-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-red-600" />
                    Publisher Name Standardizer
                  </h4>
                  <p className="text-xs text-gray-700 mt-3 leading-relaxed font-semibold">
                    The bookshelf automatically groups similar publisher names together (for example, combining "Penguin Classics" and "Penguin Paperbacks" to "Penguin") to keep your graphs clean and neat.
                  </p>
                </div>
                
                <button
                  onClick={onNavigateToTaxonomies}
                  className="mt-4 w-full bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black py-2 text-xs font-mono font-black uppercase shadow-[2.5px_2.5px_0px_#000] active:translate-y-0.5 cursor-pointer"
                >
                  Manage Publisher Rules
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* SECTION E: PHYSICAL VOLUME METRICS */}
        {/* ==================================================================== */}
        {activeSection === 'physical' && (
          <div className="space-y-6">
            <div className="border-b-4 border-black pb-3">
              <h3 className="text-xl font-black uppercase text-gray-950">📐 Physical Book Formats & Sizes</h3>
              <p className="text-xs text-gray-500 font-mono font-bold uppercase mt-1">Sizing, paperbacks vs hardbacks, and page counts</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Longest Works */}
              <div className="border-3 border-black bg-orange-50 p-5 shadow-[3px_3px_0px_#000000]">
                <h4 className="text-xs font-mono font-black uppercase text-orange-950 border-b border-black/15 pb-2 mb-3">
                  📚 Epic Page Length Ranking
                </h4>
                <div className="space-y-2">
                  {detailed.longestBooks.map(b => (
                    <div 
                      key={b.BookID} 
                      onClick={() => onViewBook(b.BookID)}
                      className="bg-white border-2 border-black p-2.5 flex justify-between items-center shadow-[1px_1px_0px_#000] hover:bg-yellow-50 cursor-pointer font-sans"
                    >
                      <span className="text-xs font-black truncate max-w-[200px]">{b.Title}</span>
                      <span className="font-mono text-xs text-[#B57614] font-black">{b.PageCount} pages</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shortest Works */}
              <div className="border-3 border-black bg-[#EBFADF] p-5 shadow-[3px_3px_0px_#000000]">
                <h4 className="text-xs font-mono font-black uppercase text-emerald-950 border-b border-black/15 pb-2 mb-3">
                  🕊️ Shortest Books
                </h4>
                <div className="space-y-2">
                  {detailed.shortestBooks.map(b => (
                    <div 
                      key={b.BookID} 
                      onClick={() => onViewBook(b.BookID)}
                      className="bg-white border-2 border-black p-2.5 flex justify-between items-center shadow-[1px_1px_0px_#000] hover:bg-yellow-50 cursor-pointer font-sans"
                    >
                      <span className="text-xs font-black truncate max-w-[200px]">{b.Title}</span>
                      <span className="font-mono text-xs text-[#B57614] font-black">{b.PageCount || 'Unknown'} pages</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* SECTION F: QUALITY AUDITS & DUPLICATION */}
        {/* ==================================================================== */}
        {activeSection === 'quality' && (
          <div className="space-y-6">
            <div className="border-b-4 border-black pb-3">
              <h3 className="text-xl font-black uppercase text-gray-950">🔍 Book Checklist & Gaps</h3>
              <p className="text-xs text-gray-500 font-mono font-bold uppercase mt-1">Identifying incomplete records and potential duplicate book names</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Data quality checklist metrics */}
              <div className="border-3 border-black bg-[#FFF7E8] p-5 shadow-[3px_3px_0px_#000000] space-y-4">
                <h4 className="text-xs font-mono font-black uppercase text-gray-700 border-b border-black/20 pb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 stroke-[2.5]" />
                  Cleaning Gaps Checklist
                </h4>

                <div className="space-y-2 font-mono text-xs text-gray-800">
                  <div className="flex justify-between bg-white border border-black/10 p-2 rounded">
                    <span>Missing Page Counts:</span>
                    <strong className={detailed.qualityCheck.missingPageCount.length > 0 ? 'text-red-650' : 'text-green-600'}>
                      {detailed.qualityCheck.missingPageCount.length} records
                    </strong>
                  </div>
                  <div className="flex justify-between bg-white border border-black/10 p-2 rounded">
                    <span>Missing Publisher Fields:</span>
                    <strong className={detailed.qualityCheck.missingPageCount.length > 0 ? 'text-red-650' : 'text-green-600'}>
                      {detailed.qualityCheck.missingPublisher.length} records
                    </strong>
                  </div>
                  <div className="flex justify-between bg-white border border-black/10 p-2 rounded">
                    <span>Unknown Logging Purchase Date:</span>
                    <strong className="text-gray-500">
                      {detailed.qualityCheck.unknownPurchaseDate.length} records
                    </strong>
                  </div>
                  <div className="flex justify-between bg-white border border-black/10 p-2 rounded">
                    <span>Missing Primary Filing Genre:</span>
                    <strong className={detailed.qualityCheck.missingPrimaryGenre.length > 0 ? 'text-red-650' : 'text-green-600'}>
                      {detailed.qualityCheck.missingPrimaryGenre.length} records
                    </strong>
                  </div>
                </div>
              </div>

              {/* Duplicate Entry Alarm card */}
              <div className="border-3 border-black bg-red-50 p-5 shadow-[3px_3px_0px_#000000]">
                <h4 className="text-xs font-mono font-black uppercase text-red-950 border-b border-black/20 pb-2 mb-3">
                  🚨 Duplicate Entry Check
                </h4>
                
                {detailed.duplicates.length > 0 ? (
                  <div className="space-y-2">
                    {detailed.duplicates.map(d => (
                      <div key={d.Title} className="bg-white border-2 border-red-500 p-3 shadow-[1.5px_1.5px_0px_#000]">
                        <div className="text-xs font-black text-red-900 uppercase leading-none">{d.Title}</div>
                        <div className="text-[10px] text-gray-500 mt-1">by {d.Author}</div>
                        <div className="font-mono text-[9px] font-black text-red-700 mt-2 bg-red-100/50 p-1 rounded-none border border-red-300">
                          Slot IDs matched: {d.IDs.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-green-700 font-bold font-mono text-xs flex flex-col items-center gap-2">
                    <span>✅ Hygiene check complete! No duplicate book titles found.</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
