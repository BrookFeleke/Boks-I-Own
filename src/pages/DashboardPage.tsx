/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Book, BookGenre } from '../types';
import { StatsService } from '../services/statsService';
import { 
  RetroBarChart, 
  RetroDonutChart, 
  CollectionTimeline 
} from '../components/charts/RetroCharts';
import { VisualExtras } from '../components/layout/VisualExtras';
import { 
  BookOpen, 
  History, 
  UserSquare2, 
  Layers, 
  CheckCircle, 
  BookMarked,
  Hourglass
} from 'lucide-react';

interface DashboardPageProps {
  books: Book[];
  bookGenres: BookGenre[];
  onNavigateToLibrary: () => void;
  onNavigateToAddBook: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  books,
  bookGenres,
  onNavigateToLibrary,
  onNavigateToAddBook
}) => {
  const stats = StatsService.computeDashboardStats(books, bookGenres);

  // Distribution datasets
  const genreDist = StatsService.getGenreDistribution(books, bookGenres);
  const eraDist = StatsService.getLiteraryPeriodDistribution(books);
  const natDist = StatsService.getNationalityDistribution(books);
  const centuryDist = StatsService.getCenturyTimeline(books);

  // Fiction / Non-Fiction Donut Data
  const contentTypeData = [
    { name: 'Fiction', count: stats.fictionCount },
    { name: 'Non-Fiction', count: stats.nonFictionCount }
  ];

  // Map timeline books (top 15 books) for the timeline strip
  const timelineBooks = books.map(b => ({
    Title: b.Title,
    PublishedYear: b.PublishedYear,
    Author: b.Author
  }));

  return (
    <div className="space-y-8 pb-12 font-sans text-black">
      
      {/* 1. Header Banner */}
      <div className="border-4 border-black bg-[#FFD700] p-6 md:p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        {/* Abstract retro grid texture inside header */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[repeating-linear-margins:-45deg,#000,#000_2px,transparent_2px,transparent_10px] opacity-10 pointer-events-none hidden md:block" />
        
        <div className="max-w-2xl z-10">
          <div className="font-mono text-xs font-black text-white bg-black border-2 border-black inline-block px-3 py-1 uppercase tracking-widest mb-3 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            PERSONAL COLLECTION
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-black leading-none">
            MY BOOKSHELF DASHBOARD
          </h2>
          <p className="text-sm font-bold text-black mt-3 max-w-xl leading-relaxed">
            A beautiful home for your personal book collection. Track your readings, discover trends across publication eras, and explore the details of every volume on your shelves.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 z-10">
          <button
            id="dash-add-book"
            onClick={onNavigateToAddBook}
            className="bg-[#FF4500] hover:bg-black hover:text-[#FFD700] active:translate-x-[2px] active:translate-y-[2px] text-white font-mono text-xs font-black uppercase px-5 py-3 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none cursor-pointer transition-all duration-150"
          >
            + Add New Edition
          </button>
          <button
            id="dash-view-catalog"
            onClick={onNavigateToLibrary}
            className="bg-white hover:bg-black hover:text-white active:translate-x-[2px] active:translate-y-[2px] text-black font-mono text-xs font-black uppercase px-5 py-3 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none cursor-pointer transition-all duration-150"
          >
            Explore Catalog
          </button>
        </div>
      </div>

      {/* 2. Core Numerical Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* TOTAL BOOKS */}
        <div className="border-4 border-black bg-[#FF6347] p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all">
          <div className="flex items-center gap-2 text-black mb-1 opacity-80">
            <BookOpen className="w-4 h-4 text-black stroke-[3]" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Total Collection</span>
          </div>
          <div className="text-5xl font-black italic tracking-tighter text-black leading-none">{stats.totalBooks}</div>
          <div className="font-mono text-[10px] font-black text-black uppercase mt-2">
            BOOKS REGISTERED
          </div>
        </div>

        {/* TOTAL READ ATTEMPTS */}
        <div className="border-4 border-black bg-[#90EE90] p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all">
          <div className="flex items-center gap-2 text-black mb-1 opacity-80">
            <CheckCircle className="w-4 h-4 text-black stroke-[3]" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Completed Reads</span>
          </div>
          <div className="text-5xl font-black italic tracking-tighter text-black leading-none">{stats.booksRead}</div>
          <div className="font-mono text-[10px] font-black text-black uppercase mt-2">
            {Math.round((stats.booksRead / stats.totalBooks) * 100)}% COLLECTION READ
          </div>
        </div>

        {/* TOTAL PAGES ARCHIVED */}
        <div className="border-4 border-black bg-[#ADD8E6] p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all">
          <div className="flex items-center gap-2 text-black mb-1 opacity-80">
            <Layers className="w-4 h-4 text-black stroke-[3]" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Total Pages</span>
          </div>
          <div className="text-5xl font-black italic tracking-tighter text-black leading-none">
            {stats.totalPages >= 1000 ? `${Math.round(stats.totalPages / 100) / 10}k` : stats.totalPages}
          </div>
          <div className="font-mono text-[10px] font-black text-black uppercase mt-2">
            PAGES ON SHELVES
          </div>
        </div>

        {/* UNIQUE WRITERS */}
        <div className="border-4 border-black bg-[#F0E68C] p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all">
          <div className="flex items-center gap-2 text-black mb-1 opacity-80">
            <UserSquare2 className="w-4 h-4 text-black stroke-[3]" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Unique Authors</span>
          </div>
          <div className="text-5xl font-black italic tracking-tighter text-black leading-none">{stats.uniqueAuthors}</div>
          <div className="font-mono text-[10px] font-black text-black uppercase mt-2">
            {Math.round((stats.totalBooks / stats.uniqueAuthors) * 10) / 10} BOOKS PER AUTHOR
          </div>
        </div>
      </div>

      {/* 3. Detailed Stats Secondary Panel Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* STAT 1: Collection lifespan */}
        <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex items-center gap-3">
          <div className="p-2 border-2 border-black bg-[#FFD700] shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <History className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-black font-extrabold">Collection Span</div>
            <div className="text-sm font-black text-black">{stats.collectionSpan}</div>
          </div>
        </div>

        {/* STAT 2: Average Book length */}
        <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex items-center gap-3">
          <div className="p-2 border-2 border-black bg-[#90EE90] shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <BookMarked className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-black font-extrabold">Average Page Count</div>
            <div className="text-sm font-black text-black">{stats.averagePages} pages per volume</div>
          </div>
        </div>

        {/* STAT 3: Median published year */}
        <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex items-center gap-3">
          <div className="p-2 border-2 border-black bg-[#ADD8E6] shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <Hourglass className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-black font-extrabold">Median Published Era</div>
            <div className="text-sm font-black text-black">{StatsService.formatYear(stats.medianPublishedYear)}</div>
          </div>
        </div>
      </div>

      {/* 4. Visual Timeline strip */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-mono font-black uppercase text-black">
            🕰️ Collection Chronology Strip (Timeline)
          </h3>
          <span className="font-mono text-[10px] text-black font-bold uppercase">Oldest 10 Works</span>
        </div>
        <CollectionTimeline books={timelineBooks} />
      </div>

      {/* 5. Chart Deck (Dual Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart Card 1: Top genres */}
        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          <h3 className="text-xl font-black uppercase italic tracking-tight text-black border-b-4 border-black pb-2 mb-4 flex justify-between items-center">
            <span>📚 Top Representation Genres</span>
            <span className="font-mono text-[10px] bg-black text-white px-2 py-0.5 tracking-widest uppercase">primary count</span>
          </h3>
          <RetroBarChart data={genreDist} valueKey="totalCount" maxItems={6} />
        </div>

        {/* Chart Card 2: Collection content division */}
        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          <h3 className="text-xl font-black uppercase italic tracking-tight text-black border-b-4 border-black pb-2 mb-4">
            ⚖️ Fiction vs. Non-Fiction Balance
          </h3>
          <RetroDonutChart data={contentTypeData} />
        </div>

        {/* Chart Card 3: Historical century spread */}
        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          <h3 className="text-xl font-black uppercase italic tracking-tight text-black border-b-4 border-black pb-2 mb-4">
            ⏳ Distribution by Historical Era
          </h3>
          <RetroBarChart data={centuryDist} valueKey="count" maxItems={8} />
        </div>

        {/* Chart Card 4: Top author nationalities */}
        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          <h3 className="text-xl font-black uppercase italic tracking-tight text-black border-b-4 border-black pb-2 mb-4">
            🌍 Global Creative Origins
          </h3>
          <RetroBarChart data={natDist} valueKey="count" maxItems={6} />
        </div>

      </div>

      {/* 6. Visual Extras Block */}
      <VisualExtras books={books} bookGenres={bookGenres} />

    </div>
  );
};
