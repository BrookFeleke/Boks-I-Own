/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Book, BookGenre, LibraryStats } from '../types';

export const StatsService = {
  /**
   * Safe Year formatting for negative (BCE) and positive (CE) years
   */
  formatYear(year: number): string {
    if (year < 0) {
      const absYear = Math.abs(year);
      if (absYear >= 100) {
        const century = Math.ceil(absYear / 100);
        return `${century}th c. BCE`;
      }
      return `${absYear} BCE`;
    }
    return `${year} CE`;
  },

  /**
   * Returns standard simple dashboard calculations
   */
  computeDashboardStats(books: Book[], bookGenres: BookGenre[]): LibraryStats & {
    collectionSpan: string;
    unlocked?: boolean;
    booksRead: number;
    unreadCount: number;
    uniqueAuthors: number;
  } {
    const totalBooks = books.length;
    if (totalBooks === 0) {
      return {
        totalBooks: 0,
        totalPages: 0,
        fictionCount: 0,
        nonFictionCount: 0,
        oldestWork: null,
        newestWork: null,
        averagePages: 0,
        medianPublishedYear: 0,
        topGenre: 'None',
        topPublisher: 'None',
        topNationality: 'None',
        oldestBookAge: 0,
        newestBookAge: 0,
        collectionSpan: 'Empty',
        booksRead: 0,
        unreadCount: 0,
        uniqueAuthors: 0
      };
    }

    // Totals
    const totalPages = books.reduce((sum, b) => sum + (b.PageCount || 0), 0);
    const averagePages = Math.round(totalPages / totalBooks);

    const fictionCount = books.filter(b => b.ContentType === 'Fiction').length;
    const nonFictionCount = totalBooks - fictionCount;

    const booksRead = books.filter(b => b.ReadStatus === 'Read').length;
    const unreadCount = totalBooks - booksRead;

    // Unique Authors
    const uniqueAuthors = new Set(books.map(b => b.Author.trim()).filter(Boolean)).size;

    // Oldest & Newest Work
    const sortedByYearDesc = [...books].sort((a, b) => b.PublishedYear - a.PublishedYear);
    const newestWork = sortedByYearDesc[0];
    const oldestWork = sortedByYearDesc[sortedByYearDesc.length - 1];

    // Median Published Year
    const allYears = books.map(b => b.PublishedYear).sort((a, b) => a - b);
    const midIdx = Math.floor(allYears.length / 2);
    const medianPublishedYear = allYears.length % 2 !== 0 
      ? allYears[midIdx] 
      : Math.round((allYears[midIdx - 1] + allYears[midIdx]) / 2);

    // Collection Span text
    const oldestStr = oldestWork ? this.formatYear(oldestWork.PublishedYear) : '';
    const newestStr = newestWork ? this.formatYear(newestWork.PublishedYear) : '';
    const collectionSpan = `${oldestStr} to ${newestStr}`;

    // Top Genre
    const genreCounts: Record<string, number> = {};
    bookGenres.forEach(g => {
      // Look at all occurrences, or prefer primary, let's take ALL genres for distribution, but count primary for overall dominant profile
      if (g.Primary) {
        genreCounts[g.Genre] = (genreCounts[g.Genre] || 0) + 1;
      }
    });
    let topGenre = 'None';
    let maxGenreCount = 0;
    Object.entries(genreCounts).forEach(([genre, count]) => {
      if (count > maxGenreCount) {
        maxGenreCount = count;
        topGenre = genre;
      }
    });

    // Top Publisher
    const pubCounts: Record<string, number> = {};
    books.forEach(b => {
      if (b.Publisher && b.Publisher !== 'Unknown') {
        pubCounts[b.Publisher] = (pubCounts[b.Publisher] || 0) + 1;
      }
    });
    let topPublisher = 'None';
    let maxPubCount = 0;
    Object.entries(pubCounts).forEach(([pub, count]) => {
      if (count > maxPubCount) {
        maxPubCount = count;
        topPublisher = pub;
      }
    });

    // Top Nationalities
    const natCounts: Record<string, number> = {};
    books.forEach(b => {
      if (b.AuthorNationality && b.AuthorNationality !== 'Unknown') {
        natCounts[b.AuthorNationality] = (natCounts[b.AuthorNationality] || 0) + 1;
      }
    });
    let topNationality = 'None';
    let maxNatCount = 0;
    Object.entries(natCounts).forEach(([nat, count]) => {
      if (count > maxNatCount) {
        maxNatCount = count;
        topNationality = nat;
      }
    });

    const currentYear = new Date().getFullYear();
    const oldestBookAge = oldestWork ? (currentYear - oldestWork.PublishedYear) : 0;
    const newestBookAge = newestWork ? (currentYear - newestWork.PublishedYear) : 0;

    return {
      totalBooks,
      totalPages,
      fictionCount,
      nonFictionCount,
      oldestWork,
      newestWork,
      averagePages,
      medianPublishedYear,
      topGenre,
      topPublisher,
      topNationality,
      oldestBookAge,
      newestBookAge,
      collectionSpan,
      booksRead,
      unreadCount,
      uniqueAuthors
    };
  },

  /**
   * Frequency Distributions for Charts
   */
  getGenreDistribution(books: Book[], bookGenres: BookGenre[]) {
    // Counts combining primary and secondary occurrences
    const primaryCounts: Record<string, number> = {};
    const totalCounts: Record<string, number> = {};

    bookGenres.forEach(g => {
      totalCounts[g.Genre] = (totalCounts[g.Genre] || 0) + 1;
      if (g.Primary) {
        primaryCounts[g.Genre] = (primaryCounts[g.Genre] || 0) + 1;
      }
    });

    return Object.keys(totalCounts).map(genre => ({
      name: genre,
      primaryCount: primaryCounts[genre] || 0,
      totalCount: totalCounts[genre] || 0,
    })).sort((a, b) => b.totalCount - a.totalCount);
  },

  getLiteraryPeriodDistribution(books: Book[]) {
    const counts: Record<string, number> = {};
    books.forEach(b => {
      if (b.LiteraryPeriod) {
        counts[b.LiteraryPeriod] = (counts[b.LiteraryPeriod] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  },

  getNationalityDistribution(books: Book[]) {
    const counts: Record<string, number> = {};
    books.forEach(b => {
      if (b.AuthorNationality) {
        counts[b.AuthorNationality] = (counts[b.AuthorNationality] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  },

  getPublisherDistribution(books: Book[]) {
    const counts: Record<string, number> = {};
    books.forEach(b => {
      if (b.Publisher) {
        counts[b.Publisher] = (counts[b.Publisher] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  },

  getFormatDistribution(books: Book[]) {
    const counts: Record<string, number> = {};
    books.forEach(b => {
      if (b.Format) {
        counts[b.Format] = (counts[b.Format] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count
    }));
  },

  getConditionDistribution(books: Book[]) {
    const counts: Record<string, number> = {};
    books.forEach(b => {
      if (b.Condition) {
        counts[b.Condition] = (counts[b.Condition] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count
    }));
  },

  getCenturyTimeline(books: Book[]) {
    const counts: Record<string, number> = {};
    books.forEach(b => {
      const year = b.PublishedYear;
      let label = '';
      if (year < 0) {
        label = 'BCE Era';
      } else if (year < 500) {
        label = 'Antiquity/Classic';
      } else if (year < 1500) {
        label = 'Middle Ages';
      } else if (year < 1700) {
        label = '16th/17th C.';
      } else if (year < 1800) {
        label = '18th Century';
      } else if (year < 1900) {
        label = '19th Century';
      } else if (year < 1950) {
        label = 'Pre-War 20th C.';
      } else if (year < 2000) {
        label = 'Post-War 20th C.';
      } else {
        label = '21st Century';
      }
      counts[label] = (counts[label] || 0) + 1;
    });

    // Logical chronologic order
    const ordering = [
      'BCE Era',
      'Antiquity/Classic',
      'Middle Ages',
      '16th/17th C.',
      '18th Century',
      '19th Century',
      'Pre-War 20th C.',
      'Post-War 20th C.',
      '21st Century'
    ];

    return ordering
      .filter(label => counts[label] !== undefined)
      .map(label => ({
        name: label,
        count: counts[label] || 0
      }));
  },

  /**
   * Detailed Advanced Metrics for Analysis screen
   */
  getDetailedAnalysis(books: Book[], bookGenres: BookGenre[]) {
    const total = books.length;
    if (total === 0) return null;

    // Top represented authors
    const authorCounts: Record<string, number> = {};
    books.forEach(b => {
      authorCounts[b.Author] = (authorCounts[b.Author] || 0) + 1;
    });
    const topAuthorsArr = Object.entries(authorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Book Length ranking
    const longestBooks = [...books].sort((a, b) => b.PageCount - a.PageCount).slice(0, 6);
    const shortestBooks = [...books].sort((a, b) => a.PageCount - b.PageCount).slice(0, 6);

    // Timeline Chronology lists
    const oldestWorks = [...books].sort((a, b) => a.PublishedYear - b.PublishedYear).slice(0, 10);
    const newestWorks = [...books].sort((a, b) => b.PublishedYear - a.PublishedYear).slice(0, 10);

    // Metadata & Data Quality Checklist
    const missingPageCount = books.filter(b => !b.PageCount || b.PageCount <= 0).map(b => b.Title);
    const missingPublisher = books.filter(b => !b.Publisher || b.Publisher === 'Unknown').map(b => b.Title);
    const unknownPurchaseDate = books.filter(b => b.PurchaseDate === 'Unknown' || !b.PurchaseDate).map(b => b.Title);
    const missingPrimaryGenre = books.filter(b => !b.PrimaryGenre).map(b => b.Title);
    
    // Books with 3 or more genres
    const bookGenreCountMap: Record<string, number> = {};
    bookGenres.forEach(g => {
      bookGenreCountMap[g.BookID] = (bookGenreCountMap[g.BookID] || 0) + 1;
    });
    const highlyTagged = books.filter(b => (bookGenreCountMap[b.BookID] || 0) >= 3).map(b => ({
      Title: b.Title,
      Author: b.Author,
      count: bookGenreCountMap[b.BookID]
    }));

    // Duplicate titles & authors check
    const dupMap: Record<string, string[]> = {};
    books.forEach(b => {
      const key = `${b.Title.toLowerCase().trim()}:::${b.Author.toLowerCase().trim()}`;
      if (!dupMap[key]) dupMap[key] = [];
      dupMap[key].push(b.BookID);
    });
    const duplicates: { Title: string; Author: string; IDs: string[] }[] = [];
    Object.entries(dupMap).forEach(([key, ids]) => {
      if (ids.length > 1) {
        const [title, author] = key.split(':::');
        // Retrieve real casing from the first matched ID
        const matched = books.find(b => b.BookID === ids[0]);
        duplicates.push({
          Title: matched ? matched.Title : title,
          Author: matched ? matched.Author : author,
          IDs: ids
        });
      }
    });

    // Publisher ecosystem statistics
    const publishersCount = this.getPublisherDistribution(books);
    const classicsImprintCount = books.filter(b => 
      b.Publisher.includes('Classics') || 
      b.Publisher.includes("Everyman's")
    ).length;

    // Library Era Identity
    // Let's divide based on standard periods
    const classicEraCount = books.filter(b => b.PublishedYear < 1900).length;
    const modernEraCount = total - classicEraCount;
    const eraRatio = classicEraCount / total; // closer to 1 is classics, closer to 0 is modern

    return {
      topAuthors: topAuthorsArr,
      longestBooks,
      shortestBooks,
      oldestWorks,
      newestWorks,
      duplicates,
      highlyTagged,
      publisherDist: publishersCount,
      classicsImprintCount,
      eraRatio,
      qualityCheck: {
        missingPageCount,
        missingPublisher,
        unknownPurchaseDate,
        missingPrimaryGenre
      }
    };
  },

  /**
   * Calculates Pearson Correlation (r) and linear regression parameters between PublishedYear and PageCount
   */
  getYearPageCorrelation(books: Book[]) {
    // Filter out unrepresentative page counts
    const validBooks = books.filter(b => b.PublishedYear && b.PageCount && b.PageCount > 5);
    const n = validBooks.length;
    if (n < 2) {
      return { r: 0, slope: 0, intercept: 0, classification: 'Insufficient points' };
    }

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    let sumYY = 0;

    validBooks.forEach(b => {
      const x = b.PublishedYear;
      const y = b.PageCount;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
      sumYY += y * y;
    });

    const numerator = n * sumXY - sumX * sumY;
    const denomX = n * sumXX - sumX * sumX;
    const denomY = n * sumYY - sumY * sumY;
    const denominator = Math.sqrt(denomX * denomY);

    const r = denominator === 0 ? 0 : numerator / denominator;
    const slope = denomX === 0 ? 0 : numerator / denomX;
    const intercept = (sumY - slope * sumX) / n;

    let classification = 'Uncorrelated';
    const absR = Math.abs(r);
    if (absR >= 0.7) {
      classification = r > 0 ? 'Strong Positive Timeline Expansion' : 'Strong Negative Modern Condensation';
    } else if (absR >= 0.4) {
      classification = r > 0 ? 'Moderate Positive Expansion' : 'Moderate Negative Condensation';
    } else if (absR >= 0.1) {
      classification = r > 0 ? 'Weak Positive Skew' : 'Weak Negative Skew';
    } else {
      classification = 'Negligible Linear Dependency';
    }

    return {
      r: parseFloat(r.toFixed(4)),
      slope: parseFloat(slope.toFixed(4)),
      intercept: parseFloat(intercept.toFixed(4)),
      classification,
      pointsCount: n
    };
  },

  /**
   * Computes the Gini Impurity Coefficient representing genre variety and concentration.
   * Gini index is: 1 - sum(p_i^2). Closer to 1 is highly diversified, closer to 0 is fully concentrated.
   */
  getGenreGiniEntropy(books: Book[]) {
    const total = books.length;
    if (total === 0) return { gini: 0, classification: 'No records' };

    const genreCounts: Record<string, number> = {};
    books.forEach(b => {
      const g = b.PrimaryGenre || 'Unassigned';
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });

    let sumSquares = 0;
    Object.values(genreCounts).forEach(count => {
      const p = count / total;
      sumSquares += p * p;
    });

    const gini = 1 - sumSquares;
    let classification = '';
    if (gini < 0.3) {
      classification = 'Laser-Focused Specialist' + ' (Highly specialized single-cohort preference)';
    } else if (gini <= 0.65) {
      classification = 'Segmented Aficionado (Targeted focus across 2-3 prominent fields)';
    } else {
      classification = 'Renaissance Polymath (Broadly diversified multi-subject reader)';
    }

    return {
      gini: parseFloat(gini.toFixed(3)),
      classification,
      uniqueCount: Object.keys(genreCounts).length
    };
  },

  /**
   * Computes Pivot Table matrix cross-tabulation for any two categorical factors.
   */
  getPivotMatrix(books: Book[], xAxisKey: keyof Book, yAxisKey: keyof Book) {
    // Collect all unique values of x and y
    const xValuesSet = new Set<string>();
    const yValuesSet = new Set<string>();

    books.forEach(b => {
      xValuesSet.add(String(b[xAxisKey] || 'N/A'));
      yValuesSet.add(String(b[yAxisKey] || 'N/A'));
    });

    const xAxisLabels = Array.from(xValuesSet).sort();
    const yAxisLabels = Array.from(yValuesSet).sort();

    // Map counts
    const counts: Record<string, Record<string, number>> = {};
    const xTotals: Record<string, number> = {};
    const yTotals: Record<string, number> = {};
    let grandTotal = 0;

    xAxisLabels.forEach(x => {
      counts[x] = {};
      xTotals[x] = 0;
      yAxisLabels.forEach(y => {
        counts[x][y] = 0;
        yTotals[y] = 0;
      });
    });

    books.forEach(b => {
      const x = String(b[xAxisKey] || 'N/A');
      const y = String(b[yAxisKey] || 'N/A');
      counts[x][y] = (counts[x][y] || 0) + 1;
      xTotals[x] = (xTotals[x] || 0) + 1;
      yTotals[y] = (yTotals[y] || 0) + 1;
      grandTotal++;
    });

    return {
      xAxisLabels,
      yAxisLabels,
      matrix: counts,
      xTotals,
      yTotals,
      grandTotal
    };
  },

  /**
   * Computes page count histograms buckets
   */
  getPageCountDensity(books: Book[]) {
    const buckets = [
      { id: 'pocket', label: 'Brief / Pocket (<200 p)', min: 0, max: 200, count: 0, books: [] as Book[] },
      { id: 'standard', label: 'Standard Novel (200-399 p)', min: 201, max: 400, count: 0, books: [] as Book[] },
      { id: 'extensive', label: 'Extensive Tome (400-599 p)', min: 401, max: 600, count: 0, books: [] as Book[] },
      { id: 'epic', label: 'Monumental Epic (600+ p)', min: 601, max: 99999, count: 0, books: [] as Book[] }
    ];

    books.forEach(b => {
      const p = b.PageCount || 0;
      const bin = buckets.find(bucket => p >= bucket.min && p <= bucket.max);
      if (bin) {
        bin.count++;
        bin.books.push(b);
      } else if (p > 600) {
        buckets[3].count++;
        buckets[3].books.push(b);
      } else {
        buckets[0].count++;
        buckets[0].books.push(b);
      }
    });

    return buckets.map(b => ({
      ...b,
      percentage: books.length > 0 ? Math.round((b.count / books.length) * 100) : 0
    }));
  }
};
