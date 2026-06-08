/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Book {
  BookID: string; // B0001, B0002...
  Title: string;
  Author: string;
  AuthorNationality: string;
  ContentType: 'Fiction' | 'Non-Fiction';
  WorkType: string;
  LiteraryPeriod: string;
  ReadStatus: 'Read' | 'Unread';
  Format: 'Paperback' | 'Hardback' | 'Other';
  Condition: 'Like New' | 'Good' | 'Fair' | 'Poor';
  Publisher: string;
  PublishedYear: number;
  PageCount: number;
  PurchaseDate: string; // YYYY-MM-DD or "Unknown"
  PrimaryGenre: string;
}

export interface BookGenre {
  BookID: string;
  Genre: string;
  Primary: boolean;
}

export interface EnrichmentSuggestion {
  field: keyof Book | 'genres';
  suggestedValue: any;
  confidence: 'High' | 'Medium' | 'Low';
  reason: string;
}

export interface MockEnrichmentResponse {
  suggestions: EnrichmentSuggestion[];
  status: 'success' | 'no_match';
}

export interface TaxonomyLists {
  genres: string[];
  workTypes: string[];
  literaryPeriods: string[];
  publishers: string[];
  formats: string[];
  conditions: string[];
  contentTypes: string[];
}

export interface LibraryStats {
  totalBooks: number;
  totalPages: number;
  fictionCount: number;
  nonFictionCount: number;
  oldestWork: Book | null;
  newestWork: Book | null;
  averagePages: number;
  medianPublishedYear: number;
  topGenre: string;
  topPublisher: string;
  topNationality: string;
  oldestBookAge: number;
  newestBookAge: number;
}
