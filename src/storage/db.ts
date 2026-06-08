/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LocalDB } from './localStorageAdapter';
import { SupabaseDB } from './supabaseAdapter';
import { Book, BookGenre, TaxonomyLists } from '../types';

export const CatalogRepo = {
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
        
        const mergedBooks = cloudBooks || [];
        const mergedGenres = cloudGenres || [];
        const mergedTax = cloudTax || local.taxonomies;
        
        // Synchronize local replica with live cloud assets
        localStorage.setItem('books_i_own_books', JSON.stringify(mergedBooks));
        localStorage.setItem('books_i_own_genres', JSON.stringify(mergedGenres));
        localStorage.setItem('books_i_own_taxonomies', JSON.stringify(mergedTax));
        
        return {
          books: mergedBooks,
          genres: mergedGenres,
          taxonomies: mergedTax
        };
      } catch (err) {
        console.warn('Supabase cloud synchronization deferred. Reading from local cache replica.', err);
      }
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
