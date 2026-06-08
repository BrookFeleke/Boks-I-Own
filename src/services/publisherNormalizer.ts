/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface NormalizationRule {
  pattern: RegExp;
  replacement: string;
}

const DEFAULT_NORMALIZATION_RULES: NormalizationRule[] = [
  { pattern: /Penguin\s+Books/i, replacement: 'Penguin' },
  { pattern: /Vintage\s+Books/i, replacement: 'Vintage' },
  { pattern: /Macmillan\s+&\s+Co\.\s+Ltd\./i, replacement: 'Macmillan' },
  { pattern: /Macmillan\s+Publishers/i, replacement: 'Macmillan' },
  { pattern: /W\.\s*W\.\s*Norton\s*\(.*\)/i, replacement: 'W. W. Norton & Company' },
  { pattern: /W\.\s*W\.\s*Norton\s*&\s*Company?/i, replacement: 'W. W. Norton & Company' },
  { pattern: /W\.\s*W\.\s*Norton/i, replacement: 'W. W. Norton & Company' },
  { pattern: /Progress\s+Publishers\s+Moscow/i, replacement: 'Progress Publishers' },
  { pattern: /Charles\s+Scribner['’]s\s+Sons/i, replacement: 'Scribner' },
  { pattern: /^Scribner['’]s$/i, replacement: 'Scribner' },
  { pattern: /The\s+Viking\s+Press/i, replacement: 'Viking Press' },
  { pattern: /Viking\s+Books/i, replacement: 'Viking Press' },
  { pattern: /The\s+Hogarth\s+Press/i, replacement: 'Hogarth Press' },
  { pattern: /The\s+World['’]s\s+Classics/i, replacement: "World's Classics" },
  { pattern: /Oxford\s+World['’]s\s+Classics/i, replacement: "Oxford World's Classics" },
  { pattern: /Signet\s+Books/i, replacement: 'Signet' },
  { pattern: /Signet\s+Classics/i, replacement: 'Signet Classics' },
  { pattern: /Bantam\s+Books/i, replacement: 'Bantam' },
  { pattern: /Everyman['’]s\s+Library/i, replacement: "Everyman's Library" },
  { pattern: /Barnes\s+&\s+Noble\s+Classics/i, replacement: 'Barnes & Noble Classics' },
  { pattern: /Wordsworth\s+Classics/i, replacement: 'Wordsworth Classics' }
];

export const PublisherNormalizer = {
  /**
   * Cleans a publisher name using canonical rules
   */
  normalize(publisherName: string): string {
    if (!publisherName) return 'Unknown';
    let cleaned = publisherName.trim();
    
    for (const rule of DEFAULT_NORMALIZATION_RULES) {
      if (rule.pattern.test(cleaned)) {
        return cleaned.replace(rule.pattern, rule.replacement).trim();
      }
    }
    
    return cleaned;
  },

  /**
   * Gets list of common replacement examples for documentation/UI
   */
  getCommonMappings() {
    return [
      { input: 'Penguin Books', output: 'Penguin' },
      { input: 'Vintage Books', output: 'Vintage' },
      { input: 'Macmillan & Co. Ltd.', output: 'Macmillan' },
      { input: 'W. W. Norton (Norton Critical Editions)', output: 'W. W. Norton & Company' },
      { input: 'Progress Publishers Moscow', output: 'Progress Publishers' },
      { input: 'Charles Scribner\'s Sons', output: 'Scribner' },
      { input: 'The Viking Press', output: 'Viking Press' },
      { input: 'The Hogarth Press', output: 'Hogarth Press' },
      { input: 'The World\'s Classics', output: 'World\'s Classics' },
      { input: 'Signet Books', output: 'Signet' }
    ];
  }
};
