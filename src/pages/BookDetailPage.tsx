/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Book, BookGenre, TaxonomyLists } from '../types';
import { StatsService } from '../services/statsService';
import { 
  ArrowLeft, 
  Trash2, 
  Check, 
  Calendar, 
  Clock,
  FileText, 
  MapPin, 
  User, 
  Sparkles, 
  AlertTriangle,
  RotateCcw,
  Edit,
  Globe,
  Tag,
  Hammer
} from 'lucide-react';

interface BookDetailPageProps {
  bookId: string;
  books: Book[];
  bookGenres: BookGenre[];
  onBack: () => void;
  onDeleteBook: (bookId: string) => void;
  onEditBook: (book: Book, genres: { genre: string; isPrimary: boolean }[]) => void;
  taxonomies: TaxonomyLists;
}

export const BookDetailPage: React.FC<BookDetailPageProps> = ({
  bookId,
  books,
  bookGenres,
  onBack,
  onDeleteBook,
  onEditBook,
  taxonomies
}) => {
  const book = books.find(b => b.BookID === bookId);
  if (!book) {
    return (
      <div className="border-4 border-black bg-white p-12 text-center shadow-[4px_4px_0px_#000] font-sans">
        <h3 className="text-xl font-black uppercase text-gray-805">Record Index Error</h3>
        <p className="text-xs text-gray-500 mt-2">BookID &apos;{bookId}&apos; could not be resolved from local index cache.</p>
        <button onClick={onBack} className="mt-4 border-2 border-black bg-yellow-300 px-4 py-2 text-xs font-mono font-black uppercase">
          Back to Archives
        </button>
      </div>
    );
  }

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState(book.Title);
  const [author, setAuthor] = useState(book.Author);
  const [nationality, setNationality] = useState(book.AuthorNationality);
  const [contentType, setContentType] = useState(book.ContentType);
  const [workType, setWorkType] = useState(book.WorkType);
  const [period, setPeriod] = useState(book.LiteraryPeriod);
  const [readStatus, setReadStatus] = useState(book.ReadStatus);
  const [format, setFormat] = useState(book.Format);
  const [condition, setCondition] = useState(book.Condition);
  const [publisher, setPublisher] = useState(book.Publisher);
  const [pubYear, setPubYear] = useState(book.PublishedYear);
  const [pages, setPages] = useState(book.PageCount);
  const [purchaseDate, setPurchaseDate] = useState(book.PurchaseDate);

  // Genre states (multiple checkbox mappings)
  const currentGenres = bookGenres.filter(g => g.BookID === bookId);
  const [primaryGenre, setPrimaryGenre] = useState(book.PrimaryGenre || currentGenres.find(g => g.Primary)?.Genre || '');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    currentGenres.map(g => g.Genre)
  );

  // Form submit handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !primaryGenre) {
      alert("Title, Author, and Primary Genre are required fields.");
      return;
    }

    const updatedBook: Book = {
      ...book,
      Title: title.trim(),
      Author: author.trim(),
      AuthorNationality: nationality.trim() || 'Unknown',
      ContentType: contentType as 'Fiction' | 'Non-Fiction',
      WorkType: workType || 'Novel',
      LiteraryPeriod: period || 'Modernism',
      ReadStatus: readStatus as 'Read' | 'Unread',
      Format: format as 'Paperback' | 'Hardback' | 'Other',
      Condition: condition as 'Like New' | 'Good' | 'Fair' | 'Poor',
      Publisher: publisher.trim() || 'Unknown',
      PublishedYear: Number(pubYear),
      PageCount: Number(pages) || 0,
      PurchaseDate: purchaseDate.trim() || 'Unknown',
      PrimaryGenre: primaryGenre
    };

    // Prepare join-table mapping
    const finalGenres = Array.from(new Set([primaryGenre, ...selectedGenres])).map(g => ({
      genre: g,
      isPrimary: g === primaryGenre
    }));

    onEditBook(updatedBook, finalGenres);
    setIsEditing(false);
  };

  // 1. DATA DRIVEN INTELLIGENT WRITING (NO PLACEHOLDER AI TEXT)
  const generateAnalyticalNotes = (): string[] => {
    const notes: string[] = [];

    // Genre specific
    if (book.PrimaryGenre === 'Russian' && book.LiteraryPeriod === 'Realism') {
      notes.push("This book significantly strengthens the Russian Realist structural core of your library catalog.");
    } else if (book.PrimaryGenre === 'Philosophy') {
      notes.push("This volume expands your dialectical/speculative index, enriching your philosophical treatise collection.");
    } else if (book.PrimaryGenre === 'Science Fiction' || book.PrimaryGenre === 'Dystopian') {
      notes.push("This contributes to your speculative future and sci-fi narrative collection profile.");
    }

    // Historical Period clusters
    if (book.PublishedYear < 0) {
      notes.push("Anchors your Classical Antiquity node, placing a foundational historical benchmark in your catalog.");
    } else if (book.PublishedYear >= 1800 && book.PublishedYear <= 1899) {
      notes.push("Adds density to your 19th-century Realist and Victorian-era literature cluster.");
    } else if (book.PublishedYear >= 1900 && book.PublishedYear <= 1945) {
      notes.push("Enriches your early 20th-century Modernist and pre-war literature shelf.");
    } else if (book.PublishedYear > 1950 && book.PublishedYear < 2000) {
      notes.push("Adds representation to your mid-to-late 20th century postmodern or Golden-Age Speculative Fiction.");
    }

    // Physical book size notes
    if (book.PageCount > 600) {
      notes.push(`This is one of your longest books (${book.PageCount} pgs), representing an epic deep-immersion reading commitment.`);
    } else if (book.PageCount > 0 && book.PageCount < 200) {
      notes.push(`This is an extremely concise printed volume (${book.PageCount} pgs), representing dense, fast-paced prose.`);
    }

    // Physical condition flags
    if (book.Condition === 'Poor' || book.Condition === 'Fair') {
      notes.push("Physical state is registered below G/VG standard: might benefit from restoration care or archive replacement.");
    }

    // Classics footprint
    if (book.Publisher.toLowerCase().includes('classics') || book.Publisher.toLowerCase().includes("everyman's")) {
      notes.push(`Expands your premium curated classics footprint under publisher branding: ${book.Publisher}.`);
    }

    // Reading Status log
    if (book.ReadStatus === 'Read') {
      notes.push("You have fully completed reading this volume, logging its structural concepts into your intellectual record.");
    } else {
      notes.push("Currently registered in your active Tsundoku queue (backlog folder target).");
    }

    return notes;
  };

  const insights = generateAnalyticalNotes();

  const handleGenreCheckbox = (g: string) => {
    if (selectedGenres.includes(g)) {
      setSelectedGenres(selectedGenres.filter(item => item !== g));
    } else {
      setSelectedGenres([...selectedGenres, g]);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* 1. Header Navigation Bar */}
      <div className="flex justify-between items-center bg-orange-100 border-4 border-black p-4 shadow-[4px_4px_0px_#000]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 border-2 border-black bg-white hover:bg-yellow-105 p-2 font-mono text-xs font-black uppercase shadow-[2.5px_2.5px_0px_#000] cursor-pointer active:translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          Back to Archives
        </button>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button
                id="edit-book"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 border-2 border-black bg-yellow-350 hover:bg-yellow-405 py-2 px-4 font-mono text-xs font-black uppercase shadow-[2.5px_2.5px_0px_#000] cursor-pointer"
              >
                <Edit className="w-4 h-4 stroke-[2.5]" />
                Edit Record
              </button>
              <button
                id="delete-book"
                onClick={() => {
                  if (confirm(`CRITICAL TRIGGER: Are you absolutely sure you want to permanently erase "${book.Title}" from local cache archive?`)) {
                    onDeleteBook(book.BookID);
                  }
                }}
                className="flex items-center gap-2 border-2 border-black bg-red-405 hover:bg-red-505 text-black py-2 px-4 font-mono text-xs font-black uppercase shadow-[2.5px_2.5px_0px_#000] cursor-pointer"
              >
                <Trash2 className="w-4 h-4 stroke-[2.5]" />
                Scrub Record
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1.5 border-2 border-black bg-white hover:bg-gray-100 py-2 px-4 font-mono text-xs font-black uppercase cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              Discard Edits
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        
        /* ==================== VIEW A: EDIT FORM PANEL ==================== */
        <form onSubmit={handleSave} className="border-4 border-black bg-white p-6 md:p-8 shadow-[6px_6px_0px_#000000] space-y-6">
          <div className="border-b-4 border-black pb-3">
            <h2 className="text-2xl font-black uppercase text-gray-950 flex items-center gap-2">
              <Hammer className="w-6 h-6 text-orange-500 stroke-[2.5]" />
              Modify Record: {book.BookID}
            </h2>
            <p className="text-xs text-gray-500 font-mono font-bold mt-1 uppercase">Adjust core physical metadata parameters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Title */}
            <div className="md:col-span-2 space-y-1">
              <label className="block text-[11px] font-mono font-bold uppercase text-gray-700">Book Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border-2 border-black bg-yellow-50/20 p-2 text-xs font-bold font-sans"
              />
            </div>

            {/* Book ID (Locked) */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono font-bold uppercase text-gray-500">Book ID (Permanent Key)</label>
              <input
                type="text"
                disabled
                value={book.BookID}
                className="w-full border-2 border-gray-300 bg-gray-100 p-2 text-xs font-mono text-gray-500 font-bold"
              />
            </div>

            {/* Author Name */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono font-bold uppercase text-gray-700">Author Name *</label>
              <input
                type="text"
                required
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full border-2 border-black p-2 text-xs font-bold"
              />
            </div>

            {/* Author Nationality */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono font-bold uppercase text-gray-700">Author Nationality</label>
              <input
                type="text"
                value={nationality}
                onChange={e => setNationality(e.target.value)}
                className="w-full border-2 border-black p-2 text-xs font-bold"
              />
            </div>

            {/* Content Type */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono font-bold uppercase text-gray-700">Content separation</label>
              <select
                value={contentType}
                onChange={e => setContentType(e.target.value)}
                className="w-full border-2 border-black p-2 text-xs font-bold"
              >
                {taxonomies.contentTypes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Publisher */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono font-bold uppercase text-gray-700">Registered Publisher</label>
              <input
                type="text"
                value={publisher}
                onChange={e => setPublisher(e.target.value)}
                className="w-full border-2 border-black p-2 text-xs font-bold"
              />
            </div>

            {/* Published Year */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono font-bold uppercase text-gray-700">Era Published Year (Use negative for BCE)</label>
              <input
                type="number"
                value={pubYear}
                onChange={e => setPubYear(Number(e.target.value))}
                className="w-full border-2 border-black p-2 text-xs font-bold font-mono"
              />
            </div>

            {/* Page Count */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono font-bold uppercase text-gray-700">Page Count</label>
              <input
                type="number"
                value={pages}
                onChange={e => setPages(Number(e.target.value))}
                className="w-full border-2 border-black p-2 text-xs font-bold font-mono"
              />
            </div>

            {/* Format */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono font-bold uppercase text-gray-700">Physical Format</label>
              <select
                value={format}
                onChange={e => setFormat(e.target.value)}
                className="w-full border-2 border-black p-2 text-xs font-bold"
              >
                {taxonomies.formats.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Condition */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono font-bold uppercase text-gray-700">Physical Condition</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value)}
                className="w-full border-2 border-black p-2 text-xs font-bold"
              >
                {taxonomies.conditions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Purchase Date */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono font-bold uppercase text-gray-700">Purchase Date (YYYY-MM-DD or &quot;Unknown&quot;)</label>
              <input
                type="text"
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                className="w-full border-2 border-black p-2 text-xs font-sans font-bold"
              />
            </div>

            {/* Literary Period */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono font-bold uppercase text-gray-700">Literary Period Era</label>
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="w-full border-2 border-black p-2 text-xs font-bold"
              >
                {taxonomies.literaryPeriods.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Work Type */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono font-bold uppercase text-gray-700">Work Type Form</label>
              <select
                value={workType}
                onChange={e => setWorkType(e.target.value)}
                className="w-full border-2 border-black p-2 text-xs font-bold"
              >
                {taxonomies.workTypes.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            {/* Read Status */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono font-bold uppercase text-gray-700">Reading Status Log</label>
              <select
                value={readStatus}
                onChange={e => setReadStatus(e.target.value)}
                className="w-full border-2 border-black p-2 text-xs font-bold"
              >
                <option value="Read">Read</option>
                <option value="Unread">Unread</option>
              </select>
            </div>

          </div>

          <div className="space-y-3 pt-4 border-t-2 border-black">
            <div className="p-3 bg-red-50 border-2 border-black rounded-none">
              <label className="block text-xs font-mono font-black uppercase text-gray-800 mb-1">Primary Group Genre *</label>
              <select
                value={primaryGenre}
                onChange={e => setPrimaryGenre(e.target.value)}
                className="w-full sm:w-1/2 border-2 border-black bg-white p-2 text-xs font-bold"
              >
                <option value="">-- Choose 1 Primary Grouping --</option>
                {taxonomies.genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <span className="block text-[10px] text-gray-500 font-mono mt-1">* Required for primary grid statistics co-occurrence.</span>
            </div>

            {/* Secondary genres */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-mono font-black uppercase text-gray-800">Assign Secondary Genres (Tag list)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 bg-gray-50 border-2 border-black p-4">
                {taxonomies.genres.map((g) => (
                  <label key={g} className="flex items-center gap-1.5 text-xs font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(g)}
                      onChange={() => handleGenreCheckbox(g)}
                      className="border-2 border-black rounded focus:ring-0 w-4 h-4 text-orange-500"
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-400 hover:bg-emerald-500 text-black border-3 border-black py-3 px-6 font-mono font-extrabold text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#000] cursor-pointer"
          >
            Save Registered Updates
          </button>
        </form>

      ) : (

        /* ==================== VIEW B: PROFILE BEAUTIFUL RETRO CARD ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main profile binder (Left columns) */}
          <div className="lg:col-span-2 border-4 border-black bg-[#FFFBF3] p-6 md:p-8 shadow-[6px_6px_0px_#000] relative overflow-hidden">
            <span className="absolute top-4 right-4 font-mono font-bold text-xs bg-black text-white px-3.5 py-1 uppercase rounded">
              Index: #{book.BookID}
            </span>

            {/* Volume binding graphic elements (looks beautiful) */}
            <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-red-400 border-r border-black" />
            <div className="absolute top-0 left-2.5 bottom-0 w-1 bg-red-500/30" />

            <div className="pl-6 space-y-6">
              
              {/* Core Information Headings */}
              <div>
                <span className="font-mono text-[10px] font-black uppercase tracking-wider text-[#B57614] bg-yellow-100 border border-yellow-300 py-1 px-2">
                  {book.ContentType} • {book.LiteraryPeriod} Shelf Node
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold uppercase text-gray-950 mt-3 border-b-4 border-black pb-3 leading-tight">
                  {book.Title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-3 font-sans font-bold text-base text-gray-700">
                  <User className="w-5 h-5 text-gray-600" />
                  Written by <span className="text-black text-lg underline font-black">{book.Author}</span> 
                  <span className="text-xs bg-gray-200 text-gray-800 py-0.5 px-2 rounded-full font-mono">{book.AuthorNationality}</span>
                </div>
              </div>

              {/* Physical metadata specs grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000000]">
                {/* Year */}
                <div className="flex gap-2 items-center text-xs">
                  <Calendar className="w-4 h-4 text-[#B57614] stroke-[2.5]" />
                  <span className="font-mono text-gray-500 font-bold uppercase w-20">First Pub:</span>
                  <strong className="text-sm font-mono text-black">{StatsService.formatYear(book.PublishedYear)}</strong>
                </div>

                {/* Length */}
                <div className="flex gap-2 items-center text-xs">
                  <FileText className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                  <span className="font-mono text-gray-500 font-bold uppercase w-20">Page Count:</span>
                  <strong className="text-sm font-mono text-black">{book.PageCount || 'Unknown'} pages</strong>
                </div>

                {/* Publisher */}
                <div className="flex gap-2 items-start text-xs md:col-span-2 border-t border-dashed border-gray-300 pt-2.5 mt-1">
                  <MapPin className="w-4 h-4 text-red-650 mt-0.5 stroke-[2.5]" />
                  <span className="font-mono text-gray-500 font-bold uppercase w-20">Publisher:</span>
                  <strong className="text-xs font-black text-black leading-tight flex-1">{book.Publisher}</strong>
                </div>

                {/* Work Info */}
                <div className="flex gap-2 items-center text-xs border-t border-dashed border-gray-300 pt-2.5 mt-1">
                  <Globe className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                  <span className="font-mono text-gray-500 font-bold uppercase w-20">Form type:</span>
                  <strong className="text-xs font-bold text-black uppercase">{book.WorkType || 'Novel'}</strong>
                </div>

                {/* Purchase Date */}
                <div className="flex gap-2 items-center text-xs border-t border-dashed border-gray-300 pt-2.5 mt-1">
                  <Clock className="w-4 h-4 text-purple-600 stroke-[2.5]" />
                  <span className="font-mono text-gray-500 font-bold uppercase w-20">Logged Date:</span>
                  <strong className="text-xs font-mono font-bold text-black">{book.PurchaseDate}</strong>
                </div>
              </div>

              {/* Tag library categories map */}
              <div className="space-y-2 border-t-2 border-black border-dashed pt-4">
                <span className="block text-[10px] font-mono font-black uppercase text-gray-500">Cross Taxonomy Genre Tags</span>
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 border-2 border-black bg-[#FFE66D] py-1 px-3.5 font-mono text-xs font-black uppercase shadow-[2.5px_2.5px_0px_#000]">
                    <Tag className="w-3.5 h-3.5" />
                    KEY: {book.PrimaryGenre || 'Classics'}
                  </span>
                  
                  {bookGenres.filter(g => g.BookID === bookId && !g.Primary).map((genre) => (
                    <span 
                      key={genre.Genre} 
                      className="border-2 border-gray-400 bg-white hover:bg-yellow-50 py-1 px-2.5 font-mono text-xs text-gray-700 font-bold shadow-[1px_1px_0px_rgba(0,0,0,0.1)]"
                    >
                      #{genre.Genre.toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Analytical Intelligence insights (Right sidebar) */}
          <div className="space-y-6">
            
            {/* PHYSICAL CARD SHELF */}
            <div className="border-4 border-black bg-yellow-105 p-6 shadow-[4px_4px_0px_#000] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-400/20 -translate-y-6 translate-x-6 rotate-45 pointer-events-none" />
              
              <h3 className="text-base font-black uppercase text-black border-b-2 border-black pb-2 mb-4">
                📋 Shelf Logging Status
              </h3>
              
              <div className="space-y-4 font-mono text-xs font-bold text-gray-800">
                <div className="flex justify-between border-b border-black/10 pb-2">
                  <span className="text-gray-500">FORMAT PRINT:</span>
                  <span className="font-black text-black uppercase">{book.Format}</span>
                </div>
                <div className="flex justify-between border-b border-black/10 pb-2">
                  <span className="text-gray-500">ARCHIVE CLASS:</span>
                  <span className="font-black text-black uppercase">{book.Condition}</span>
                </div>
                <div className="flex justify-between border-b border-black/10 pb-2">
                  <span className="text-gray-500">READ STATUS:</span>
                  <span className={`px-2 py-0.5 font-black uppercase border border-black ${book.ReadStatus === 'Read' ? 'bg-emerald-300 text-black' : 'bg-gray-100 text-gray-700'}`}>{book.ReadStatus}</span>
                </div>
              </div>
            </div>

            {/* DATA DRIVEN NOTE INSIGHTS */}
            <div className="border-4 border-black bg-white p-6 shadow-[4px_4px_0px_#000]">
              <h3 className="text-base font-black uppercase text-gray-900 border-b-4 border-black pb-2 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500 stroke-[2.5]" />
                Archival Audit Notes
              </h3>

              {insights.length > 0 ? (
                <div className="space-y-3">
                  {insights.map((note, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start bg-orange-50/50 p-3 border border-black/10">
                      <span className="text-amber-500 text-base leading-none">♦</span>
                      <p className="text-xs font-semibold text-gray-800 leading-normal">{note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center font-mono text-[11px] text-gray-400 py-6">
                  Log more criteria fields to trigger automated insights.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
