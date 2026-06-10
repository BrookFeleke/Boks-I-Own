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

  // Helper to ensure author exists and get id
  async getOrCreateAuthor(name: string, nationality?: string): Promise<number | null> {
    if (!isSupabaseConfigured || !supabase || !name) return null;
    const cleanName = name.trim();
    if (!cleanName) return null;
    
    // Check if exists
    const { data, error } = await supabase
      .from('authors')
      .select('id')
      .eq('name', cleanName)
      .maybeSingle();
      
    if (data) return data.id;
    
    // Otherwise insert
    const { data: inserted, error: insError } = await supabase
      .from('authors')
      .insert({ name: cleanName, nationality: nationality || 'Unknown' })
      .select('id')
      .maybeSingle();
      
    if (insError) {
      console.warn('Author insert retry path:', insError);
      // Double check if it got inserted in a race condition
      const { data: retry } = await supabase
        .from('authors')
        .select('id')
        .eq('name', cleanName)
        .maybeSingle();
      if (retry) return retry.id;
      throw insError;
    }
    return inserted ? inserted.id : null;
  },

  // Helper to ensure publisher exists and get id
  async getOrCreatePublisher(name: string): Promise<number | null> {
    if (!isSupabaseConfigured || !supabase || !name) return null;
    const cleanName = name.trim();
    if (!cleanName) return null;
    
    // Check if exists
    const { data, error } = await supabase
      .from('publishers')
      .select('id')
      .eq('name', cleanName)
      .maybeSingle();
      
    if (data) return data.id;
    
    // Otherwise insert
    const { data: inserted, error: insError } = await supabase
      .from('publishers')
      .insert({ name: cleanName })
      .select('id')
      .maybeSingle();
      
    if (insError) {
      console.warn('Publisher insert retry path:', insError);
      const { data: retry } = await supabase
        .from('publishers')
        .select('id')
        .eq('name', cleanName)
        .maybeSingle();
      if (retry) return retry.id;
      throw insError;
    }
    return inserted ? inserted.id : null;
  },

  // Helper to bulk resolve authors
  async resolveAuthorsBulk(books: Book[]): Promise<Map<string, number>> {
    const authorIdMap = new Map<string, number>();
    if (!isSupabaseConfigured || !supabase) return authorIdMap;
    
    const uniqueInputs = Array.from(new Set(books.map(b => b.Author.trim()).filter(Boolean)));
    if (uniqueInputs.length === 0) return authorIdMap;
    
    const { data: existing } = await supabase
      .from('authors')
      .select('id, name');
      
    const existingMap = new Map<string, number>();
    (existing || []).forEach(row => {
      existingMap.set(row.name.trim().toLowerCase(), row.id);
    });
    
    const missingRows: { name: string; nationality: string }[] = [];
    uniqueInputs.forEach(name => {
      const lower = name.toLowerCase();
      if (existingMap.has(lower)) {
        authorIdMap.set(name, existingMap.get(lower)!);
      } else {
        const matchedBook = books.find(b => b.Author.trim() === name);
        missingRows.push({
          name,
          nationality: matchedBook?.AuthorNationality || 'Unknown'
        });
      }
    });
    
    if (missingRows.length > 0) {
      const { data: inserted, error } = await supabase
        .from('authors')
        .insert(missingRows)
        .select('id, name');
        
      if (error) {
        console.error('Error in batch inserting authors:', error);
        for (const row of missingRows) {
          try {
            const id = await this.getOrCreateAuthor(row.name, row.nationality);
            if (id !== null) {
              authorIdMap.set(row.name, id);
            }
          } catch (e) {
            console.error('Serial auth fallback failed', e);
          }
        }
      } else if (inserted) {
        inserted.forEach(row => {
          authorIdMap.set(row.name, row.id);
        });
      }
    }
    
    existingMap.forEach((id, lowerName) => {
      const orig = uniqueInputs.find(n => n.toLowerCase() === lowerName);
      if (orig) {
        authorIdMap.set(orig, id);
      }
    });
    
    return authorIdMap;
  },

  // Helper to bulk resolve publishers
  async resolvePublishersBulk(books: Book[]): Promise<Map<string, number>> {
    const publisherIdMap = new Map<string, number>();
    if (!isSupabaseConfigured || !supabase) return publisherIdMap;
    
    const uniqueInputs = Array.from(new Set(books.map(b => b.Publisher.trim()).filter(Boolean)));
    if (uniqueInputs.length === 0) return publisherIdMap;
    
    const { data: existing } = await supabase
      .from('publishers')
      .select('id, name');
      
    const existingMap = new Map<string, number>();
    (existing || []).forEach(row => {
      existingMap.set(row.name.trim().toLowerCase(), row.id);
    });
    
    const missingRows: { name: string }[] = [];
    uniqueInputs.forEach(name => {
      const lower = name.toLowerCase();
      if (existingMap.has(lower)) {
        publisherIdMap.set(name, existingMap.get(lower)!);
      } else {
        missingRows.push({ name });
      }
    });
    
    if (missingRows.length > 0) {
      const { data: inserted, error } = await supabase
        .from('publishers')
        .insert(missingRows)
        .select('id, name');
        
      if (error) {
        console.error('Error in batch inserting publishers:', error);
        for (const row of missingRows) {
          try {
            const id = await this.getOrCreatePublisher(row.name);
            if (id !== null) {
              publisherIdMap.set(row.name, id);
            }
          } catch (e) {
            console.error('Serial publisher fallback failed', e);
          }
        }
      } else if (inserted) {
        inserted.forEach(row => {
          publisherIdMap.set(row.name, row.id);
        });
      }
    }
    
    existingMap.forEach((id, lowerName) => {
      const orig = uniqueInputs.find(n => n.toLowerCase() === lowerName);
      if (orig) {
        publisherIdMap.set(orig, id);
      }
    });
    
    return publisherIdMap;
  },

  // Pull all books
  async getBooks(): Promise<Book[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    
    const { data, error } = await supabase
      .from('books')
      .select(`
        book_id,
        title,
        content_type,
        work_type,
        literary_period,
        read_status,
        format,
        condition,
        published_year,
        page_count,
        purchase_date,
        primary_genre,
        authors (
          name,
          nationality
        ),
        publishers (
          name
        )
      `)
      .order('title', { ascending: true });
      
    if (error) {
      console.error('Error fetching books from Supabase:', error);
      throw error;
    }
    
    return (data || []).map(row => {
      let authorName = 'Unknown';
      let authorNat = 'Unknown';
      if (row.authors) {
        if (Array.isArray(row.authors)) {
          if (row.authors.length > 0) {
            authorName = row.authors[0].name || 'Unknown';
            authorNat = row.authors[0].nationality || 'Unknown';
          }
        } else {
          authorName = (row.authors as any).name || 'Unknown';
          authorNat = (row.authors as any).nationality || 'Unknown';
        }
      }

      let publisherName = 'Unknown';
      if (row.publishers) {
        if (Array.isArray(row.publishers)) {
          if (row.publishers.length > 0) {
            publisherName = row.publishers[0].name || 'Unknown';
          }
        } else {
          publisherName = (row.publishers as any).name || 'Unknown';
        }
      }

      return {
        BookID: row.book_id,
        Title: row.title,
        Author: authorName,
        AuthorNationality: authorNat,
        ContentType: row.content_type || 'Fiction',
        WorkType: row.work_type || 'Novel',
        LiteraryPeriod: row.literary_period || 'Unknown',
        ReadStatus: row.read_status || 'Unread',
        Format: row.format || 'Paperback',
        Condition: row.condition || 'Fair',
        Publisher: publisherName,
        PublishedYear: Number(row.published_year) || 0,
        PageCount: Number(row.page_count) || 0,
        PurchaseDate: row.purchase_date || 'Unknown',
        PrimaryGenre: row.primary_genre || ''
      };
    });
  },

  // Save/Upsert a book
  async saveBook(book: Book): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    const author_id = await this.getOrCreateAuthor(book.Author, book.AuthorNationality);
    const publisher_id = await this.getOrCreatePublisher(book.Publisher);

    const { error } = await supabase
      .from('books')
      .upsert({
        book_id: book.BookID,
        title: book.Title,
        author_id,
        publisher_id,
        content_type: book.ContentType,
        work_type: book.WorkType,
        literary_period: book.LiteraryPeriod,
        read_status: book.ReadStatus,
        format: book.Format,
        condition: book.Condition,
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

  // Save multiple books in a single bulk upsert
  async saveBooksBulk(books: Book[]): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    if (books.length === 0) return;

    // Resolve ids for authors and publishers in batch
    const authorIdMap = await this.resolveAuthorsBulk(books);
    const publisherIdMap = await this.resolvePublishersBulk(books);

    const rows = books.map(book => {
      const cleanAuthor = book.Author.trim();
      const cleanPub = book.Publisher.trim();
      return {
        book_id: book.BookID,
        title: book.Title,
        author_id: authorIdMap.get(cleanAuthor) || null,
        publisher_id: publisherIdMap.get(cleanPub) || null,
        content_type: book.ContentType,
        work_type: book.WorkType,
        literary_period: book.LiteraryPeriod,
        read_status: book.ReadStatus,
        format: book.Format,
        condition: book.Condition,
        published_year: book.PublishedYear,
        page_count: book.PageCount,
        purchase_date: book.PurchaseDate,
        primary_genre: book.PrimaryGenre
      };
    });

    const { error } = await supabase
      .from('books')
      .upsert(rows);

    if (error) {
      console.error('Error saving books bulk in Supabase:', error);
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

  // Save multiple book genres in a single bulk upsert
  async saveBookGenresBulk(genres: BookGenre[]): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    if (genres.length === 0) return;

    const bookIds = Array.from(new Set(genres.map(g => g.BookID)));
    if (bookIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('book_genres')
        .delete()
        .in('book_id', bookIds);
        
      if (deleteError) {
        console.warn('Minor warning: bulk delete of book genres for seeding had error:', deleteError);
      }
    }

    const rows = genres.map(g => ({
      book_id: g.BookID,
      genre: g.Genre,
      is_primary: g.Primary
    }));

    const { error } = await supabase
      .from('book_genres')
      .insert(rows);

    if (error) {
      console.error('Error saving book genres bulk in Supabase:', error);
      throw error;
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
