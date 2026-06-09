/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LocalDB } from './storage/localStorageAdapter';
import { CatalogRepo } from './storage/db';
import { initializeSupabase } from './storage/supabaseClient';
import { LoginPage } from './pages/LoginPage';
import { Navbar } from './components/layout/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { LibraryPage } from './pages/LibraryPage';
import { BookDetailPage } from './pages/BookDetailPage';
import { AddBookPage } from './pages/AddBookPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { TaxonomyPage } from './pages/TaxonomyPage';
import { AuthorsPage } from './pages/AuthorsPage';
import { Book, TaxonomyLists, BookGenre } from './types';
import { Check, ShieldCheck, RefreshCcw, Download } from 'lucide-react';

export default function App() {
  // Padlock security gate state
  const [unlocked, setUnlocked] = useState(false);

  // Tab State: 'dashboard' | 'library' | 'analysis' | 'taxonomies'
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Nested Sub-routing state (Detail page vs Creation page)
  const [selectedBookID, setSelectedBookID] = useState<string | null>(null);
  const [isAddingBook, setIsAddingBook] = useState<boolean>(false);
  const [selectedAuthorName, setSelectedAuthorName] = useState<string | null>(null);

  // In-memory synced DB records to trigger component rerenders
  const [books, setBooks] = useState<Book[]>([]);
  const [bookGenres, setBookGenres] = useState<BookGenre[]>([]);
  const [taxonomies, setTaxonomies] = useState<TaxonomyLists>({
    genres: [],
    workTypes: [],
    literaryPeriods: [],
    publishers: [],
    formats: [],
    conditions: [],
    contentTypes: []
  });

  // Toast banner animations state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Connection diagnostics states
  const [dbState, setDbState] = useState<'pending' | 'connected' | 'error' | 'disconnected'>('pending');
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Custom manual keys input override configuration
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [customUrl, setCustomUrl] = useState(localStorage.getItem('CUSTOM_SU_URL') || '');
  const [customKey, setCustomKey] = useState(localStorage.getItem('CUSTOM_SU_KEY') || '');

  // Synchronize internal state with LocalStorage cached parameters
  const syncWithLocalStorage = () => {
    const snap = CatalogRepo.getLocalSnapshot();
    setBooks(snap.books);
    setBookGenres(snap.genres);
    setTaxonomies(snap.taxonomies);
    setUnlocked(snap.unlocked);
  };

  const handleSaveCustomKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim() && customKey.trim()) {
      localStorage.setItem('CUSTOM_SU_URL', customUrl.trim());
      localStorage.setItem('CUSTOM_SU_KEY', customKey.trim());
      triggerToast("💾 Custom connection secrets saved in browser Cache! Reloading library...");
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } else {
      alert("⚠️ Both Database Link and Anon Token are required to override.");
    }
  };

  const handleClearCustomKeys = () => {
    localStorage.removeItem('CUSTOM_SU_URL');
    localStorage.removeItem('CUSTOM_SU_KEY');
    triggerToast("🗑️ Custom credentials wiped completely. Reverting back to workspace environment.");
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  useEffect(() => {
    // Initial loading from fast local storage
    syncWithLocalStorage();
    setDbState('pending');

    // Fetch live connection credentials from Express dynamic environment config
    fetch('/api/config')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((config) => {
        const serverUrl = config.supabaseUrl || '';
        const serverKey = config.supabaseAnonKey || '';

        if (serverUrl && serverKey) {
          const storedUrl = localStorage.getItem('CUSTOM_SU_URL') || '';
          const storedKey = localStorage.getItem('CUSTOM_SU_KEY') || '';

          if (storedUrl !== serverUrl || storedKey !== serverKey) {
            console.log('🔌 Dynamic db keys updated on runtime container server. Storing and initiating...');
            localStorage.setItem('CUSTOM_SU_URL', serverUrl);
            localStorage.setItem('CUSTOM_SU_KEY', serverKey);
            initializeSupabase(serverUrl, serverKey);
            // Refresh window to topological hydrate imports clean
            window.location.reload();
            return;
          }
        }

        // Trigger cloud database synchronization in background
        if (!CatalogRepo.isCloudActive()) {
          setDbState('disconnected');
          setDbError('Supabase database credentials are missing. Add them in Secrets settings to connect, or manually override below.');
        } else {
          CatalogRepo.fetchAllData()
            .then((cloudData) => {
              setBooks(cloudData.books);
              setBookGenres(cloudData.genres);
              setTaxonomies(cloudData.taxonomies);
              setDbState('connected');
              setDbError(null);
              console.log('☁️ Synchronization with active Supabase server established.');
            })
            .catch((err) => {
              setDbState('error');
              setDbError(err?.message || String(err));
              console.error('⚠️ Supabase cloud synchronization error:', err);
            });
        }
      })
      .catch((err) => {
        console.warn('Could not retrieve runtime database configuration from backend server, falling back to Cache:', err);
        if (!CatalogRepo.isCloudActive()) {
          setDbState('disconnected');
          setDbError('Supabase database credentials are missing.');
        } else {
          CatalogRepo.fetchAllData()
            .then((cloudData) => {
              setBooks(cloudData.books);
              setBookGenres(cloudData.genres);
              setTaxonomies(cloudData.taxonomies);
              setDbState('connected');
              setDbError(null);
            })
            .catch((syncErr) => {
              setDbState('error');
              setDbError(syncErr?.message || String(syncErr));
            });
        }
      });
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Auth unlock callback
  const handleUnlock = () => {
    setUnlocked(true);
    triggerToast("🔓 Library unlocked successfully.");
  };

  // Auth lock callback
  const handleLock = () => {
    LocalDB.setUnlockState(false);
    setUnlocked(false);
    setActiveTab('dashboard');
    setSelectedBookID(null);
    setIsAddingBook(false);
  };

  // Reset demo callback
  const handleResetDatabase = async () => {
    if (confirm("🛠️ WARNING: This will overwrite any additions/modifications and reload default library presets. Continue?")) {
      LocalDB.resetDatabase();
      syncWithLocalStorage();
      
      // If Supabase is active, clean and re-seed the tables
      if (CatalogRepo.isCloudActive()) {
        try {
          const freshBooks = LocalDB.getBooks();
          const freshGenres = LocalDB.getBookGenres();
          const freshTax = LocalDB.getTaxonomies();
          
          // Force push initial sets to cloud
          const { SupabaseDB } = await import('./storage/supabaseAdapter');
          await Promise.all([
            ...freshBooks.map(b => SupabaseDB.saveBook(b)),
            ...Array.from(new Set(freshGenres.map(g => g.BookID))).map(bid => {
              const bookAssoc = freshGenres.filter(g => g.BookID === bid).map(g => ({ genre: g.Genre, isPrimary: g.Primary }));
              return SupabaseDB.saveBookGenres(bid, bookAssoc);
            }),
            SupabaseDB.saveTaxonomy(freshTax)
          ]);
          triggerToast("🔄 Library collection and custom settings have been reset.");
        } catch (err) {
          console.error("Cloud database re-seed failed during system reset:", err);
        }
      } else {
        triggerToast("🔄 Library reset. Default books have been reloaded.");
      }
      setActiveTab('dashboard');
      setSelectedBookID(null);
      setIsAddingBook(false);
    }
  };

  // Export JSON callback
  const handleExportJSON = () => {
    const backupDataset = {
      app: "books-i-own-database",
      schema_version: "1.0.0",
      exported_at: new Date().toISOString(),
      books: LocalDB.getBooks(),
      book_genres: LocalDB.getBookGenres(),
      taxonomies: LocalDB.getTaxonomies()
    };

    const fileContent = JSON.stringify(backupDataset, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });
    const localUrl = URL.createObjectURL(blob);
    
    // Virtual anchor click trigger
    const link = document.createElement('a');
    link.href = localUrl;
    link.download = `books_i_own_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(localUrl);

    triggerToast("📥 Library collection exported as JSON file.");
  };

  // CRUD operation callbacks
  const handleAddBook = async (book: Book, genres: { genre: string; isPrimary: boolean }[]) => {
    await CatalogRepo.saveBook(book, genres);
    syncWithLocalStorage();
    
    // Navigate to see detail of newly logged item
    setSelectedBookID(book.BookID);
    setIsAddingBook(false);
    triggerToast(`✅ Book added successfully: ${book.Title}`);
  };

  const handleEditBook = async (book: Book, genres: { genre: string; isPrimary: boolean }[]) => {
    await CatalogRepo.saveBook(book, genres);
    syncWithLocalStorage();
    triggerToast(`💾 Saved updates for ${book.Title}`);
  };

  const handleDeleteBook = async (bookId: string) => {
    const match = books.find(b => b.BookID === bookId);
    await CatalogRepo.deleteBook(bookId);
    syncWithLocalStorage();
    
    // Navigate back to library catalogue
    setSelectedBookID(null);
    setActiveTab('library');
    triggerToast(`🗑️ Removed "${match ? match.Title : bookId}" from your collection`);
  };

  const handleSaveTaxonomy = async (key: keyof TaxonomyLists, newList: string[]) => {
    await CatalogRepo.saveTaxonomy(key, newList);
    syncWithLocalStorage();
    triggerToast(`⚙️ Updated custom options for ${String(key)}`);
  };


  const handleViewAuthor = (authorName: string) => {
    setSelectedAuthorName(authorName);
    setActiveTab('authors');
    setSelectedBookID(null);
    setIsAddingBook(false);
  };

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    setSelectedBookID(null);
    setIsAddingBook(false);
    setSelectedAuthorName(null);
  };

  // Guard Clause: Full screen lock entry gate
  if (!unlocked) {
    return <LoginPage onUnlock={handleUnlock} />;
  }

  return (
    <div className="min-h-screen bg-[#FDF6E3] flex flex-col font-sans text-[#1A1A1A] leading-normal relative overflow-x-hidden selection:bg-[#FFD700] selection:text-black">
      
      {/* Dynamic feedback systems toast banner */}
      {toastMessage && (
        <div 
          id="toast-banner" 
          className="fixed bottom-6 right-6 border-4 border-black bg-[#90EE90] text-xs font-mono font-black uppercase p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] z-50 flex items-center gap-3 animate-bounce leading-none"
        >
          <div className="w-5 h-5 bg-white border-2 border-black flex items-center justify-center rounded-none">
            <Check className="w-3 h-3 text-black stroke-[3]" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Decorative page elements mimicking antique blueprints or vintage letterheads */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-black z-40 pointer-events-none" />

      {/* Visual background textures */}
      <div className="absolute inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none" />

      {/* Primary Toolbar Navbar */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={changeTab}
        onLock={handleLock}
        onReset={handleResetDatabase}
        onExport={handleExportJSON}
        booksCount={books.length}
        dbState={dbState}
      />

      {/* Primary Container Body */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 relative z-10">
        
        {dbState === 'pending' ? (
          <div className="flex flex-col items-center justify-center py-24 font-mono">
            <div className="w-12 h-12 border-4 border-black border-t-[#FF4500] animate-spin rounded-none mb-6 shadow-[3px_3px_0_0_rgba(0,0,0,1)]" />
            <p className="font-black uppercase tracking-wider text-xs text-black animate-pulse">Syncing Database Catalog Connection...</p>
          </div>
        ) : dbState === 'error' || dbState === 'disconnected' ? (
          <div className="max-w-xl mx-auto my-8 p-6 md:p-8 border-4 border-black bg-rose-50 shadow-[6px_6px_0_0_rgba(0,0,0,1)] text-[#1a1a1a]">
            <div className="flex items-center gap-3 border-b-4 border-black pb-4 mb-6">
              <span className="text-4xl">🚨</span>
              <div>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-red-700">Database Connection Required</h2>
                <p className="font-mono text-[9px] uppercase font-black tracking-wider mt-0.5 text-gray-600 bg-white px-1.5 py-0.5 border border-black inline-block">Strict Mode Enforced • No local storage silent fallback</p>
              </div>
            </div>
            
            <p className="text-xs font-bold leading-relaxed mb-4 text-[#333]">
              The library is strictly configured to protect against local cache divergence. Since a secure connection with the Supabase database could not be established, the workspace features are disabled to prevent out-of-sync edits.
            </p>
            
            <div className="bg-white border-2 border-black p-4 font-mono text-xs mb-6 text-red-700 font-bold max-h-40 overflow-y-auto shadow-[2px_2px_0_rgba(0,0,0,1)]">
              <p className="uppercase text-[9px] text-gray-500 font-black tracking-wider mb-1">Error Connection Diagnostics:</p>
              <code className="break-all">{dbError || "No active credentials in container system secrets setup."}</code>
            </div>

            <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0_0_rgba(0,0,0,0.15)] font-mono text-xs">
              <h3 className="font-black uppercase text-xs border-b-2 border-black pb-1.5 mb-4 flex items-center justify-between">
                <span>Configure Supabase Connection</span>
                <span className="text-[9px] bg-[#FFD700] text-black px-1.5 border border-black uppercase font-black">Local override Console</span>
              </h3>
              <p className="text-[10px] text-gray-500 mb-3 leading-snug">
                Ensure database credentials (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) are configured inside the Workspace Settings Secrets panel. Alternatively, override them directly below to connect this browser window:
              </p>
              
              <form onSubmit={handleSaveCustomKeys} className="space-y-4">
                <div>
                  <label className="block text-[9px] uppercase font-black text-neutral-700 mb-1">
                    Supabase Project API URL (VITE_SUPABASE_URL)
                  </label>
                  <input
                    type="url"
                    id="input-screen-su-url"
                    required
                    placeholder="https://your-project-ref.supabase.co"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full border-2 border-black p-2 text-xs font-mono outline-none focus:bg-yellow-50"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-black text-neutral-700 mb-1">
                    Supabase Anon Publishable Key (VITE_SUPABASE_ANON_KEY)
                  </label>
                  <input
                    type="text"
                    id="input-screen-su-key"
                    required
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    className="w-full border-2 border-black p-2 text-xs font-mono outline-none focus:bg-yellow-50"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="bg-emerald-400 hover:bg-emerald-500 text-black font-black uppercase tracking-wider px-4 py-2 border-2 border-black text-[10px] shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer"
                  >
                    Save & Test Connection
                  </button>
                  {localStorage.getItem('CUSTOM_SU_URL') && (
                    <button
                      type="button"
                      onClick={handleClearCustomKeys}
                      className="bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-wider px-4 py-2 border-2 border-black text-[10px] shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer"
                    >
                      Clear Saved Overrides
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        ) : selectedBookID ? (
          
          /* Nested subpage 1: Profile item details */
          <BookDetailPage
            bookId={selectedBookID}
            books={books}
            bookGenres={bookGenres}
            taxonomies={taxonomies}
            onBack={() => setSelectedBookID(null)}
            onDeleteBook={handleDeleteBook}
            onEditBook={handleEditBook}
            onViewAuthor={handleViewAuthor}
          />

        ) : isAddingBook ? (

          /* Nested subpage 2: Creation page */
          <AddBookPage
            books={books}
            taxonomies={taxonomies}
            onBack={() => setIsAddingBook(false)}
            onAddBook={handleAddBook}
          />

        ) : (

          /* Main tab view manager */
          <>
            {activeTab === 'dashboard' && (
              <DashboardPage
                books={books}
                bookGenres={bookGenres}
                onNavigateToLibrary={() => changeTab('library')}
                onNavigateToAddBook={() => setIsAddingBook(true)}
                onViewAuthor={handleViewAuthor}
              />
            )}

            {activeTab === 'library' && (
              <LibraryPage
                books={books}
                bookGenres={bookGenres}
                taxonomies={taxonomies}
                onViewBook={(id) => setSelectedBookID(id)}
                onNavigateToAddBook={() => setIsAddingBook(true)}
                onViewAuthor={handleViewAuthor}
              />
            )}

            {activeTab === 'authors' && (
              <AuthorsPage
                books={books}
                bookGenres={bookGenres}
                onViewBook={(id) => setSelectedBookID(id)}
                selectedAuthorName={selectedAuthorName}
                onSelectAuthorName={setSelectedAuthorName}
              />
            )}

            {activeTab === 'analysis' && (
              <AnalysisPage
                books={books}
                bookGenres={bookGenres}
                onViewBook={(id) => setSelectedBookID(id)}
                onNavigateToTaxonomies={() => changeTab('taxonomies')}
                onViewAuthor={handleViewAuthor}
              />
            )}

            {activeTab === 'taxonomies' && (
              <TaxonomyPage
                taxonomies={taxonomies}
                onSaveTaxonomy={handleSaveTaxonomy}
              />
            )}
          </>

        )}

      </main>

      {/* Footer stamp panel */}
      <footer className="w-full border-t-4 border-black bg-white p-6 text-center font-mono text-[10px] text-black uppercase font-bold mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            © {new Date().getFullYear()} <strong>BOOKS I OWN</strong> • PERSONAL LIBRARY CATALOG
          </div>
          <div className="flex gap-4 items-center">
            <span>STORAGE TYPE: {CatalogRepo.isCloudActive() ? 'SUPABASE CLOUD' : 'LOCAL BROWSER'}</span>
            <span>•</span>
            {CatalogRepo.isCloudActive() ? (
              <span className="text-black bg-[#90EE90] px-2 py-0.5 border border-black font-black italic">CLOUD SYNCED</span>
            ) : (
              <span className="text-[#FF4500] italic">OFFLINE MODE</span>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
}
