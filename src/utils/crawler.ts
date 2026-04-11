import https from 'https';
import logger from './logger';

export class Crawler {
  /**
   * Fetches the content of a URL and cleans it up for AI processing.
   */
  async crawl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        }
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(this.cleanHtml(data));
          } else {
            reject(new Error(`HTTP Error: ${res.statusCode}`));
          }
        });
      }).on('error', (err) => {
        logger.error({ err, url }, 'Crawling failed');
        reject(err);
      });
    });
  }

  private cleanHtml(html: string): string {
    // Remove scripts, styles, svgs, and other non-content tags
    let cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '');

    // Extract body if present
    const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
      cleaned = bodyMatch[1];
    }

    // Remove excessive whitespace
    cleaned = cleaned
      .replace(/\s+/g, ' ')
      .trim();

    return cleaned;
  }
}

export const crawler = new Crawler();
