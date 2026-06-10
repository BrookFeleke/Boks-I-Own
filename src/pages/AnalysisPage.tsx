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

type ActiveSection = 'identity' | 'history' | 'genres' | 'publishers' | 'physical' | 'quality' | 'relations' | 'science';

export const AnalysisPage: React.FC<AnalysisPageProps> = ({
  books,
  bookGenres,
  onViewBook,
  onNavigateToTaxonomies,
  onViewAuthor
}) => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('identity');
  
  // Pivot Matrix factors
  const [pivotXKey, setPivotXKey] = useState<keyof Book>('Format');
  const [pivotYKey, setPivotYKey] = useState<keyof Book>('ReadStatus');

  // Interactive Scatter hover reference
  const [hoveredCircle, setHoveredCircle] = useState<Book | null>(null);

  // Volumetric Histogram state
  const [selectedHistBin, setSelectedHistBin] = useState<string | null>(null);

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
    { id: 'quality', title: 'Catalog Checklist', icon: CheckSquare, color: 'bg-[#FFF7E8]' },
    { id: 'relations', title: 'Correlations & Scatter', icon: TrendingUp, color: 'bg-indigo-200' },
    { id: 'science', title: 'Entropy & Demographics', icon: Sparkles, color: 'bg-pink-200' }
  ];

  // Pivot-friendly keys metadata
  const pivotableFields: { key: keyof Book; label: string }[] = [
    { key: 'ContentType', label: 'Fiction / Non-Fiction' },
    { key: 'ReadStatus', label: 'Read / Unread Status' },
    { key: 'Format', label: 'Book Binding Format' },
    { key: 'Condition', label: 'Aesthetic Condition' },
    { key: 'LiteraryPeriod', label: 'Literary Period' },
    { key: 'PrimaryGenre', label: 'Primary Genre Category' },
    { key: 'WorkType', label: 'Work Form / Type' }
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
      <div className="grid grid-cols-2 md:grid-cols-8 gap-2 border-4 border-black bg-[#FFF7E8] p-3 shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-none">
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

        {/* ==================================================================== */}
        {/* SECTION G: ENTITY CORRELATIONS & INTERACTIVE SCATTER */}
        {/* ==================================================================== */}
        {activeSection === 'relations' && (() => {
          const correlation = StatsService.getYearPageCorrelation(books);
          const pivotData = StatsService.getPivotMatrix(books, pivotXKey, pivotYKey);
          
          // Filter scatter points
          const scatterBooks = books.filter(b => b.PublishedYear && b.PageCount && b.PageCount > 5);
          const years = scatterBooks.map(b => b.PublishedYear);
          const pages = scatterBooks.map(b => b.PageCount);
          const minYear = years.length ? Math.min(...years) : 1800;
          const maxYear = years.length ? Math.max(...years) : 2026;
          const minPages = pages.length ? Math.min(...pages) : 0;
          const maxPages = pages.length ? Math.max(...pages) : 1000;
          
          // Safe coordinates buffers
          const padYear = maxYear === minYear ? 10 : (maxYear - minYear) * 0.1;
          const padPage = maxPages === minPages ? 100 : (maxPages - minPages) * 0.1;

          const startYear = minYear - padYear;
          const endYear = maxYear + padYear;
          const startPage = Math.max(0, minPages - padPage);
          const endPage = maxPages + padPage;

          // SVG geometry mappers
          const svgW = 500;
          const svgH = 260;
          const pL = 55;
          const pR = 25;
          const pT = 20;
          const pB = 35;

          const getX = (val: number) => {
            const range = endYear - startYear;
            if (range === 0) return pL + (svgW - pL - pR) / 2;
            return pL + ((val - startYear) / range) * (svgW - pL - pR);
          };

          const getY = (val: number) => {
            const range = endPage - startPage;
            if (range === 0) return svgH - pB - (svgH - pT - pB) / 2;
            return svgH - pB - ((val - startPage) / range) * (svgH - pT - pB);
          };

          // Generate grid axis points
          const yearTicks = 4;
          const pageTicks = 4;
          const yearGrid = Array.from({ length: yearTicks }).map((_, i) => startYear + (i * (endYear - startYear)) / (yearTicks - 1));
          const pageGrid = Array.from({ length: pageTicks }).map((_, i) => startPage + (i * (endPage - startPage)) / (pageTicks - 1));

          // Draw linear regression trendline parameters
          const lineY1 = correlation.slope * startYear + correlation.intercept;
          const lineY2 = correlation.slope * endYear + correlation.intercept;

          return (
            <div className="space-y-8 animate-fade-in text-black">
              {/* Heading */}
              <div className="border-b-4 border-black pb-3">
                <h3 className="text-xl font-black uppercase text-black">📈 Relational Data Correlations</h3>
                <p className="text-xs text-[#FF4500] font-mono font-bold uppercase mt-1">Cross-analyzing historical variables & coordinate structures</p>
              </div>

              {/* Grid 2-columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. SVG Scatter Plot Card */}
                <div className="border-4 border-black bg-white p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)] flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-black uppercase text-black border-b-2 border-black pb-2 mb-4 flex justify-between items-center">
                      <span>Timeline Entropy (Publication Year vs. Pages)</span>
                      <span className="text-[9px] bg-[#90EE90] px-1.5 border border-black uppercase font-bold text-black font-mono">Bivariate Map</span>
                    </h4>

                    {scatterBooks.length < 2 ? (
                      <div className="py-12 text-center text-xs font-mono italic text-gray-400">
                        Please record at least 2 books with valid page ratings & year details.
                      </div>
                    ) : (
                      <div className="relative">
                        {/* Dynamic Interactive SVG Container */}
                        <div className="bg-[#FFFCEE] border-2 border-black p-2 relative">
                          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto select-none overflow-visible">
                            
                            {/* Horizontal grid lines */}
                            {pageGrid.map((pageVal, i) => {
                              const cy = getY(pageVal);
                              return (
                                <g key={`h-grid-${i}`} className="opacity-45">
                                  <line x1={pL} y1={cy} x2={svgW - pR} y2={cy} stroke="#ddd" strokeWidth="1" strokeDasharray="3 3" />
                                  <text x={pL - 8} y={cy + 3} textAnchor="end" className="fill-gray-600 font-mono text-[8px] font-semibold">
                                    {Math.round(pageVal)}p
                                  </text>
                                </g>
                              );
                            })}

                            {/* Vertical grid lines */}
                            {yearGrid.map((yearVal, i) => {
                              const cx = getX(yearVal);
                              return (
                                <g key={`v-grid-${i}`} className="opacity-45">
                                  <line x1={cx} y1={pT} x2={cx} y2={svgH - pB} stroke="#ddd" strokeWidth="1" strokeDasharray="3 3" />
                                  <text x={cx} y={svgH - pB + 12} textAnchor="middle" className="fill-gray-600 font-mono text-[8px] font-semibold">
                                    {Math.round(yearVal)}
                                  </text>
                                </g>
                              );
                            })}

                            {/* Main coordinate axes */}
                            <line x1={pL} y1={svgH - pB} x2={svgW - pR} y2={svgH - pB} stroke="#000" strokeWidth="2.5" />
                            <line x1={pL} y1={pT} x2={pL} y2={svgH - pB} stroke="#000" strokeWidth="2.5" />

                            {/* Regressive linear model line if correlated */}
                            {correlation.pointsCount >= 2 && (
                              <line
                                x1={getX(startYear)}
                                y1={getY(lineY1)}
                                x2={getX(endYear)}
                                y2={getY(lineY2)}
                                stroke="#FF4500"
                                strokeWidth="3"
                                strokeDasharray="5 3"
                                className="opacity-80"
                                title="Least-Squares Regression Trendline"
                              />
                            )}

                            {/* Book coordinate circles */}
                            {scatterBooks.map(b => {
                              const cx = getX(b.PublishedYear);
                              const cy = getY(b.PageCount);
                              const isHovered = hoveredCircle?.BookID === b.BookID;
                              return (
                                <circle
                                  key={b.BookID}
                                  cx={cx}
                                  cy={cy}
                                  r={isHovered ? 8 : 4.5}
                                  onMouseEnter={() => setHoveredCircle(b)}
                                  onMouseLeave={() => setHoveredCircle(null)}
                                  onClick={() => onViewBook(b.BookID)}
                                  className={`stroke-black cursor-pointer transition-all duration-150 ${
                                    isHovered 
                                      ? 'fill-red-500 stroke-[3]' 
                                      : 'fill-amber-300 stroke-2 hover:fill-amber-400'
                                  }`}
                                />
                              );
                            })}
                          </svg>
                        </div>

                        {/* Hover Overlay Detail Inspector */}
                        <div className="mt-3 p-3 bg-neutral-900 text-white border-2 border-black font-mono text-[10px] leading-relaxed rounded-none select-none min-h-[52px] flex items-center justify-between">
                          {hoveredCircle ? (
                            <div className="w-full flex justify-between items-center">
                              <div>
                                <span className="text-amber-400 font-black uppercase">🔍 TARGET POINT:</span>{' '}
                                <strong className="font-extrabold text-white text-[11px] block md:inline uppercase">{hoveredCircle.Title}</strong>
                                <span className="text-gray-400 block md:inline md:ml-2">by {hoveredCircle.Author}</span>
                              </div>
                              <div className="shrink-0 text-right">
                                <span className="text-emerald-400 font-black block">{hoveredCircle.PageCount} Pages</span>
                                <span className="text-gray-400 block">Published {StatsService.formatYear(hoveredCircle.PublishedYear)}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-400 italic text-center w-full">
                              💡 Hover over any scatter point coordinate on the cartesian graph to execute full metadata inspection.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Analyst commentary on Pearson R */}
                  <div className="mt-4 p-4 bg-indigo-50 border-2 border-dashed border-indigo-900 rounded-none font-mono text-[10px] leading-relaxed">
                    <h5 className="font-black uppercase text-indigo-950 flex items-center gap-1">
                      🔬 Pearson Correlation Quotient (R value)
                    </h5>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mt-2">
                      <div>
                        <div className="text-sm font-black text-indigo-950 font-sans">
                          r = <span className="text-indigo-600 text-base">{correlation.r}</span>
                        </div>
                        <p className="text-gray-600 mt-0.5 uppercase font-bold text-[9px]">
                          Slope: {correlation.slope} • Intercept: {correlation.intercept}
                        </p>
                      </div>
                      <div className="bg-indigo-900 text-white border border-black font-black uppercase tracking-wide text-[8px] px-2 py-1 select-none">
                        {correlation.classification}
                      </div>
                    </div>
                    <p className="text-gray-600 mt-3 text-[9px] font-sans font-semibold leading-relaxed">
                      This index calculates the linear relationship strength between publication dates and page lengths. A strong positive value shows literary volumes grew thicker chronologically, while a negative value shows modern formats are more condensed.
                    </p>
                  </div>
                </div>

                {/* 2. Cross-Tabulation Pivot Heatmap Matrix */}
                <div className="border-4 border-black bg-white p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)] flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-black uppercase text-black border-b-2 border-black pb-2 mb-4 flex justify-between items-center">
                      <span>Categorical Relationship matrix (Pivot Cross-Tab)</span>
                      <span className="text-[9px] bg-[#EBF5FB] px-1.5 border border-black uppercase font-bold text-black font-mono">Heatmap</span>
                    </h4>

                    {/* Factor selectors layout */}
                    <div className="grid grid-cols-2 gap-3 mb-4 font-mono text-[10px]">
                      <div>
                        <label className="block font-black uppercase text-neutral-600 mb-1">Row Dimension (X-Axis):</label>
                        <select
                          value={pivotXKey}
                          onChange={(e) => setPivotXKey(e.target.value as keyof Book)}
                          className="w-full bg-white border-2 border-black p-1 font-mono text-[10px] font-black outline-none focus:bg-yellow-50"
                        >
                          {pivotableFields.map(f => (
                            <option key={`piv-x-${f.key}`} value={f.key}>{f.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-black uppercase text-neutral-600 mb-1">Column Dimension (Y-Axis):</label>
                        <select
                          value={pivotYKey}
                          onChange={(e) => setPivotYKey(e.target.value as keyof Book)}
                          className="w-full bg-white border-2 border-black p-1 font-mono text-[10px] font-black outline-none focus:bg-yellow-50"
                        >
                          {pivotableFields.map(f => (
                            <option key={`piv-y-${f.key}`} value={f.key} disabled={f.key === pivotXKey}>{f.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Matrix Cross-Tab layout */}
                    <div className="overflow-x-auto border-2 border-black bg-white">
                      <table className="w-full text-left font-mono border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-neutral-150 border-b-2 border-black">
                            <th className="p-2 border-r-2 border-black bg-[#FFF7E8] font-black uppercase text-[9px] text-neutral-700">Rows \ Cols</th>
                            {pivotData.yAxisLabels.map(yLabel => (
                              <th key={`th-col-${yLabel}`} className="p-2 border-r border-black font-black uppercase text-neutral-900 text-center bg-gray-50 text-[9px] truncate max-w-[80px]" title={yLabel}>
                                {yLabel}
                              </th>
                            ))}
                            <th className="p-2 font-black uppercase text-center bg-neutral-900 text-white text-[9px]">TOTAL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pivotData.xAxisLabels.map(xLabel => {
                            const rowTotal = pivotData.xTotals[xLabel] || 0;
                            return (
                              <tr key={`tr-row-${xLabel}`} className="border-b border-black/30 hover:bg-yellow-50/50">
                                <td className="p-2 font-black text-black bg-[#FFF7E8]/60 border-r-2 border-black/95 text-[9px] truncate max-w-[90px]" title={xLabel}>
                                  {xLabel}
                                </td>
                                {pivotData.yAxisLabels.map(yLabel => {
                                  const cellCount = pivotData.matrix[xLabel][yLabel] || 0;
                                  const cellRatio = pivotData.grandTotal > 0 ? cellCount / pivotData.grandTotal : 0;
                                  
                                  // Determine visual heat intensity
                                  let hBg = 'bg-white';
                                  let hText = 'text-black font-medium';
                                  if (cellRatio > 0.3) {
                                    hBg = 'bg-indigo-500';
                                    hText = 'text-white font-black';
                                  } else if (cellRatio > 0.15) {
                                    hBg = 'bg-indigo-300';
                                    hText = 'text-black font-black';
                                  } else if (cellRatio > 0.05) {
                                    hBg = 'bg-indigo-100';
                                    hText = 'text-indigo-950 font-bold';
                                  } else if (cellRatio > 0) {
                                    hBg = 'bg-indigo-50';
                                    hText = 'text-indigo-800 font-bold';
                                  }

                                  return (
                                    <td 
                                      key={`td-cell-${xLabel}-${yLabel}`} 
                                      className={`p-2 border-r border-black/30 text-center ${hBg} ${hText}`}
                                      title={`${cellCount} books match: row="${xLabel}", col="${yLabel}" (${Math.round(cellRatio*100)}% of library)`}
                                    >
                                      {cellCount}
                                      {cellCount > 0 && (
                                        <span className="block text-[8px] opacity-60 font-semibold">{Math.round(cellRatio * 100)}%</span>
                                      )}
                                    </td>
                                  );
                                })}
                                <td className="p-2 font-black text-center bg-gray-100 border-l border-black text-xs">
                                  {rowTotal}
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="bg-gray-100 font-black border-t-2 border-black">
                            <td className="p-2 border-r-2 border-black text-xs uppercase text-neutral-805">TOTAL</td>
                            {pivotData.yAxisLabels.map(yLabel => {
                              const colTotal = pivotData.yTotals[yLabel] || 0;
                              return (
                                <td key={`total-col-${yLabel}`} className="p-2 border-r border-black/30 text-center text-xs">
                                  {colTotal}
                                </td>
                              );
                            })}
                            <td className="p-2 text-center bg-black text-[#FFD700] text-xs font-black">
                              {pivotData.grandTotal}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-500 font-semibold leading-relaxed mt-4 bg-amber-50 p-2.5 border border-black/15 font-sans">
                    💡 Pivot cross-tabulations identify conditional patterns within your inventory. For instance, cross-referencing <strong>"Book Binding Format"</strong> vs <strong>"Read / Unread Status"</strong> can expose an empirical bias toward reading certain formats over others.
                  </p>
                </div>

              </div>
            </div>
          );
        })()}

        {/* ==================================================================== */}
        {/* SECTION H: ENTROPY & DEMOGRAPHICS SCIENCE */}
        {/* ==================================================================== */}
        {activeSection === 'science' && (() => {
          const giniStats = StatsService.getGenreGiniEntropy(books);
          const histogramBuckets = StatsService.getPageCountDensity(books);

          return (
            <div className="space-y-8 animate-fade-in text-black">
              {/* Heading */}
              <div className="border-b-4 border-black pb-3">
                <h3 className="text-xl font-black uppercase text-gray-950">🔮 Entropy & Physical Demographics</h3>
                <p className="text-xs text-[#FF4500] font-mono font-bold uppercase mt-1">Analyzing categorization Gini index and volumetric sizing histograms</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. Gini Impurity Variety Analyzer */}
                <div className="border-4 border-black bg-white p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)] space-y-5">
                  <h4 className="text-xs font-mono font-black uppercase text-black border-b-2 border-black pb-1.5 flex justify-between items-center">
                    <span>Genre Gini-Diversity Rating</span>
                    <span className="text-[9px] bg-pink-100 px-1.5 border border-black uppercase font-bold text-black font-mono">System Entropy</span>
                  </h4>

                  <div className="flex flex-col md:flex-row items-center gap-6 bg-[#FFF9F2] border-2 border-black p-5 relative">
                    {/* Retro Progress Circular representation */}
                    <div className="relative shrink-0 w-28 h-28 flex items-center justify-center bg-white border-2 border-black rounded-full shadow-[3px_3px_0_0_rgba(0,0,0,1)] text-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" className="stroke-gray-100 stroke-[10] fill-none" />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          className="stroke-pink-500 stroke-[10] fill-none" 
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 * (1 - giniStats.gini)} 
                          strokeLinecap="square"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 select-none">
                        <span className="block font-mono text-[8px] text-gray-500 font-extrabold uppercase leading-none">GINI INDEX</span>
                        <strong className="text-lg font-black text-black mt-0.5 block leading-none">{giniStats.gini}</strong>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-black text-pink-600 bg-pink-50 border border-pink-500 px-2 py-0.5 rounded uppercase tracking-wider block w-fit">
                        {giniStats.classification.split(' (')[0]}
                      </span>
                      <h5 className="text-sm font-black uppercase leading-tight text-neutral-900 tracking-tight">
                        {giniStats.uniqueCount} Primary Genre Categories Detected
                      </h5>
                      <p className="text-xs font-mono font-semibold text-gray-600 leading-normal">
                        {giniStats.classification.includes('Polymath') 
                          ? "Your shelf exhibits very high content variety. You are a highly dynamic, interdisciplinary generalist who cross-examines multiple literary periods and philosophies without singular genre containment."
                          : giniStats.classification.includes('Specialist')
                          ? "Your collection targets select fields in detail. You build heavy specialist density, establishing complete historical subject matter mastery in a targeted set of literary subjects."
                          : "Your catalog balances selective subject targets with generalist exploration. You possess core intellectual pillars without sacrificing secondary exploration."}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border-2 border-black bg-white rounded-none space-y-3">
                    <h5 className="font-mono text-[10px] font-black uppercase text-gray-700">How to interpret this index?</h5>
                    <p className="font-sans text-xs text-gray-600 leading-relaxed font-semibold">
                      The Gini Impurity index measures label dispersion under static datasets. <strong>A value of 0.0</strong> represents a pure monopoly where every single book on your ledger is labeled exactly the same genre. <strong>A value approaching 1.0</strong> represents maximum balance (or infinite diversity), indicating your selections are distributed perfectly across a multitude of distinct taxonomies.
                    </p>
                  </div>
                </div>

                {/* 2. Page Count Density Volumetric Histogram */}
                <div className="border-4 border-black bg-white p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)] flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-xs font-mono font-black uppercase text-black border-b-2 border-black pb-1.5 flex justify-between items-center">
                      <span>Volume Page-Length Histogram</span>
                      <span className="text-[9px] bg-emerald-100 px-1.5 border border-black uppercase font-bold text-black font-mono">Book Sizing</span>
                    </h4>

                    {/* Interactive SVG bar chart */}
                    <div className="bg-[#EEFBF0] border-2 border-black p-3 my-2 select-none relative">
                      <svg viewBox="0 0 450 180" className="w-full h-auto overflow-visible">
                        {/* Horizontal guides lines */}
                        {[25, 50, 75, 100].map((tick, idx) => (
                          <g key={`hg-tick-${idx}`} className="opacity-30">
                            <line x1="20" y1={140 - (tick * 1.2)} x2="430" y2={140 - (tick * 1.2)} stroke="#a3e635" strokeWidth="1" strokeDasharray="2 2" />
                            <text x="15" y={143 - (tick * 1.2)} textAnchor="end" className="fill-emerald-800 font-mono text-[7px] font-black">{tick}%</text>
                          </g>
                        ))}

                        {/* Histogram Bars */}
                        {histogramBuckets.map((bucket, idx) => {
                          const barH = bucket.percentage * 1.2;
                          const barW = 75;
                          const gap = 20;
                          const barX = 35 + idx * (barW + gap);
                          const barY = 140 - barH;
                          const isSelected = selectedHistBin === bucket.id;

                          return (
                            <g 
                              key={`hist-bar-${bucket.id}`}
                              className="cursor-pointer"
                              onClick={() => setSelectedHistBin(selectedHistBin === bucket.id ? null : bucket.id)}
                            >
                              {/* Background highlight */}
                              <rect
                                x={barX - 4}
                                y={10}
                                width={barW + 8}
                                height={145}
                                className={`fill-transparent transition-colors ${isSelected ? 'fill-emerald-500/10' : 'hover:fill-emerald-500/5'}`}
                              />
                              {/* Actual bar */}
                              <rect
                                x={barX}
                                y={barY}
                                width={barW}
                                height={barH}
                                className={`stroke-black stroke-2 transition-colors ${isSelected ? 'fill-emerald-400' : 'fill-lime-300 hover:fill-lime-400'}`}
                              />
                              {/* Percentage Tag */}
                              <text 
                                x={barX + barW/2} 
                                y={barY - 6} 
                                textAnchor="middle" 
                                className="fill-black font-mono text-[9px] font-black"
                              >
                                {bucket.count} ({bucket.percentage}%)
                              </text>
                              {/* Label Bottom */}
                              <text 
                                x={barX + barW/2} 
                                y="152" 
                                textAnchor="middle" 
                                className="fill-emerald-950 font-sans font-black text-[7px]"
                              >
                                {bucket.id === 'pocket' ? 'Brief (<200)' : bucket.id === 'standard' ? 'Standard (200-399)' : bucket.id === 'extensive' ? 'Tome (400-599)' : 'Epic (605+)'}
                              </text>
                            </g>
                          );
                        })}

                        {/* Baseline */}
                        <line x1="20" y1="140" x2="430" y2="140" stroke="#000" strokeWidth="2.5" />
                      </svg>
                    </div>

                    <p className="text-[10px] text-gray-500 font-mono text-center font-bold">
                      💡 Click on any histogram bar above to isolate and filter specific books of that page range.
                    </p>

                    {/* Expandable Isolated Shelf Panel */}
                    {selectedHistBin && (() => {
                      const matchedBin = histogramBuckets.find(b => b.id === selectedHistBin);
                      if (!matchedBin) return null;
                      return (
                        <div className="mt-3 p-3 border-2 border-emerald-500 bg-emerald-50 max-h-[160px] overflow-y-auto rounded-none">
                          <h5 className="font-mono text-[9px] font-black uppercase text-emerald-900 border-b border-emerald-300 pb-1 mb-2 flex justify-between">
                            <span>Isolated books matching range ({matchedBin.books.length} items)</span>
                            <button onClick={() => setSelectedHistBin(null)} className="hover:text-red-650 cursor-pointer font-black underline select-none text-[8px] uppercase">Close</button>
                          </h5>
                          {matchedBin.books.length === 0 ? (
                            <p className="text-[10px] italic text-zinc-400">No matching items registered in this bracket.</p>
                          ) : (
                            <div className="space-y-1">
                              {matchedBin.books.map(b => (
                                <div 
                                  key={`isolated-${b.BookID}`}
                                  onClick={() => onViewBook(b.BookID)}
                                  className="p-1 px-2 border border-emerald-300 bg-white hover:bg-yellow-100 cursor-pointer text-[10px] font-bold flex justify-between"
                                >
                                  <span className="truncate">{b.Title}</span>
                                  <span className="font-mono text-[9px] text-[#FF4500] font-black">{b.PageCount}p</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <p className="text-[10px] text-zinc-650 leading-relaxed font-sans font-semibold bg-gray-50 p-2 border border-black/15">
                    Analyzing page counts is highly useful for determining commitment densities. Pocket books offer high visual-completion speeds, whereas Epic volumes indicate profound focus spans.
                  </p>
                </div>

              </div>
            </div>
          );
        })()}

      </div>

    </div>
  );
};
