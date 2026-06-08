/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Book, BookGenre, TaxonomyLists } from '../types';

export const SupabaseDB = {
  // Check if Supabase keys exist
  isEnabled(): boolean {
    return isSupabaseConfigured;
  },

  // Pull all books
  async getBooks(): Promise<Book[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('title', { ascending: true });
      
    if (error) {
      console.error('Error fetching books from Supabase:', error);
      throw error;
    }
    
    return (data || []).map(row => ({
      BookID: row.book_id,
      Title: row.title,
      Author: row.author,
      AuthorNationality: row.author_nationality || '',
      ContentType: row.content_type || 'Fiction',
      WorkType: row.work_type || 'Novel',
      LiteraryPeriod: row.literary_period || 'Unknown',
      ReadStatus: row.read_status || 'Unread',
      Format: row.format || 'Paperback',
      Condition: row.condition || 'Fair',
      Publisher: row.publisher || 'Unknown',
      PublishedYear: Number(row.published_year) || 0,
      PageCount: Number(row.page_count) || 0,
      PurchaseDate: row.purchase_date || 'Unknown',
      PrimaryGenre: row.primary_genre || ''
    }));
  },

  // Save/Upsert a book
  async saveBook(book: Book): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    const { error } = await supabase
      .from('books')
      .upsert({
        book_id: book.BookID,
        title: book.Title,
        author: book.Author,
        author_nationality: book.AuthorNationality,
        content_type: book.ContentType,
        work_type: book.WorkType,
        literary_period: book.LiteraryPeriod,
        read_status: book.ReadStatus,
        format: book.Format,
        condition: book.Condition,
        publisher: book.Publisher,
        published_year: book.PublishedYear,
        page_count: book.PageCount,
        purchase_date: book.PurchaseDate,
        primary_genre: book.PrimaryGenre
      });

    if (error) {
      console.error('Error saving book in Supabase:', error);
      throw error;
    }
  },

  // Delete book and dependent cascade records
  async deleteBook(bookId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    const { error } = await supabase
      .from('books')
      .delete()
      .eq('book_id', bookId);

    if (error) {
      console.error('Error deleting book from Supabase:', error);
      throw error;
    }
  },

  // Fetch all book-genres connections
  async getBookGenres(): Promise<BookGenre[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    const { data, error } = await supabase
      .from('book_genres')
      .select('*');

    if (error) {
      console.error('Error fetching book genres from Supabase:', error);
      throw error;
    }

    return (data || []).map(row => ({
      BookID: row.book_id,
      Genre: row.genre,
      Primary: !!row.is_primary
    }));
  },

  // Save genre list mapping
  async saveBookGenres(bookId: string, genresList: { genre: string; isPrimary: boolean }[]): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    // Delete existing book genres mappings
    const { error: deleteError } = await supabase
      .from('book_genres')
      .delete()
      .eq('book_id', bookId);

    if (deleteError) {
      console.error('Error clearing genres in Supabase:', deleteError);
      throw deleteError;
    }

    if (genresList.length === 0) return;

    const rows = genresList.map(g => ({
      book_id: bookId,
      genre: g.genre,
      is_primary: g.isPrimary
    }));

    const { error: insertError } = await supabase
      .from('book_genres')
      .insert(rows);

    if (insertError) {
      console.error('Error saving genres to Supabase:', insertError);
      throw insertError;
    }
  },

  // Fetch customizable taxonomy parameters
  async getTaxonomies(): Promise<TaxonomyLists | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    const { data, error } = await supabase
      .from('taxonomies')
      .select('*')
      .eq('id', 'system')
      .maybeSingle();

    if (error) {
      console.error('Error fetching taxonomies from Supabase:', error);
      throw error;
    }

    if (!data) return null;

    return {
      genres: data.genres || [],
      workTypes: data.work_types || [],
      literaryPeriods: data.literary_periods || [],
      publishers: data.publishers || [],
      formats: data.formats || [],
      conditions: data.conditions || [],
      contentTypes: data.content_types || []
    };
  },

  // Upsert taxonomies lists
  async saveTaxonomy(tax: TaxonomyLists): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    const { error } = await supabase
      .from('taxonomies')
      .upsert({
        id: 'system',
        genres: tax.genres,
        work_types: tax.workTypes,
        literary_periods: tax.literaryPeriods,
        publishers: tax.publishers,
        formats: tax.formats,
        conditions: tax.conditions,
        content_types: tax.contentTypes
      });

    if (error) {
      console.error('Error saving taxonomies to Supabase:', error);
      throw error;
    }
  }
};
