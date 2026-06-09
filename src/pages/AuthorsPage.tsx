/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Book, BookGenre } from '../types';
import { AUTHOR_BIOS } from '../data/authorBios';
import { StatsService } from '../services/statsService';
import { 
  Search, 
  User, 
  ArrowLeft, 
  BookOpen, 
  Award, 
  Globe, 
  CheckSquare, 
  BookOpenCheck,
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';

interface AuthorsPageProps {
  books: Book[];
  bookGenres: BookGenre[];
  onViewBook: (bookId: string) => void;
}

export const AuthorsPage: React.FC<AuthorsPageProps> = ({
  books,
  bookGenres,
  onViewBook
}) => {
  // Page search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNationality, setSelectedNationality] = useState('');
  
  // Drill-down author selection state
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);

  // Helper: group books by author
  const authorGroups = React.useMemo(() => {
    const groups: Record<string, {
      books: Book[];
      nationality: string;
      primaryGenres: Set<string>;
      yearsSpan: { min: number; max: number };
    }> = {};

    books.forEach(b => {
      const auth = b.Author.trim();
      if (!auth) return;

      if (!groups[auth]) {
        groups[auth] = {
          books: [],
          nationality: b.AuthorNationality || 'Unknown',
          primaryGenres: new Set<string>(),
          yearsSpan: { min: b.PublishedYear, max: b.PublishedYear }
        };
      }

      groups[auth].books.push(b);
      
      if (b.PrimaryGenre) {
        groups[auth].primaryGenres.add(b.PrimaryGenre);
      }
      
      // Update year ranges
      if (b.PublishedYear < groups[auth].yearsSpan.min) {
        groups[auth].yearsSpan.min = b.PublishedYear;
      }
      if (b.PublishedYear > groups[auth].yearsSpan.max) {
        groups[auth].yearsSpan.max = b.PublishedYear;
      }
    });

    return groups;
  }, [books]);

  // Aggregate stats into an array of author items
  const authorsList = React.useMemo(() => {
    return Object.keys(authorGroups).map(name => {
      const info = authorGroups[name];
      const readCount = info.books.filter(b => b.ReadStatus === 'Read').length;
      const totalCount = info.books.length;
      const readRatio = totalCount > 0 ? readCount / totalCount : 0;
      
      // Find biographical data
      const bioMeta = AUTHOR_BIOS[name];
      const lifeSpan = bioMeta?.years || `${StatsService.formatYear(info.yearsSpan.min)} – ${StatsService.formatYear(info.yearsSpan.max)}`;
      const bioText = bioMeta?.about || null;
      const defaultThemes = bioMeta?.majorThemes || Array.from(info.primaryGenres).slice(0, 3);

      return {
        name,
        nationality: info.nationality,
        books: info.books,
        totalCount,
        readCount,
        readRatio,
        lifeSpan,
        bioText,
        genres: Array.from(info.primaryGenres),
        themes: defaultThemes,
        eraMin: info.yearsSpan.min,
        eraMax: info.yearsSpan.max
      };
    }).sort((a, b) => b.totalCount - a.totalCount || a.name.localeCompare(b.name));
  }, [authorGroups]);

  // Dynamic lists for filter options
  const uniqueNationalities = React.useMemo(() => {
    const nats = new Set<string>();
    authorsList.forEach(a => {
      if (a.nationality && a.nationality !== 'Unknown') {
        nats.add(a.nationality);
      }
    });
    return Array.from(nats).sort();
  }, [authorsList]);

  // Apply filters
  const filteredAuthors = authorsList.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.nationality.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNat = selectedNationality ? a.nationality === selectedNationality : true;
    return matchesSearch && matchesNat;
  });

  // Find the currently selected author record for detail view
  const activeAuthorDetails = authorsList.find(a => a.name === selectedAuthor);

  // Generate a procedural bio paragraph for fallback if no static bio exists
  const getProceduralBio = (author: typeof authorsList[0]) => {
    const formattedGenres = author.genres.slice(0, 2).join(' and ') || 'various genres';
    const eraText = author.eraMin === author.eraMax 
      ? `published in ${StatsService.formatYear(author.eraMin)}`
      : `active between ${StatsService.formatYear(author.eraMin)} and ${StatsService.formatYear(author.eraMax)}`;

    return `${author.name} is an esteemed writer of ${author.nationality} origin in your collection, known primarily for writing in the field of ${formattedGenres}. This bookshelf contains ${author.totalCount} registered work(s) ${eraText}, with a total reading progress of ${Math.round(author.readRatio * 100)}% completed.`;
  };

  // Helper to resolve condition color
  const getConditionColor = (cond: string) => {
    if (cond === 'Like New') return 'bg-[#90EE90]';
    if (cond === 'Good') return 'bg-[#ADD8E6]';
    if (cond === 'Fair') return 'bg-[#F0E68C]';
    return 'bg-[#FF6347]';
  };

  return (
    <div className="font-sans text-black pb-12">
      {activeAuthorDetails ? (
        /* DETAIL SUB-PAGE ROUTE */
        <div className="space-y-6">
          {/* Back Action Bar */}
          <button
            onClick={() => setSelectedAuthor(null)}
            className="flex items-center gap-2 border-2 border-black bg-white hover:bg-yellow-100 font-mono text-xs font-black uppercase px-4 py-2 shadow-[2.5px_2.5px_0_0_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer rounded-none"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            Return to Authors
          </button>

          {/* Master Profile Brutalist Frame */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Author Bio & Core statistics */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Author Face Card */}
              <div className="border-4 border-black bg-[#FFF7E8] p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFDB58] -rotate-[15deg] translate-x-8 -translate-y-8 border-l-4 border-b-4 border-black pointer-events-none opacity-20" />
                
                <div className="font-mono text-[10px] font-black text-[#FF4500] uppercase tracking-widest mb-1">
                  AUTHOR FACTSHEET
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase text-black leading-none italic select-all">
                  {activeAuthorDetails.name}
                </h2>
                <div className="text-xs font-bold text-gray-700 font-mono mt-1 mb-4">
                  {activeAuthorDetails.lifeSpan}
                </div>

                <div className="space-y-3.5 border-t-2 border-black pt-4">
                  <div className="flex items-center gap-2.5 text-xs font-bold">
                    <Globe className="w-4 h-4 stroke-[2.5] text-[#FF4500]" />
                    <span>Nationality:</span>
                    <strong className="font-mono bg-white border border-black px-1.5 py-0.5 font-black uppercase">
                      {activeAuthorDetails.nationality}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs font-bold">
                    <BookOpen className="w-4 h-4 stroke-[2.5]" />
                    <span>Works Logged:</span>
                    <strong className="font-mono bg-white border border-black px-1.5 py-0.5 font-black">
                      {activeAuthorDetails.totalCount} Volumes
                    </strong>
                  </div>

                  {/* Read statistics */}
                  <div className="border-t border-black/10 pt-3 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono font-black uppercase">
                      <span>Library Completion</span>
                      <span>{activeAuthorDetails.readCount} / {activeAuthorDetails.totalCount} READ</span>
                    </div>
                    {/* Retro Progress bar */}
                    <div className="w-full h-4 border-2 border-black bg-white rounded-none p-0.5">
                      <div 
                        className="h-full bg-emerald-400 border border-black" 
                        style={{ width: `${Math.max(activeAuthorDetails.readRatio * 100, 2)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Major thematic keywords box */}
              {activeAuthorDetails.themes && activeAuthorDetails.themes.length > 0 && (
                <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
                  <h4 className="text-xs font-mono font-black uppercase text-black border-b-2 border-black pb-1.5 mb-3 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-violet-600" />
                    LITERARY ACCENTS & THEMES
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeAuthorDetails.themes.map(theme => (
                      <span 
                        key={theme} 
                        className="px-2 py-1 font-mono text-[10px] font-black uppercase tracking-wider bg-violet-100 border border-black"
                      >
                        #{theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Detailed Biography & Library entries list */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Detailed bio */}
              <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-none">
                <h3 className="text-sm font-mono font-black uppercase text-black border-b-4 border-black pb-2 mb-4">
                  Biography & Summary
                </h3>
                <p className="text-gray-900 leading-relaxed text-sm font-medium">
                  {activeAuthorDetails.bioText || getProceduralBio(activeAuthorDetails)}
                </p>
                
                {/* Visual quote stamp */}
                <div className="bg-[#FFF7E8] border border-black p-4 text-[11px] font-mono leading-relaxed mt-6 italic font-bold">
                  * Core metadata compiled from your library holdings, spanning publication years from {StatsService.formatYear(activeAuthorDetails.eraMin)} to {StatsService.formatYear(activeAuthorDetails.eraMax)}.
                </div>
              </div>

              {/* Books by this Author listed in library */}
              <div className="space-y-3">
                <h3 className="text-sm font-mono font-black uppercase tracking-wider text-black pl-1">
                  Books by {activeAuthorDetails.name} in Your Collection ({activeAuthorDetails.books.length})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeAuthorDetails.books.map(book => (
                    <div 
                      key={book.BookID}
                      onClick={() => onViewBook(book.BookID)}
                      className="border-3 border-black bg-white p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        {/* Upper row classification code */}
                        <div className="flex justify-between items-center text-[9px] font-mono font-black uppercase text-gray-500">
                          <span>{book.BookID} • {book.PrimaryGenre}</span>
                          <span>{book.PublishedYear > 0 ? book.PublishedYear : 'N/A'}</span>
                        </div>
                        <h4 className="text-sm font-black text-black tracking-tight mt-1 line-clamp-1 uppercase group-hover:text-amber-600">
                          {book.Title}
                        </h4>
                        <div className="text-[10px] text-gray-600 font-bold mt-0.5">
                          Format: <strong className="font-black text-black uppercase text-[9px]">{book.Format}</strong> • {book.PageCount} pgs
                        </div>
                      </div>

                      {/* Read status & condition indicators */}
                      <div className="flex justify-between items-center mt-4 pt-2 border-t border-black/10 text-[9px] font-mono font-black">
                        <span className={`px-1.5 py-0.5 border border-black ${getConditionColor(book.Condition)}`}>
                          {book.Condition}
                        </span>
                        
                        <div className="flex items-center gap-1 bg-[#F5F5F5] border border-black px-1.5 py-0.5">
                          {book.ReadStatus === 'Read' ? (
                            <>
                              <BookOpenCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">READ</span>
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-3.5 h-3.5 text-gray-600" />
                              <span className="text-gray-600">UNREAD</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* MASTER LIST VIEW */
        <div className="space-y-6">
          
          {/* Header Title Information card */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-4 border-black bg-[#FF4500] text-white p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-none">
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white flex items-center gap-2.5">
                <User className="w-6 h-6 stroke-[3] text-white" />
                Author Directory & Bios
              </h2>
              <p className="text-xs mt-2 max-w-xl font-bold font-mono uppercase tracking-tight text-yellow-200">
                Browse detailed profiles, lifespan histories, and read completeness of authors in your personal collection.
              </p>
            </div>
            <div className="font-mono text-xs font-black text-black bg-white border-4 border-black inline-block px-4 py-2 shadow-[3px_3px_0_0_rgba(0,0,0,1)] rounded-none">
              REPRESENTED: {authorsList.length} AUTHORS
            </div>
          </div>

          {/* Filtering and search control bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-4 border-black bg-white p-4 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
            {/* Filter Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-black stroke-[2.5]" />
              </span>
              <input
                id="author-search"
                type="text"
                placeholder="Search authors by name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-4 border-black bg-white font-sans text-xs font-bold rounded-none focus:outline-none focus:bg-[#FFF7E8]"
              />
            </div>

            {/* Filter Nationality */}
            <div>
              <select
                value={selectedNationality}
                onChange={e => setSelectedNationality(e.target.value)}
                className="w-full border-4 border-black bg-white px-2.5 py-1.5 font-mono text-xs font-black rounded-none focus:outline-none focus:bg-[#FFF7E8]"
              >
                <option value="">-- All Nationalities --</option>
                {uniqueNationalities.map(nat => (
                  <option key={nat} value={nat}>{nat}</option>
                ))}
              </select>
            </div>

            {/* Fast Summary status metrics */}
            <div className="flex items-center justify-end font-mono text-[10px] font-black text-right pr-2">
              <span className="text-black uppercase tracking-wide">
                Showing {filteredAuthors.length} out of {authorsList.length} authors
              </span>
            </div>
          </div>

          {/* Authors List Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuthors.map(author => {
              const mainGenre = author.genres[0] || 'Unknown';
              
              // Determine background class based on volume count
              let countBadgeColor = 'bg-[#FFD700]';
              if (author.totalCount >= 5) countBadgeColor = 'bg-[#FF4500] text-white';
              else if (author.totalCount >= 3) countBadgeColor = 'bg-[#ADD8E6]';

              return (
                <div
                  key={author.name}
                  onClick={() => setSelectedAuthor(author.name)}
                  className="border-4 border-black bg-white hover:bg-[#FFF7E8] p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] cursor-pointer flex flex-col justify-between transition-all duration-150 relative group"
                >
                  <div>
                    {/* Header Name & Nationality Flag */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="font-mono text-[9px] font-black uppercase text-[#FF4500] flex items-center gap-1">
                          <Globe className="w-3 h-3 text-black" />
                          {author.nationality}
                        </div>
                        <h3 className="text-lg font-black text-black uppercase tracking-tight leading-none mt-1 line-clamp-1 group-hover:text-[#FF4500]">
                          {author.name}
                        </h3>
                      </div>
                      
                      {/* Count circle badge */}
                      <span className={`font-mono text-[10px] font-black px-2 py-1 border-2 border-black inline-block ${countBadgeColor}`}>
                        {author.totalCount} {author.totalCount === 1 ? 'Book' : 'Books'}
                      </span>
                    </div>

                    {/* Timeline range and main genres */}
                    <p className="text-[10px] font-mono italic text-gray-600 mt-2">
                      Active: {author.lifeSpan}
                    </p>

                    <p className="text-xs font-semibold text-gray-800 line-clamp-2 mt-3 block leading-relaxed">
                      {author.bioText || `Esteemed author of ${author.nationality} literature. You own ${author.totalCount} works in your collection including ${mainGenre}.`}
                    </p>
                  </div>

                  {/* Footer Stats Row */}
                  <div className="border-t border-black/10 pt-4 mt-4 flex items-center justify-between text-[10px] font-mono font-black">
                    <span className="flex items-center gap-1.5 text-black">
                      <CheckSquare className="w-4 h-4 text-emerald-600 stroke-[3.5]" />
                      <span>{author.readCount} / {author.totalCount} READ</span>
                    </span>
                    
                    <span className="text-[#FF4500] uppercase tracking-wider font-extrabold flex items-center gap-1 group-hover:underline">
                      view profile 
                      <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  </div>

                </div>
              );
            })}
          </div>

          {filteredAuthors.length === 0 && (
            <div className="border-4 border-black bg-white p-12 text-center shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-none">
              <User className="w-12 h-12 text-black mx-auto stroke-[2.5] mb-4" />
              <h3 className="text-xl font-black uppercase text-black italic">No Authors Found</h3>
              <p className="text-xs text-gray-800 mt-2 max-w-sm mx-auto font-medium">
                No authors match your active search name or origin selection filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedNationality('');
                }}
                className="mt-6 border-4 border-black bg-[#FFD700] hover:bg-black hover:text-white px-5 py-2.5 font-mono text-xs font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer rounded-none"
              >
                Clear all filters
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
