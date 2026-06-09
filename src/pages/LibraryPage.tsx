/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Book, BookGenre, TaxonomyLists } from '../types';
import { StatsService } from '../services/statsService';
import { 
  Search, 
  Grid, 
  List, 
  Sliders, 
  Plus, 
  ArrowUpDown, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Tag, 
  Award,
  Layers
} from 'lucide-react';

interface LibraryPageProps {
  books: Book[];
  bookGenres: BookGenre[];
  taxonomies: TaxonomyLists;
  onViewBook: (bookId: string) => void;
  onNavigateToAddBook: () => void;
  onViewAuthor?: (author: string) => void;
}

type ViewMode = 'grid' | 'table';
type SortField = 'Title' | 'PublishedYear' | 'PageCount' | 'BookID' | 'Author' | 'ReadStatus' | 'Condition';
type SortOrder = 'asc' | 'desc';

export const LibraryPage: React.FC<LibraryPageProps> = ({
  books,
  bookGenres,
  taxonomies,
  onViewBook,
  onNavigateToAddBook,
  onViewAuthor
}) => {
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState('');
  const [selectedNationality, setSelectedNationality] = useState('');
  const [selectedReadStatus, setSelectedReadStatus] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');

  // Sorter State
  const [sortField, setSortField] = useState<SortField>('Title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Page layout state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Toggle Sorting helper
  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Helper to retrieve all genres for a book
  const getGenresForBook = (bookId: string) => {
    return bookGenres.filter(g => g.BookID === bookId);
  };

  // 1. Filter Logic
  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.Author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesContent = selectedContentType ? book.ContentType === selectedContentType : true;
    const matchesPeriod = selectedPeriod ? book.LiteraryPeriod === selectedPeriod : true;
    const matchesPublisher = selectedPublisher ? book.Publisher === selectedPublisher : true;
    const matchesNationality = selectedNationality ? book.AuthorNationality === selectedNationality : true;
    const matchesReadStatus = selectedReadStatus ? book.ReadStatus === selectedReadStatus : true;
    const matchesFormat = selectedFormat ? book.Format === selectedFormat : true;
    const matchesCondition = selectedCondition ? book.Condition === selectedCondition : true;

    // Filter by genre needs digging into the joint BookGenres
    let matchesGenre = true;
    if (selectedGenre) {
      const bGenres = getGenresForBook(book.BookID);
      matchesGenre = bGenres.some(bg => bg.Genre === selectedGenre);
    }

    return matchesSearch && 
           matchesContent && 
           matchesPeriod && 
           matchesPublisher && 
           matchesNationality && 
           matchesGenre && 
           matchesReadStatus && 
           matchesFormat && 
           matchesCondition;
  });

  // 2. Sort Logic
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'Title') {
      comparison = a.Title.localeCompare(b.Title);
    } else if (sortField === 'PublishedYear') {
      comparison = a.PublishedYear - b.PublishedYear;
    } else if (sortField === 'PageCount') {
      comparison = (a.PageCount || 0) - (b.PageCount || 0);
    } else if (sortField === 'BookID') {
      comparison = a.BookID.localeCompare(b.BookID);
    } else if (sortField === 'Author') {
      comparison = a.Author.localeCompare(b.Author);
    } else if (sortField === 'ReadStatus') {
      comparison = a.ReadStatus.localeCompare(b.ReadStatus);
    } else if (sortField === 'Condition') {
      comparison = a.Condition.localeCompare(b.Condition);
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Collect active filters to draw neat tag indicators
  const activeFilterCount = 
    (selectedContentType ? 1 : 0) + 
    (selectedGenre ? 1 : 0) + 
    (selectedPeriod ? 1 : 0) + 
    (selectedPublisher ? 1 : 0) + 
    (selectedNationality ? 1 : 0) +
    (selectedReadStatus ? 1 : 0) +
    (selectedFormat ? 1 : 0) +
    (selectedCondition ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedContentType('');
    setSelectedGenre('');
    setSelectedPeriod('');
    setSelectedPublisher('');
    setSelectedNationality('');
    setSelectedReadStatus('');
    setSelectedFormat('');
    setSelectedCondition('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-12 font-sans text-black">
      
      {/* FILTER CONTROL LEFT SIDEBAR */}
      <div className="lg:col-span-1 space-y-6">
        <div className="border-4 border-black bg-white p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-none">
          <div className="flex justify-between items-center mb-4 border-b-4 border-black pb-2">
            <h3 className="text-sm font-mono font-black uppercase text-black flex items-center gap-2">
              <Sliders className="w-4 h-4 text-black stroke-[3]" />
              Filter Books
            </h3>
            {activeFilterCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="text-[10px] font-mono font-black uppercase text-[#FF4500] hover:underline cursor-pointer"
              >
                Clear all ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Filter 1: Content Type */}
            <div>
              <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-black mb-1.5">
                Work Type
              </label>
              <select
                value={selectedContentType}
                onChange={e => setSelectedContentType(e.target.value)}
                className="w-full border-4 border-black bg-white px-2.5 py-1.5 font-mono text-xs font-black rounded-none focus:outline-none focus:bg-[#FFF7E8]"
              >
                <option value="">-- All book types --</option>
                {taxonomies.contentTypes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Filter 2: Genres */}
            <div>
              <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-black mb-1.5">
                Book Genre
              </label>
              <select
                value={selectedGenre}
                onChange={e => setSelectedGenre(e.target.value)}
                className="w-full border-4 border-black bg-white px-2.5 py-1.5 font-mono text-xs font-black rounded-none focus:outline-none focus:bg-[#FFF7E8]"
              >
                <option value="">-- All genres --</option>
                {taxonomies.genres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Filter 3: Literary Periods */}
            <div>
              <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-black mb-1.5">
                Literary Era
              </label>
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value)}
                className="w-full border-4 border-black bg-white px-2.5 py-1.5 font-mono text-xs font-black rounded-none focus:outline-none focus:bg-[#FFF7E8]"
              >
                <option value="">-- All eras --</option>
                {taxonomies.literaryPeriods.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Filter 4: Publisher */}
            <div>
              <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-black mb-1.5">
                Publisher
              </label>
              <select
                value={selectedPublisher}
                onChange={e => setSelectedPublisher(e.target.value)}
                className="w-full border-4 border-black bg-white px-2.5 py-1.5 font-mono text-xs font-black rounded-none focus:outline-none focus:bg-[#FFF7E8]"
              >
                <option value="">-- All publishers --</option>
                {taxonomies.publishers.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Filter 5: Author Nationality */}
            <div>
              <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-black mb-1.5">
                Author Origin
              </label>
              <select
                value={selectedNationality}
                onChange={e => setSelectedNationality(e.target.value)}
                className="w-full border-4 border-black bg-white px-2.5 py-1.5 font-mono text-xs font-black rounded-none focus:outline-none focus:bg-[#FFF7E8]"
              >
                <option value="">-- All nationalities --</option>
                {/* Dynamically extract author nationalities in active database list */}
                {Array.from(new Set(books.map(b => b.AuthorNationality).filter(Boolean))).sort().map(nat => (
                  <option key={nat} value={nat}>{nat}</option>
                ))}
              </select>
            </div>

            {/* Filter 6: Read Status */}
            <div>
              <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-black mb-1.5">
                Reading Status
              </label>
              <select
                value={selectedReadStatus}
                onChange={e => setSelectedReadStatus(e.target.value)}
                className="w-full border-4 border-black bg-white px-2.5 py-1.5 font-mono text-xs font-black rounded-none focus:outline-none focus:bg-[#FFF7E8]"
              >
                <option value="">-- All status --</option>
                <option value="Read">Read</option>
                <option value="Unread">Unread</option>
              </select>
            </div>

            {/* Filter 7: Format */}
            <div>
              <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-black mb-1.5">
                Physical Format
              </label>
              <select
                value={selectedFormat}
                onChange={e => setSelectedFormat(e.target.value)}
                className="w-full border-4 border-black bg-white px-2.5 py-1.5 font-mono text-xs font-black rounded-none focus:outline-none focus:bg-[#FFF7E8]"
              >
                <option value="">-- All formats --</option>
                <option value="Paperback">Paperback</option>
                <option value="Hardback">Hardback</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Filter 8: Condition */}
            <div>
              <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-black mb-1.5">
                Volume Condition
              </label>
              <select
                value={selectedCondition}
                onChange={e => setSelectedCondition(e.target.value)}
                className="w-full border-4 border-black bg-white px-2.5 py-1.5 font-mono text-xs font-black rounded-none focus:outline-none focus:bg-[#FFF7E8]"
              >
                <option value="">-- All conditions --</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

          </div>
        </div>

        {/* Short explanation of stable IDs */}
        <div className="bg-[#FFF7E8] border-4 border-black p-4 font-mono text-[10px] text-black leading-normal font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
          📚 <strong className="font-black text-[#FF4500]">CATALOG INDEXING:</strong> Each book is assigned a unique index number (e.g. <em>B0001, B0002</em>) to keep your library organized.
        </div>
      </div>

      {/* CATALOG DATA AREA */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Subheader Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-4 border-black bg-white p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-none">
          
          {/* SEARCH BAR INPUT */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-black stroke-[2.5]" />
            </span>
            <input
              id="library-search"
              type="text"
              placeholder="Search catalog by title or author name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-4 border-black bg-white font-sans text-xs font-bold rounded-none focus:outline-none focus:bg-[#FFF7E8]"
            />
          </div>

          {/* RIGHT UTILITY GROUP */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Switchers View Mode */}
            <div className="flex items-center border-4 border-black rounded-none overflow-hidden">
              <button
                id="view-grid"
                title="Grid layout view"
                onClick={() => setViewMode('grid')}
                className={`p-2 cursor-pointer transition-all ${viewMode === 'grid' ? 'bg-[#FFD700] text-black' : 'bg-white hover:bg-[#FFF7E8]'}`}
              >
                <Grid className="w-4 h-4 stroke-[3]" />
              </button>
              <button
                id="view-table"
                title="Spreadsheet table view"
                onClick={() => setViewMode('table')}
                className={`p-2 border-l-4 border-black cursor-pointer transition-all ${viewMode === 'table' ? 'bg-[#FFD700] text-black' : 'bg-white hover:bg-[#FFF7E8]'}`}
              >
                <List className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Sorter triggers dropdown */}
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-black font-black uppercase hidden md:inline ml-2">Sort by:</span>
              <select
                id="sort-field-select"
                value={sortField}
                onChange={e => setSortField(e.target.value as SortField)}
                className="border-4 border-black bg-white px-2.5 py-1.5 font-mono text-[10px] font-black uppercase tracking-wider rounded-none focus:outline-none focus:bg-[#FFF7E8]"
              >
                <option value="Title">Title</option>
                <option value="Author">Author</option>
                <option value="PublishedYear">Pub Year</option>
                <option value="PageCount">Pages</option>
                <option value="BookID">Slot ID</option>
                <option value="ReadStatus">Read Status</option>
                <option value="Condition">Condition</option>
              </select>
              <button
                id="sort-direction-toggle"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2.5 py-1.5 border-4 border-black text-[10px] bg-white hover:bg-[#FFF7E8] font-black uppercase tracking-wider cursor-pointer"
                title="Toggle Sorting Direction"
              >
                {sortOrder === 'asc' ? '↑ ASC' : '↓ DESC'}
              </button>
            </div>

            {/* Add button shortcut */}
            <button
              onClick={onNavigateToAddBook}
              className="bg-[#90EE90] hover:bg-black hover:text-white px-3.5 py-2 border-4 border-black font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer rounded-none"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              Add
            </button>

          </div>

        </div>

        {/* Active search filter label */}
        <div className="flex justify-between items-center px-1 font-mono text-[10px] font-bold text-black uppercase tracking-widest">
          <span>Catalog Query Output ({sortedBooks.length} records matched)</span>
          <span>Sorting by {sortField} ({sortOrder})</span>
        </div>

        {/* 3. Catalog Render Area */}
        {sortedBooks.length === 0 ? (
          <div className="border-4 border-black bg-white p-12 text-center shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-none">
            <Search className="w-12 h-12 text-black mx-auto stroke-[2.5] mb-4" />
            <h3 className="text-xl font-black uppercase text-black italic">Empty Query Match</h3>
            <p className="text-xs text-gray-800 mt-2 max-w-sm mx-auto font-medium">
              No registered catalog items matched your active combination of query and tags filters.
            </p>
            <button
              onClick={resetAllFilters}
              className="mt-6 border-4 border-black bg-[#FFD700] hover:bg-black hover:text-white px-5 py-2.5 font-mono text-xs font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer rounded-none"
            >
              Flush Filters Reset
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          
          /* VIEW 1: BRUTALIST GRID CARDS */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedBooks.map((book) => {
              const bGenres = getGenresForBook(book.BookID);
              const secondaryGenres = bGenres.filter(g => !g.Primary).map(g => g.Genre);
              
              // Condition colors
              let conditionColor = 'bg-white';
              if (book.Condition === 'Like New') conditionColor = 'bg-[#90EE90]';
              if (book.Condition === 'Good') conditionColor = 'bg-[#ADD8E6]';
              if (book.Condition === 'Fair') conditionColor = 'bg-[#F0E68C]';
              if (book.Condition === 'Poor') conditionColor = 'bg-[#FF6347]';

              return (
                <div
                  key={book.BookID}
                  onClick={() => onViewBook(book.BookID)}
                  className="interactive-book-card border-4 border-black bg-white hover:bg-[#FFF7E8] p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] cursor-pointer flex flex-col justify-between transition-all duration-150 relative group rounded-none"
                >
                  {/* Stable Slot Badge */}
                  <div className="absolute top-4 right-4 bg-black text-white font-mono text-[10px] px-2 py-0.5 font-black uppercase rounded-none">
                    {book.BookID}
                  </div>

                  <div>
                    {/* Category split flag */}
                    <div className="flex gap-2 items-center text-[10px] font-mono uppercase font-black text-black opacity-60">
                      <span>{book.ContentType}</span>
                      <span>•</span>
                      <span>{book.LiteraryPeriod}</span>
                    </div>

                    <h3 className="text-xl font-black text-black uppercase tracking-tight leading-snug mt-2 line-clamp-1 group-hover:text-[#FF4500]">
                      {book.Title}
                    </h3>
                    <p className="text-xs font-bold text-black mt-0.5">
                      by{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewAuthor?.(book.Author);
                        }}
                        className="font-extrabold hover:text-[#FF4500] underline bg-transparent border-none p-0 cursor-pointer focus:outline-none"
                        title={`View ${book.Author}'s profile`}
                      >
                        {book.Author}
                      </button>{' '}
                      ({book.AuthorNationality})
                    </p>

                    {/* Metadata summary grid */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 my-4 pt-3 border-t border-black/10 text-[10px] font-bold text-black opacity-80">
                      <div className="flex items-center gap-1.5 truncate">
                        <Award className="w-3.5 h-3.5 text-black stroke-[3]" />
                        <span>Pub Year:</span> 
                        <span className="font-mono bg-white px-1 border border-black text-black font-black">{StatsService.formatYear(book.PublishedYear)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-black stroke-[3]" />
                        <span>Pages:</span> <span className="font-mono font-black text-black">{book.PageCount || 'Unknown'} pgs</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate col-span-2">
                        <Layers className="w-3.5 h-3.5 text-black stroke-[3]" />
                        <span>Publisher:</span> <span className="font-black text-black truncate">{book.Publisher}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Primary Genre large badge */}
                    <div className="flex items-center gap-1.5 pt-2 border-t-2 border-black border-dashed mt-1.5 flex-wrap">
                      <Tag className="w-3 h-3 text-black stroke-[3]" />
                      <span className="border-2 border-black bg-[#FFD700] px-2 py-0.5 text-[9px] font-mono font-black uppercase tracking-wide rounded-none">
                        {book.PrimaryGenre || 'Classics'}
                      </span>
                      {secondaryGenres.slice(0, 2).map(genre => (
                        <span key={genre} className="border border-black bg-white text-black font-mono text-[9px] px-1.5 py-0.5 rounded-none font-bold">
                          #{genre.toLowerCase()}
                        </span>
                      ))}
                    </div>

                    {/* Bottom Status Info Strip */}
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-black/10">
                      <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${conditionColor}`}>
                        {book.Condition}
                      </span>
                      <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${book.ReadStatus === 'Read' ? 'bg-[#90EE90]' : 'bg-white'}`}>
                        {book.ReadStatus}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          
          /* VIEW 2: FULL SPREADSHEET TABLE MODULE */
          <div className="border-4 border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] overflow-x-auto rounded-none">
            <table className="w-full text-left font-sans border-collapse">
              <thead>
                <tr className="bg-[#FFD700] border-b-4 border-black text-xs font-mono font-black tracking-wider text-black">
                  <th className="p-3 border-r-4 border-black w-24">SLOT ID</th>
                  <th className="p-3 border-r-4 border-black">TITLE</th>
                  <th className="p-3 border-r-4 border-black">AUTHOR</th>
                  <th className="p-3 border-r-4 border-black">GENRES & TAGS</th>
                  <th className="p-3 border-r-4 border-black text-center w-20">PAGES</th>
                  <th className="p-3 border-r-4 border-black text-center w-24">ERA YEAR</th>
                  <th className="p-3 border-r-4 border-black">FORMAT / STATUS</th>
                  <th className="p-3 text-center w-28">READ STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-black text-xs font-bold text-black">
                {sortedBooks.map((book) => {
                  const bGenres = getGenresForBook(book.BookID);
                  const prim = bGenres.find(g => g.Primary)?.Genre;
                  const scnd = bGenres.filter(g => !g.Primary).map(g => g.Genre).join(', ');

                  return (
                    <tr 
                      key={book.BookID}
                      onClick={() => onViewBook(book.BookID)}
                      className="hover:bg-[#FFF7E8] cursor-pointer active:bg-[#FFF7E8] transition-colors"
                    >
                      <td className="p-3 border-r-4 border-black font-mono font-black text-[#FF4500]">{book.BookID}</td>
                      <td className="p-3 border-r-4 border-black font-black uppercase tracking-tight text-black truncate max-w-[200px]">{book.Title}</td>
                      <td className="p-3 border-r-4 border-black font-sans">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewAuthor?.(book.Author);
                          }}
                          className="font-bold hover:text-[#FF4500] underline bg-transparent border-none p-0 cursor-pointer text-left focus:outline-none"
                          title={`View ${book.Author}'s profile`}
                        >
                          {book.Author}
                        </button>{' '}
                        ({book.AuthorNationality})
                      </td>
                      <td className="p-3 border-r-4 border-black max-w-[150px] truncate">
                        <span className="font-mono text-[9px] bg-[#FFD700] border-2 border-black font-black px-1.5 py-0.5 rounded-none mr-1.5 uppercase tracking-wide">
                          {prim || book.PrimaryGenre}
                        </span>
                        {scnd && <span className="text-black font-mono text-[9px] italic opacity-75">({scnd})</span>}
                      </td>
                      <td className="p-3 border-r-4 border-black text-center font-mono font-black">{book.PageCount || '—'}</td>
                      <td className="p-3 border-r-4 border-black text-center font-mono font-black">{StatsService.formatYear(book.PublishedYear)}</td>
                      <td className="p-3 border-r-4 border-black uppercase text-[10px] font-mono leading-none font-bold">{book.Format} • {book.Condition}</td>
                      <td className="p-3 text-center">
                        <span className={`font-mono text-[9px] font-black uppercase px-2.5 py-0.5 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${book.ReadStatus === 'Read' ? 'bg-[#90EE90]' : 'bg-white'}`}>
                          {book.ReadStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        )}

      </div>

    </div>
  );
};
