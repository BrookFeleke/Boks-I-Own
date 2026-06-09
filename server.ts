/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environmental parameters
dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // 1. Core AI Enrichment Proxy calling Google Gemini
  app.post('/api/gemini/suggest', async (req, res) => {
    const { title, author } = req.body;

    if (!title) {
      return res.status(400).json({ status: 'error', message: 'Book title is required.' });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('GEMINI_API_KEY is not configured inside system environment variables.');
        return res.status(500).json({
          status: 'error',
          message: 'Google Gemini API Key is missing. Please navigate to Settings to input the correct key.'
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Perform query details and categorization for the book entitled "${title}"${author ? ` written by ${author}` : ''}.
Produce a highly accurate set of recommendations based on actual literary archives, historical publishing, and academic sources.
Provide the matching values for:
- Author (full actual name, e.g., "Charles Darwin")
- AuthorNationality (e.g., "British", "American", "Russian")
- ContentType (Must be exactly "Fiction" or "Non-Fiction")
- PublishedYear (e.g., 1859 for On the Origin of Species)
- PageCount (typical page count for standard unabridged edition, e.g., 502)
- Publisher (canonical publisher or initial prominent imprint, e.g., "John Murray")
- LiteraryPeriod (e.g., "Victorian", "Realism", "Classical Antiquity", "Modernism", "Contemporary")
- WorkType (e.g., "Scientific Treatise", "Novel", "Essay Collection", "Play", "Philosophical Treatise")
- PrimaryGenre (Must be a prominent category like "Science", "Evolution", "Classics", "Philosophy", "History", "Russian", etc.)
- genres (a list of 2 to 4 keywords/genres representing tag categories, e.g., ["Science", "Evolution", "Natural History", "Non-Fiction"])`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                description: 'Array of field suggestion items',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    field: {
                      type: Type.STRING,
                      enum: [
                        'Author',
                        'AuthorNationality',
                        'ContentType',
                        'PublishedYear',
                        'PageCount',
                        'Publisher',
                        'LiteraryPeriod',
                        'WorkType',
                        'PrimaryGenre',
                        'genres'
                      ]
                    },
                    suggestedValue: {
                      type: Type.STRING,
                      description: 'The matching suggested value for the field. For PublishedYear and PageCount, provide an integer string (e.g. "1859"). For genres, provide a JSON list format inside a string like \'["Science", "Evolution"]\'.'
                    },
                    confidence: {
                      type: Type.STRING,
                      enum: ['High', 'Medium', 'Low']
                    },
                    reason: {
                      type: Type.STRING,
                      description: 'Brief professional sentence explaining why this detail matches.'
                    }
                  },
                  required: ['field', 'suggestedValue', 'confidence', 'reason']
                }
              }
            },
            required: ['suggestions']
          }
        }
      });

      const text = response.text;
      if (!text) {
        return res.json({ status: 'no_match', suggestions: [] });
      }

      const parsed = JSON.parse(text);
      const rawSuggestions = parsed.suggestions || [];
      
      // Parse data types cleanly for React frontend ingestion compatibility
      const processedSuggestions = rawSuggestions.map((sug: any) => {
        let val = sug.suggestedValue;
        if (sug.field === 'PublishedYear' || sug.field === 'PageCount') {
          const num = parseInt(val, 10);
          val = isNaN(num) ? 1900 : num;
        } else if (sug.field === 'genres') {
          try {
            if (typeof val === 'string') {
              if (val.trim().startsWith('[')) {
                val = JSON.parse(val);
              } else {
                val = val.split(',').map((x: string) => x.trim());
              }
            }
          } catch {
            val = [];
          }
        }
        return {
          field: sug.field,
          suggestedValue: val,
          confidence: sug.confidence || 'Medium',
          reason: sug.reason
        };
      });

      return res.json({ status: 'success', suggestions: processedSuggestions });

    } catch (error: any) {
      console.error('Gemini Structured Query failed:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Structured data extraction failed.'
      });
    }
  });

  // 1.5 Dynamic environment secrets config sharing proxy
  app.get('/api/config', (req, res) => {
    res.json({
      supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://nhbinxxxstgzfhxigksz.supabase.co',
      supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oYmlueHh4c3RnemZoeGlna3N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTcyNjQsImV4cCI6MjA5NjQ5MzI2NH0.XrKCPdJp_g50MbAyeZrKqnBHrc7oj-rRa_Okcj-wwro'
    });
  });

  // 2. Client Ingress Orchestration (Vite Middleware Setup)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Control Center full-stack server initiated on port ${PORT}`);
  });
}

startServer();
