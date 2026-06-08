/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Book, TaxonomyLists, EnrichmentSuggestion } from '../types';
import { EnrichmentService } from '../services/enrichmentService';
import { PublisherNormalizer } from '../services/publisherNormalizer';
import { 
  Sparkles, 
  HelpCircle, 
  ArrowLeft, 
  Check, 
  Loader2, 
  PlusCircle, 
  AlertCircle,
  CopyCheck,
  Library
} from 'lucide-react';

interface AddBookPageProps {
  books: Book[];
  taxonomies: TaxonomyLists;
  onAddBook: (book: Book, genres: { genre: string; isPrimary: boolean }[]) => void;
  onBack: () => void;
}

export const AddBookPage: React.FC<AddBookPageProps> = ({
  books,
  taxonomies,
  onAddBook,
  onBack
}) => {
  // Input fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [nationality, setNationality] = useState('');
  const [contentType, setContentType] = useState<'Fiction' | 'Non-Fiction'>('Fiction');
  const [workType, setWorkType] = useState('Novel');
  const [period, setPeriod] = useState('Modernism');
  const [readStatus, setReadStatus] = useState<'Read' | 'Unread'>('Read');
  const [format, setFormat] = useState<'Paperback' | 'Hardback' | 'Other'>('Paperback');
  const [condition, setCondition] = useState<'Like New' | 'Good' | 'Fair' | 'Poor'>('Good');
  const [publisher, setPublisher] = useState('');
  const [pubYear, setPubYear] = useState('');
  const [pages, setPages] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('Unknown');

  // Genre lists
  const [primaryGenre, setPrimaryGenre] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // Enrichment service status state
  const [isEnriching, setIsEnriching] = useState(false);
  const [suggestions, setSuggestions] = useState<EnrichmentSuggestion[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [suggestionAppliedKeys, setSuggestionAppliedKeys] = useState<string[]>([]);

  // Calculate new sequential stable key
  const getNextBookID = () => {
    if (books.length === 0) return 'B0001';
    const ids = books.map(b => {
      const num = parseInt(b.BookID.replace('B', ''));
      return isNaN(num) ? 0 : num;
    });
    const max = Math.max(...ids);
    const nextNum = max + 1;
    return `B${nextNum.toString().padStart(4, '0')}`;
  };

  const handleSuggest = async () => {
    if (!title.trim()) {
      setErrorMessage("Please fill at least the 'Book Title' first to query predictions.");
      return;
    }

    setErrorMessage('');
    setIsEnriching(true);
    setSuggestions([]);
    setSuggestionAppliedKeys([]);

    try {
      const response = await EnrichmentService.getSuggestions(title, author);
      if (response.status === 'success' && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      } else {
        setErrorMessage("No reference mappings or hints discovered for this title in demo presets database.");
      }
    } catch {
      setErrorMessage("Failed to acquire metadata recommendations.");
    } finally {
      setIsEnriching(false);
    }
  };

  const applySingleSuggestion = (sug: EnrichmentSuggestion) => {
    const key = `${sug.field}:::${sug.suggestedValue}`;
    if (suggestionAppliedKeys.includes(key)) return;

    if (sug.field === 'Author') {
      setAuthor(sug.suggestedValue);
    } else if (sug.field === 'AuthorNationality') {
      setNationality(sug.suggestedValue);
    } else if (sug.field === 'PublishedYear') {
      setPubYear(String(sug.suggestedValue));
    } else if (sug.field === 'PageCount') {
      setPages(String(sug.suggestedValue));
    } else if (sug.field === 'Publisher') {
      setPublisher(sug.suggestedValue);
    } else if (sug.field === 'LiteraryPeriod') {
      setPeriod(sug.suggestedValue);
    } else if (sug.field === 'WorkType') {
      setWorkType(sug.suggestedValue);
    } else if (sug.field === 'PrimaryGenre') {
      setPrimaryGenre(sug.suggestedValue);
    } else if (sug.field === 'genres') {
      // List of genres from autocomplete
      const list = sug.suggestedValue as string[];
      // Keep primary
      if (list.length > 0) {
        const prim = list[0];
        setPrimaryGenre(prim);
        setSelectedGenres(list);
      }
    }

    setSuggestionAppliedKeys([...suggestionAppliedKeys, key]);
  };

  const applyAllSuggestions = () => {
    suggestions.forEach(sug => {
      applySingleSuggestion(sug);
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !primaryGenre) {
      alert("Title, Author, and Primary Genre are required fields.");
      return;
    }

    // Auto normalize publisher on ingestion
    const cleanPublisher = PublisherNormalizer.normalize(publisher);

    const newBook: Book = {
      BookID: getNextBookID(),
      Title: title.trim(),
      Author: author.trim(),
      AuthorNationality: nationality.trim() || 'Unknown',
      ContentType: contentType,
      WorkType: workType || 'Novel',
      LiteraryPeriod: period || 'Modernism',
      ReadStatus: readStatus,
      Format: format,
      Condition: condition,
      Publisher: cleanPublisher,
      PublishedYear: Number(pubYear) || 1900,
      PageCount: Number(pages) || 0,
      PurchaseDate: purchaseDate.trim() || 'Unknown',
      PrimaryGenre: primaryGenre
    };

    // Bundle active genres mapping
    const finalGenres = Array.from(new Set([primaryGenre, ...selectedGenres])).map(g => ({
      genre: g,
      isPrimary: g === primaryGenre
    }));

    onAddBook(newBook, finalGenres);
  };

  const handleGenreToggle = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-black">
      
      {/* Back button header */}
      <div className="flex items-center gap-3 bg-white border-4 border-black p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-none justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 border-4 border-black bg-white hover:bg-black hover:text-white px-4 py-2 font-mono text-xs font-black uppercase shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition-all rounded-none"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          Cancel Add
        </button>
        <span className="font-mono text-xs font-black text-[#FF4500]">REGISTER_NEW_SHELF_INDEX_NODE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: CORE INPUT FORM GUTS */}
        <div className="lg:col-span-2">
          
          <form onSubmit={handleFormSubmit} className="border-4 border-black bg-white p-6 md:p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] space-y-6 rounded-none">
            <div className="border-b-4 border-black pb-3">
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-black flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-black stroke-[3]" />
                LOG OWNED WORK DETAILS
              </h2>
              <p className="text-[10px] text-gray-800 font-mono font-bold uppercase mt-1">ASSIGN COORDINATES INTO YOUR CATALOG LEDGER</p>
            </div>

            {/* Input inputs grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Title focus */}
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-mono font-black uppercase text-black">BOOK TITLE *</label>
                <div className="flex gap-2">
                  <input
                    id="add-title"
                    type="text"
                    required
                    placeholder="e.g. Crime and Punishment"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="flex-1 border-4 border-black bg-[#FFF7E8] p-2.5 text-xs font-black rounded-none focus:outline-none focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleSuggest}
                    className="bg-[#FFD700] hover:bg-black hover:text-[#FFD700] text-black px-4 py-2 border-4 border-black font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer shrink-0 rounded-none font-bold"
                  >
                    <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
                    Suggest Details
                  </button>
                </div>
                <span className="block text-[10px] text-[#FF4500] font-mono font-bold mt-1">Tip: Type famous titles like *Dune* or *Frankenstein* to test intelligent auto-fill suggestions.</span>
              </div>

              {/* Author name */}
              <div className="space-y-1">
                <label className="block text-xs font-mono font-black uppercase text-black">Author Name *</label>
                <input
                  id="add-author"
                  type="text"
                  required
                  placeholder="e.g. Fyodor Dostoevsky"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  className="w-full border-4 border-black bg-white p-2 text-xs font-black rounded-none focus:outline-none focus:bg-[#FFF7E8]"
                />
              </div>

              {/* Author nationality */}
              <div className="space-y-1">
                <label className="block text-xs font-mono font-black uppercase text-black">Author Nationality</label>
                <input
                  id="add-nationality"
                  type="text"
                  placeholder="e.g. Russian"
                  value={nationality}
                  onChange={e => setNationality(e.target.value)}
                  className="w-full border-4 border-black bg-white p-2 text-xs font-black rounded-none focus:outline-none focus:bg-[#FFF7E8]"
                />
              </div>

              {/* Content Type */}
              <div className="space-y-1">
                <label className="block text-xs font-mono font-black uppercase text-black">Content Split</label>
                <select
                  value={contentType}
                  onChange={e => setContentType(e.target.value as 'Fiction' | 'Non-Fiction')}
                  className="w-full border-4 border-black bg-white p-2 text-xs font-black rounded-none focus:outline-none focus:bg-[#FFF7E8]"
                >
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                </select>
              </div>

              {/* Registered Publisher */}
              <div className="space-y-1">
                <label className="block text-xs font-mono font-black uppercase text-black">Publisher</label>
                <input
                  id="add-publisher"
                  type="text"
                  placeholder="e.g. Penguin Books"
                  value={publisher}
                  onChange={e => setPublisher(e.target.value)}
                  className="w-full border-4 border-black bg-white p-2 text-xs font-black rounded-none focus:outline-none focus:bg-[#FFF7E8]"
                />
              </div>

              {/* Publication era year */}
              <div className="space-y-1">
                <label className="block text-xs font-mono font-black uppercase text-black">First Published Year</label>
                <input
                  id="add-year"
                  type="number"
                  placeholder="e.g. 1866"
                  value={pubYear}
                  onChange={e => setPubYear(e.target.value)}
                  className="w-full border-4 border-black bg-white p-2 text-xs font-black font-mono rounded-none focus:outline-none focus:bg-[#FFF7E8]"
                />
              </div>

              {/* Page count */}
              <div className="space-y-1">
                <label className="block text-xs font-mono font-black uppercase text-black">Page Count</label>
                <input
                  id="add-pages"
                  type="number"
                  placeholder="e.g. 671"
                  value={pages}
                  onChange={e => setPages(e.target.value)}
                  className="w-full border-4 border-black bg-white p-2 text-xs font-black font-mono rounded-none focus:outline-none focus:bg-[#FFF7E8]"
                />
              </div>

              {/* Format selection */}
              <div className="space-y-1">
                <label className="block text-xs font-mono font-black uppercase text-black">Physical Format</label>
                <select
                  value={format}
                  onChange={e => setFormat(e.target.value as 'Paperback' | 'Hardback' | 'Other')}
                  className="w-full border-4 border-black bg-white p-2 text-xs font-black rounded-none focus:outline-none focus:bg-[#FFF7E8]"
                >
                  <option value="Paperback">Paperback</option>
                  <option value="Hardback">Hardback</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Condition selection */}
              <div className="space-y-1">
                <label className="block text-xs font-mono font-black uppercase text-black">Physical Condition</label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value as 'Like New' | 'Good' | 'Fair' | 'Poor')}
                  className="w-full border-4 border-black bg-white p-2 text-xs font-black rounded-none focus:outline-none focus:bg-[#FFF7E8]"
                >
                  <option value="Like New">Like New</option>
                  <option value="Good">Good (VG)</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              {/* Purchase date */}
              <div className="space-y-1">
                <label className="block text-xs font-mono font-black uppercase text-black">Purchase Date (YYYY-MM-DD or &quot;Unknown&quot;)</label>
                <input
                  type="text"
                  placeholder="Unknown"
                  value={purchaseDate}
                  onChange={e => setPurchaseDate(e.target.value)}
                  className="w-full border-4 border-black bg-white p-2 text-xs font-black rounded-none focus:outline-none focus:bg-[#FFF7E8]"
                />
              </div>

              {/* Literary Period */}
              <div className="space-y-1">
                <label className="block text-xs font-mono font-black uppercase text-black">Literary Era Period</label>
                <select
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                  className="w-full border-4 border-black bg-white p-2 text-xs font-black rounded-none focus:outline-none focus:bg-[#FFF7E8]"
                >
                  {taxonomies.literaryPeriods.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Work Type Form */}
              <div className="space-y-1">
                <label className="block text-xs font-mono font-black uppercase text-black">Work Type Form</label>
                <select
                  value={workType}
                  onChange={e => setWorkType(e.target.value)}
                  className="w-full border-4 border-black bg-white p-2 text-xs font-black rounded-none focus:outline-none focus:bg-[#FFF7E8]"
                >
                  {taxonomies.workTypes.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>

              {/* Reading status */}
              <div className="space-y-1">
                <label className="block text-xs font-mono font-black uppercase text-black">Reading Status Log</label>
                <select
                  value={readStatus}
                  onChange={e => setReadStatus(e.target.value as 'Read' | 'Unread')}
                  className="w-full border-4 border-black bg-white p-2 text-xs font-black rounded-none focus:outline-none focus:bg-[#FFF7E8]"
                >
                  <option value="Read">Completed / Read</option>
                  <option value="Unread">Pending / Unread</option>
                </select>
              </div>

            </div>

            {/* TAXONOMY CLUSTERS SETUP */}
            <div className="space-y-4 pt-6 border-t-4 border-black">
              
              <div className="p-4 bg-[#FFF7E8] border-4 border-black rounded-none shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <label className="block text-xs font-mono font-black uppercase text-black mb-1.5">
                  Primary Group Genre Card *
                </label>
                <select
                  id="add-primary-genre"
                  required
                  value={primaryGenre}
                  onChange={e => setPrimaryGenre(e.target.value)}
                  className="w-full sm:w-1/2 border-4 border-black bg-white p-2 text-xs font-black focus:outline-none"
                >
                  <option value="">-- Select 1 Core Group Category --</option>
                  {taxonomies.genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <span className="block text-[10px] mt-2 text-[#FF4500] font-mono font-bold">
                  * This establishes the book&apos;s primary filing index slot.
                </span>
              </div>

              {/* Secondary checkbox assign tags */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-mono font-black uppercase text-black">
                  Assign Secondary Genres (Tag Joint array)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white border-4 border-black p-4 rounded-none">
                  {taxonomies.genres.map((g) => (
                    <label key={g} className="flex items-center gap-1.5 text-xs font-bold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedGenres.includes(g)}
                        onChange={() => handleGenreToggle(g)}
                        className="border-3 border-black bg-white cursor-pointer rounded-none focus:ring-0 w-4 h-4 text-black"
                      />
                      <span>{g}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* FORM SUBMISSION */}
            <button
              id="submit-new-book"
              type="submit"
              className="w-full bg-[#FF4500] hover:bg-black hover:text-white font-mono font-black text-xs uppercase tracking-widest text-white py-4 px-6 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] cursor-pointer transition-all duration-150 rounded-none mt-4"
            >
              Commit File & Catalog Book Node
            </button>
          </form>

        </div>

        {/* RIGHT COLUMN: INTELLIGENT METADATA FEEDBACK / REVIEW LIST */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-none sticky top-24">
            <h3 className="text-lg font-black uppercase italic tracking-tight text-black border-b-4 border-black pb-2 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
              Auto Enrichment Hub
            </h3>

            {isEnriching && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-black font-mono">
                <Loader2 className="w-8 h-8 text-black animate-spin mb-3 stroke-[3]" />
                <span className="text-xs font-black">QUERYING PRESET REFERENCE ARCHIVES...</span>
              </div>
            )}

            {!isEnriching && suggestions.length === 0 && !errorMessage && (
              <div className="text-center py-10 text-black flex flex-col items-center gap-3">
                <Library className="w-10 h-10 text-[#FF4500] stroke-[2.5]" />
                <p className="text-xs font-bold leading-relaxed">
                  Enter a book title like <strong className="font-extrabold italic">Crime and Punishment</strong> or <strong className="font-extrabold italic">Dune</strong> in the form, then click &quot;Suggest Details&quot; to discover pre-baked metadata recommendations!
                </p>
              </div>
            )}

            {errorMessage && (
              <div className="border-4 border-black bg-[#FF6347] p-4 font-mono text-[11px] font-black text-black uppercase flex gap-2 items-start shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 stroke-[3]" />
                <span>{errorMessage}</span>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-[#FFF7E8] border-4 border-black p-2.5 shadow-[3px_3px_0_0_rgba(0,0,0,1)] rounded-none">
                  <span className="font-mono text-[10px] font-black uppercase text-black">MAPPINGS:</span>
                  <button
                    type="button"
                    onClick={applyAllSuggestions}
                    className="bg-black text-white hover:bg-gray-800 text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-1.5 rounded-none cursor-pointer"
                  >
                    Apply All ({suggestions.length})
                  </button>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {suggestions.map((sug, idx) => {
                    const isGenres = sug.field === 'genres';
                    const displayValue = isGenres 
                      ? (sug.suggestedValue as string[]).join(', ') 
                      : String(sug.suggestedValue);

                    const isApplied = suggestionAppliedKeys.some(
                      k => k.startsWith(`${sug.field}:::`)
                    );

                    let confDot = 'bg-[#FFD700]';
                    if (sug.confidence === 'High') confDot = 'bg-[#90EE90]';
                    if (sug.confidence === 'Low') confDot = 'bg-[#FF6347]';

                    return (
                      <div 
                        key={idx} 
                        className={`border-4 border-black p-3 bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col justify-between gap-2.5 hover:bg-[#FFF7E8] relative rounded-none ${isApplied ? 'opacity-50' : ''}`}
                      >
                        <div>
                          <div className="flex justify-between items-center bg-gray-50 p-1 border-2 border-black">
                            <span className="font-mono font-black text-[10px] uppercase text-[#FF4500]">
                              {sug.field}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className={`w-2 h-2 ${confDot} border border-black`} />
                              <span className="font-mono text-[8px] font-black text-black uppercase">{sug.confidence}</span>
                            </div>
                          </div>

                          <div className="text-xs font-black text-black mt-2 bg-[#FFF7E8] p-2 border-2 border-black font-mono">
                            {displayValue}
                          </div>
                          
                          <p className="text-[10px] text-gray-800 leading-normal mt-1.5 font-sans">
                            {sug.reason}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => applySingleSuggestion(sug)}
                          disabled={isApplied}
                          className={`w-full font-mono text-[9px] font-black uppercase py-2 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center gap-1 active:translate-y-0.5 active:shadow-none duration-100 rounded-none ${
                            isApplied 
                              ? 'bg-gray-100 text-gray-450 shadow-none border-gray-300' 
                              : 'bg-[#90EE90] hover:bg-black hover:text-white text-black'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <CopyCheck className="w-3.5 h-3.5" />
                              Applied
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              Apply Suggestion
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="border-t-4 border-black border-dashed pt-4 mt-6 text-[10px] text-black font-mono leading-normal font-bold font-black">
              🔮 <strong>FUTURE CAPABILITIES:</strong> Outlined inside `EnrichmentProvider` interface, this service is fully prepared with pipeline entry hooks to stream directly from <strong>Open Library Search API</strong>, <strong>Google Books SDK</strong>, or a <strong>Gemini Server Route</strong>.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
