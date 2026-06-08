/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

const KEYS = {
  BOOKS: 'books_i_own_books',
  GENRES: 'books_i_own_genres',
  TAXONOMIES: 'books_i_own_taxonomies',
  APP_UNLOCKED: 'books_i_own_unlocked'
};

export function initializeStorage(forceReset = false) {
  if (forceReset || !localStorage.getItem(KEYS.BOOKS)) {
    localStorage.setItem(KEYS.BOOKS, JSON.stringify(SEED_BOOKS));
    localStorage.setItem(KEYS.GENRES, JSON.stringify(SEED_GENRES));
    
    const initialTaxonomies: TaxonomyLists = {
      genres: GENRES_TAXONOMY,
      workTypes: WORK_TYPES_TAXONOMY,
      literaryPeriods: LITERARY_PERIODS_TAXONOMY,
      publishers: PUBLISHERS_TAXONOMY,
      formats: FORMATS_TAXONOMY,
      conditions: CONDITIONS_TAXONOMY,
      contentTypes: CONTENT_TYPES_TAXONOMY
    };
    localStorage.setItem(KEYS.TAXONOMIES, JSON.stringify(initialTaxonomies));
  }
}

// Global invocation to ensure we have data on boot
if (typeof window !== 'undefined') {
  initializeStorage();
}

export const LocalDB = {
  // Books CRUD
  getBooks(): Book[] {
    const data = localStorage.getItem(KEYS.BOOKS);
    return data ? JSON.parse(data) : [];
  },

  saveBook(book: Book): void {
    const books = this.getBooks();
    const index = books.findIndex(b => b.BookID === book.BookID);
    if (index >= 0) {
      books[index] = book;
    } else {
      books.push(book);
    }
    localStorage.setItem(KEYS.BOOKS, JSON.stringify(books));
  },

  deleteBook(bookId: string): void {
    // Delete book
    const books = this.getBooks().filter(b => b.BookID !== bookId);
    localStorage.setItem(KEYS.BOOKS, JSON.stringify(books));

    // Delete associated genres
    const genres = this.getBookGenres().filter(g => g.BookID !== bookId);
    localStorage.setItem(KEYS.GENRES, JSON.stringify(genres));
  },

  // Genres CRUD
  getBookGenres(): BookGenre[] {
    const data = localStorage.getItem(KEYS.GENRES);
    return data ? JSON.parse(data) : [];
  },

  getGenresForBook(bookId: string): BookGenre[] {
    return this.getBookGenres().filter(g => g.BookID === bookId);
  },

  saveBookGenres(bookId: string, genresList: { genre: string; isPrimary: boolean }[]): void {
    // Remove existing
    let allGenres = this.getBookGenres().filter(g => g.BookID !== bookId);
    
    // Add new ones
    const newGenres: BookGenre[] = genresList.map(g => ({
      BookID: bookId,
      Genre: g.genre,
      Primary: g.isPrimary
    }));
    
    allGenres = [...allGenres, ...newGenres];
    localStorage.setItem(KEYS.GENRES, JSON.stringify(allGenres));
  },

  // Taxonomies
  getTaxonomies(): TaxonomyLists {
    const data = localStorage.getItem(KEYS.TAXONOMIES);
    if (data) {
      return JSON.parse(data);
    }
    return {
      genres: GENRES_TAXONOMY,
      workTypes: WORK_TYPES_TAXONOMY,
      literaryPeriods: LITERARY_PERIODS_TAXONOMY,
      publishers: PUBLISHERS_TAXONOMY,
      formats: FORMATS_TAXONOMY,
      conditions: CONDITIONS_TAXONOMY,
      contentTypes: CONTENT_TYPES_TAXONOMY
    };
  },

  saveTaxonomy(key: keyof TaxonomyLists, newList: string[]): void {
    const taxonomies = this.getTaxonomies();
    taxonomies[key] = newList;
    localStorage.setItem(KEYS.TAXONOMIES, JSON.stringify(taxonomies));
  },

  // Reset
  resetDatabase(): void {
    initializeStorage(true);
  },

  // Security Gate status
  isUnlocked(): boolean {
    return localStorage.getItem(KEYS.APP_UNLOCKED) === 'true';
  },

  setUnlockState(unlocked: boolean): void {
    localStorage.setItem(KEYS.APP_UNLOCKED, unlocked ? 'true' : 'false');
  }
};
