/**
 * NextPDA Public Minimal Proxy Server
 * -----------------------------------
 * Открытый базовый сервер для публичного репозитория GitHub.
 * Не содержит закрытой логики авторизации, приватных ключей и инфраструктуры.
 */

import express from 'express';
import cors from 'cors';
import * as cheerio from 'cheerio';

const app = express();
const PORT = process.env.PORT || 3001;

app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

// Public RSS News Feed
app.get('/api/news/feed', async (req, res) => {
  try {
    const upstreamRes = await fetch('https://4pda.to/feed/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!upstreamRes.ok) {
      return res.status(502).json({ error: 'Upstream error' });
    }

    const buf = await upstreamRes.arrayBuffer();
    const xml = new TextDecoder('windows-1251').decode(buf);
    const $ = cheerio.load(xml, { xmlMode: true });

    const articles = [];
    $('item').each((i, el) => {
      const $el = $(el);
      const title = $el.find('title').text().trim();
      const link = $el.find('link').text().trim();
      const pubDate = $el.find('pubDate').text().trim();
      const author = $el.find('dc\\:creator').text().trim() || '4PDA';
      const rawDesc = $el.find('description').text().trim();

      const cleanDesc = rawDesc
        .replace(/<[^>]+>/g, ' ')
        .replace(/\[\.\.\.\]/g, '...')
        .replace(/\s+/g, ' ')
        .trim();

      articles.push({
        id: `news-${i}`,
        title,
        link,
        publishedAt: pubDate,
        author,
        summary: cleanDesc,
      });
    });

    res.json({
      hero: articles[0] || null,
      articles: articles.slice(1),
      totalPages: 1,
    });
  } catch (e) {
    res.status(502).json({ error: 'Failed to fetch RSS feed' });
  }
});

// Download & attachment proxy
app.get('/api/proxy/download', async (req, res) => {
  const fileUrl = req.query.url;
  const fileName = req.query.name || 'download';
  if (!fileUrl || typeof fileUrl !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const upstreamRes = await fetch(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://4pda.to/',
      },
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({ error: 'Download failed' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Content-Type', upstreamRes.headers.get('content-type') || 'application/octet-stream');
    
    if (upstreamRes.body) {
      // @ts-ignore
      const reader = upstreamRes.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      res.end();
    }
  } catch {
    res.status(502).json({ error: 'Proxy error' });
  }
});

app.listen(PORT, () => {
  console.log(`[NextPDA Public] Открытый базовый сервер запущен на http://localhost:${PORT}`);
});
