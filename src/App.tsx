/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LocalDB } from './storage/localStorageAdapter';
import { CatalogRepo } from './storage/db';
import { LoginPage } from './pages/LoginPage';
import { Navbar } from './components/layout/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { LibraryPage } from './pages/LibraryPage';
import { BookDetailPage } from './pages/BookDetailPage';
import { AddBookPage } from './pages/AddBookPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { TaxonomyPage } from './pages/TaxonomyPage';
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

  // Synchronize internal state with LocalStorage cached parameters
  const syncWithLocalStorage = () => {
    const snap = CatalogRepo.getLocalSnapshot();
    setBooks(snap.books);
    setBookGenres(snap.genres);
    setTaxonomies(snap.taxonomies);
    setUnlocked(snap.unlocked);
  };

  useEffect(() => {
    // Initial loading from fast local storage
    syncWithLocalStorage();

    // Trigger cloud synchronization in the background if credentials exist
    if (CatalogRepo.isCloudActive()) {
      CatalogRepo.fetchAllData()
        .then((cloudData) => {
          setBooks(cloudData.books);
          setBookGenres(cloudData.genres);
          setTaxonomies(cloudData.taxonomies);
          console.log('☁️ Synchronization with active Supabase server established.');
        })
        .catch((err) => {
          console.warn('⚠️ Cloud sync deferred:', err.message);
        });
    }
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
    triggerToast("🔓 Decentralized Archive Decrypted. Command Center Online.");
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
          triggerToast("🔄 Local catalog nodes & active Supabase cloud tables successfully reset.");
        } catch (err) {
          console.error("Cloud database re-seed failed during system reset:", err);
        }
      } else {
        triggerToast("🔄 System Flushed. Preset catalog nodes successfully reloaded.");
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

    triggerToast("📥 Archives Exported. Typed JSON compiled and downloaded.");
  };

  // CRUD operation callbacks
  const handleAddBook = async (book: Book, genres: { genre: string; isPrimary: boolean }[]) => {
    await CatalogRepo.saveBook(book, genres);
    syncWithLocalStorage();
    
    // Navigate to see detail of newly logged item
    setSelectedBookID(book.BookID);
    setIsAddingBook(false);
    triggerToast(`✅ Successfully registered book node: ${book.Title}`);
  };

  const handleEditBook = async (book: Book, genres: { genre: string; isPrimary: boolean }[]) => {
    await CatalogRepo.saveBook(book, genres);
    syncWithLocalStorage();
    triggerToast(`💾 Updates committed safely for ${book.Title}`);
  };

  const handleDeleteBook = async (bookId: string) => {
    const match = books.find(b => b.BookID === bookId);
    await CatalogRepo.deleteBook(bookId);
    syncWithLocalStorage();
    
    // Navigate back to library catalogue
    setSelectedBookID(null);
    setActiveTab('library');
    triggerToast(`🗑️ Erased archive record: "${match ? match.Title : bookId}"`);
  };

  const handleSaveTaxonomy = async (key: keyof TaxonomyLists, newList: string[]) => {
    await CatalogRepo.saveTaxonomy(key, newList);
    syncWithLocalStorage();
    triggerToast(`⚙️ Modified reference definitions for ${String(key)}`);
  };


  const changeTab = (tab: string) => {
    setActiveTab(tab);
    setSelectedBookID(null);
    setIsAddingBook(false);
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
      />

      {/* Primary Container Body */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 relative z-10">
        
        {/* NESTED VIEW ROUTER */}
        {selectedBookID ? (
          
          /* Nested subpage 1: Profile item details */
          <BookDetailPage
            bookId={selectedBookID}
            books={books}
            bookGenres={bookGenres}
            taxonomies={taxonomies}
            onBack={() => setSelectedBookID(null)}
            onDeleteBook={handleDeleteBook}
            onEditBook={handleEditBook}
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
              />
            )}

            {activeTab === 'library' && (
              <LibraryPage
                books={books}
                bookGenres={bookGenres}
                taxonomies={taxonomies}
                onViewBook={(id) => setSelectedBookID(id)}
                onNavigateToAddBook={() => setIsAddingBook(true)}
              />
            )}

            {activeTab === 'analysis' && (
              <AnalysisPage
                books={books}
                bookGenres={bookGenres}
                onViewBook={(id) => setSelectedBookID(id)}
                onNavigateToTaxonomies={() => changeTab('taxonomies')}
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
            © {new Date().getFullYear()} <strong>BOOKS I OWN DATABASE</strong> • COMMAND CENTER V1.02
          </div>
          <div className="flex gap-4 items-center">
            <span>VAULT ENGINE: {CatalogRepo.isCloudActive() ? 'SUPABASE CLOUD DB' : 'LSTORAGE_B_DB'}</span>
            <span>•</span>
            {CatalogRepo.isCloudActive() ? (
              <span className="text-black bg-[#90EE90] px-2 py-0.5 border border-black font-black italic">CLOUD_MODE: ONLINE</span>
            ) : (
              <span className="text-[#FF4500] italic">LOCAL_MODE: ACTIVE</span>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
}
