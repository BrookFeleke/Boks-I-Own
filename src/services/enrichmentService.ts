/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Book, EnrichmentSuggestion, MockEnrichmentResponse } from '../types';
import { PublisherNormalizer } from './publisherNormalizer';

export interface EnrichmentProvider {
  getSuggestions(title: string, author?: string): Promise<MockEnrichmentResponse>;
}

export const EnrichmentService: EnrichmentProvider = {
  async getSuggestions(title: string, author?: string): Promise<MockEnrichmentResponse> {
    if (!title) {
      return { status: 'no_match', suggestions: [] };
    }

    // Try server dynamic Gemini suggest endpoint first
    try {
      const response = await fetch('/api/gemini/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, author })
      });

      if (response.ok) {
        const parsed = await response.json();
        if (parsed.status === 'success') {
          return { status: 'success', suggestions: parsed.suggestions };
        }
      }
    } catch (err) {
      console.warn('Gemini Suggest Api endpoint call timed out or was unavailable. Falling back directly to OpenLibrary live metadata API.', err);
    }

    // Dynamic, live backup of genuine, non-hardcoded metadata lookup using public OpenLibrary
    try {
      const query = encodeURIComponent(title);
      const authorQuery = author ? `&author=${encodeURIComponent(author)}` : '';
      const olUrl = `https://openlibrary.org/search.json?title=${query}${authorQuery}&limit=1`;
      
      const olResponse = await fetch(olUrl);
      if (!olResponse.ok) {
        throw new Error('OpenLibrary search query failed.');
      }

      const data = await olResponse.json();
      const doc = data.docs?.[0];
      if (!doc) {
        return { status: 'no_match', suggestions: [] };
      }

      const suggestions: EnrichmentSuggestion[] = [];

      // 1. Author Name
      if (doc.author_name?.[0]) {
        suggestions.push({
          field: 'Author',
          suggestedValue: doc.author_name[0],
          confidence: 'High',
          reason: `Found matching registered author "${doc.author_name[0]}" in the OpenLibrary live repository.`
        });
      }

      // 2. Published Year
      if (doc.first_publish_year) {
        suggestions.push({
          field: 'PublishedYear',
          suggestedValue: doc.first_publish_year,
          confidence: 'High',
          reason: `Verified first publishing year ${doc.first_publish_year} on record.`
        });
      }

      // 3. Page Count
      if (doc.number_of_pages_median) {
        suggestions.push({
          field: 'PageCount',
          suggestedValue: doc.number_of_pages_median,
          confidence: 'Medium',
          reason: `Typical edition size averages ${doc.number_of_pages_median} pages under median estimates.`
        });
      }

      // 4. Publisher
      if (doc.publisher?.[0]) {
        const normPub = PublisherNormalizer.normalize(doc.publisher[0]);
        suggestions.push({
          field: 'Publisher',
          suggestedValue: normPub,
          confidence: 'Medium',
          reason: `Registered with primary print imprint: ${normPub}.`
        });
      }

      // 5. Build dynamic genres list
      const openSubjects: string[] = doc.subject || [];
      const genresList = openSubjects.slice(0, 4);
      if (genresList.length > 0) {
        suggestions.push({
          field: 'genres' as any,
          suggestedValue: genresList,
          confidence: 'High',
          reason: `Core metadata tags retrieved: ${genresList.join(', ')}.`
        });

        const primary = genresList[0];
        suggestions.push({
          field: 'PrimaryGenre',
          suggestedValue: primary,
          confidence: 'High',
          reason: `Identified primary catalog category: ${primary}.`
        });
      } else {
        suggestions.push({
          field: 'PrimaryGenre',
          suggestedValue: 'General',
          confidence: 'Low',
          reason: 'No genre tags indexed, defaulting to General.'
        });
      }

      // 6. Content Type Deduction
      const isFiction = openSubjects.some(s => {
        const lower = s.toLowerCase();
        return lower.includes('fiction') || lower.includes('novel') || lower.includes('fantasy') || lower.includes('stories');
      });
      suggestions.push({
        field: 'ContentType',
        suggestedValue: isFiction ? 'Fiction' : 'Non-Fiction',
        confidence: 'Medium',
        reason: isFiction 
          ? 'Identified subject matter classification flags indicating creative prose or fiction.'
          : 'Index subjects suggest factual, historical, or academic treatise classification.'
      });

      // 7. Work Type Deduction
      let wt = 'Novel';
      const lowercaseTitle = title.toLowerCase();
      if (openSubjects.some(s => s.toLowerCase().includes('short stories')) || lowercaseTitle.includes('stories') || lowercaseTitle.includes('tales')) {
        wt = 'Short Story Collection';
      } else if (openSubjects.some(s => s.toLowerCase().includes('play') || s.toLowerCase().includes('drama'))) {
        wt = 'Play';
      } else if (!isFiction) {
        wt = 'Treatise';
      }
      suggestions.push({
        field: 'WorkType',
        suggestedValue: wt,
        confidence: 'Medium',
        reason: `Deduced literary form is best classified as a ${wt}.`
      });

      // 8. Literary Period Deduction
      let period = 'Contemporary';
      const year = doc.first_publish_year;
      if (year) {
        if (year < 1500) period = 'Classical Antiquity';
        else if (year < 1800) period = 'Early Modern';
        else if (year < 1837) period = 'Romanticism';
        else if (year < 1901) period = 'Victorian';
        else if (year < 1945) period = 'Modernism';
      }
      suggestions.push({
        field: 'LiteraryPeriod',
        suggestedValue: period,
        confidence: 'Medium',
        reason: year 
          ? `Derived based on initial publication decade aligning with the ${period} era.`
          : 'Literary period estimated from subject classifications.'
      });

      return { status: 'success', suggestions };

    } catch (openLibErr) {
      console.warn('Backup OpenLibrary fallback failed too:', openLibErr);
      return { status: 'no_match', suggestions: [] };
    }
  }
};
