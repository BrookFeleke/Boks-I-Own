/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LocalDB } from './localStorageAdapter';
import { SupabaseDB } from './supabaseAdapter';
import { Book, BookGenre, TaxonomyLists } from '../types';
import { SEED_BOOKS } from '../data/seedBooks';
import { SEED_GENRES } from '../data/seedGenres';
import {
  GENRES_TAXONOMY,
  LITERARY_PERIODS_TAXONOMY,
  PUBLISHERS_TAXONOMY,
  WORK_TYPES_TAXONOMY,
  FORMATS_TAXONOMY,
  CONDITIONS_TAXONOMY,
  CONTENT_TYPES_TAXONOMY
} from '../data/taxonomies';

let dbStatus: 'connected' | 'error' | 'disconnected' = 'disconnected';
let dbErrorMessage: string | null = null;

export const CatalogRepo = {
  // Get database status
  getDbStatus(): 'connected' | 'error' | 'disconnected' {
    if (!SupabaseDB.isEnabled()) {
      return 'disconnected';
    }
    return dbStatus;
  },

  // Get database connection or query error message
  getDbErrorMessage(): string | null {
    if (!SupabaseDB.isEnabled()) {
      return 'Supabase credentials (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) are missing in this environment.';
    }
    return dbErrorMessage;
  },

  // Check if Supabase mode is active
  isCloudActive(): boolean {
    return SupabaseDB.isEnabled();
  },

  // Pull local cache instantly for rendering
  getLocalSnapshot() {
    return {
      books: LocalDB.getBooks(),
      genres: LocalDB.getBookGenres(),
      taxonomies: LocalDB.getTaxonomies(),
      unlocked: LocalDB.isUnlocked()
    };
  },

  // Perform full async sync with Supabase
  async fetchAllData(): Promise<{ books: Book[]; genres: BookGenre[]; taxonomies: TaxonomyLists }> {
    const local = this.getLocalSnapshot();
    
    if (SupabaseDB.isEnabled()) {
      try {
        const [cloudBooks, cloudGenres, cloudTax] = await Promise.all([
          SupabaseDB.getBooks(),
          SupabaseDB.getBookGenres(),
          SupabaseDB.getTaxonomies()
        ]);
        
        dbStatus = 'connected';
        dbErrorMessage = null;
        
        let mergedBooks = cloudBooks || [];
        let mergedGenres = cloudGenres || [];
        let mergedTax = cloudTax || null;

        // AUTOMATED CLOUD SEEDING PIPELINE: If active Supabase cloud connection contains 0 books,
        // seed it with our rich fallback seed libraries to prevent blank states.
        if (mergedBooks.length === 0) {
          console.log('🔄 Detected empty active Supabase library database. Performing automated schema-safe seed...');
          
          const booksToSeed = local.books.length > 0 ? local.books : SEED_BOOKS;
          const genresToSeed = local.genres.length > 0 ? local.genres : SEED_GENRES;
          const taxToSeed: TaxonomyLists = (local.taxonomies && local.taxonomies.genres && local.taxonomies.genres.length > 0)
            ? local.taxonomies
            : {
                genres: GENRES_TAXONOMY,
                workTypes: WORK_TYPES_TAXONOMY,
                literaryPeriods: LITERARY_PERIODS_TAXONOMY,
                publishers: PUBLISHERS_TAXONOMY,
                formats: FORMATS_TAXONOMY,
                conditions: CONDITIONS_TAXONOMY,
                contentTypes: CONTENT_TYPES_TAXONOMY
              };

          try {
            await SupabaseDB.saveBooksBulk(booksToSeed);
            await SupabaseDB.saveBookGenresBulk(genresToSeed);
            await SupabaseDB.saveTaxonomy(taxToSeed);
            
            mergedBooks = booksToSeed;
            mergedGenres = genresToSeed;
            mergedTax = taxToSeed;
            
            console.log('✅ Automated cloud database seeding completed successfully.');
          } catch (seedErr) {
            console.error('⚠️ Direct automated cloud seeding encountered errors:', seedErr);
            // Fallback to local
            mergedBooks = booksToSeed;
            mergedGenres = genresToSeed;
            mergedTax = taxToSeed;
          }
        }

        const finalTax = mergedTax || local.taxonomies;
        
        // Synchronize local replica with live cloud assets
        localStorage.setItem('books_i_own_books', JSON.stringify(mergedBooks));
        localStorage.setItem('books_i_own_genres', JSON.stringify(mergedGenres));
        localStorage.setItem('books_i_own_taxonomies', JSON.stringify(finalTax));
        
        return {
          books: mergedBooks,
          genres: mergedGenres,
          taxonomies: finalTax
        };
      } catch (err: any) {
        dbStatus = 'error';
        dbErrorMessage = err?.message || String(err);
        console.error('Supabase cloud synchronization failed. Active issue details:', err);
        throw err; // Forward error so that client UI is aware of connection loss
      }
    }
    
    // Fallback if local books are empty for some reason
    if (local.books.length === 0) {
      console.log('🔄 Local fallback triggered. Rewriting local cache replica with SEED_BOOKS.');
      localStorage.setItem('books_i_own_books', JSON.stringify(SEED_BOOKS));
      localStorage.setItem('books_i_own_genres', JSON.stringify(SEED_GENRES));
      const initialTaxonomies: TaxonomyLists = {
        genres: GENRES_TAXONOMY,
        workTypes: WORK_TYPES_TAXONOMY,
        literaryPeriods: LITERARY_PERIODS_TAXONOMY,
        publishers: PUBLISHERS_TAXONOMY,
        formats: FORMATS_TAXONOMY,
        conditions: CONDITIONS_TAXONOMY,
        contentTypes: CONTENT_TYPES_TAXONOMY
      };
      localStorage.setItem('books_i_own_taxonomies', JSON.stringify(initialTaxonomies));
      return {
        books: SEED_BOOKS,
        genres: SEED_GENRES,
        taxonomies: initialTaxonomies
      };
    }

    return {
      books: local.books,
      genres: local.genres,
      taxonomies: local.taxonomies
    };
  },

  // Insert or edit book
  async saveBook(book: Book, genres: { genre: string; isPrimary: boolean }[]): Promise<void> {
    // 1. Native local write for 0ms lag UI
    LocalDB.saveBook(book);
    LocalDB.saveBookGenres(book.BookID, genres);
    
    // 2. Cloud upstream
    if (SupabaseDB.isEnabled()) {
      try {
        await SupabaseDB.saveBook(book);
        await SupabaseDB.saveBookGenres(book.BookID, genres);
      } catch (err) {
        console.error('Supabase async cloud sync write failed:', err);
      }
    }
  },

  // Delete book
  async deleteBook(bookId: string): Promise<void> {
    // 1. Native local delete
    LocalDB.deleteBook(bookId);
    
    // 2. Cloud delete
    if (SupabaseDB.isEnabled()) {
      try {
        await SupabaseDB.deleteBook(bookId);
      } catch (err) {
        console.error('Supabase async cloud sync deletion failed:', err);
      }
    }
  },

  // Modify specific taxonomy list
  async saveTaxonomy(key: keyof TaxonomyLists, newList: string[]): Promise<void> {
    // 1. Native local save
    LocalDB.saveTaxonomy(key, newList);
    
    // 2. Cloud save
    if (SupabaseDB.isEnabled()) {
      try {
        const fullTax = LocalDB.getTaxonomies();
        await SupabaseDB.saveTaxonomy(fullTax);
      } catch (err) {
        console.error('Supabase async cloud sync taxonomies update failed:', err);
      }
    }
  }
};
