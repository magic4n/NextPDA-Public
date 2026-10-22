/**
 * NextPDA Public Minimal Proxy Server
 * -----------------------------------
 * Открытый базовый сервер для публичного репозитория GitHub.
 * Не содержит закрытой логики авторизации, приватных ключей и инфраструктуры.
 * Включает защиту от частых действий на базе CAP Captcha (https://github.com/tiagozip/cap).
 */

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import * as cheerio from 'cheerio';

const app = express();
const PORT = process.env.PORT || 3001;

app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

// ==============================================================================
// CAP Captcha Engine (Proof-of-Work, compatible with https://github.com/tiagozip/cap)
// ==============================================================================
const capChallenges = new Map();
const CAP_CHALLENGE_TTL_MS = 2 * 60 * 1000;
const CAP_DEFAULT_DIFFICULTY = 4;

setInterval(() => {
  const now = Date.now();
  for (const [ch, data] of capChallenges.entries()) {
    if (now > data.expiresAt) {
      capChallenges.delete(ch);
    }
  }
}, 30000);

function createCapChallenge(ip = '') {
  const challenge = crypto.randomBytes(16).toString('hex');
  const now = Date.now();
  const data = {
    challenge,
    difficulty: CAP_DEFAULT_DIFFICULTY,
    expiresAt: now + CAP_CHALLENGE_TTL_MS,
    ip,
  };
  capChallenges.set(challenge, data);
  return {
    challenge,
    difficulty: data.difficulty,
    expiresAt: data.expiresAt,
  };
}

function verifyCapSolution(challenge, nonce) {
  if (!challenge || nonce === undefined || nonce === null) return false;
  const item = capChallenges.get(challenge);
  if (!item) return false;
  if (Date.now() > item.expiresAt) {
    capChallenges.delete(challenge);
    return false;
  }

  const hash = crypto.createHash('sha256').update(`${challenge}:${nonce}`).digest('hex');
  const targetPrefix = '0'.repeat(item.difficulty);
  const isValid = hash.startsWith(targetPrefix);

  if (isValid) {
    capChallenges.delete(challenge);
    return true;
  }
  return false;
}

// In-memory frequency limiter for repeated identical actions
const actionHistory = new Map();
const ACTION_WINDOW_MS = 15 * 1000;
const MAX_IDENTICAL_HITS = 4;

function checkFrequentActionsMiddleware(req, res, next) {
  const path = req.path;
  if (!path.startsWith('/api/news/feed') && !path.startsWith('/api/search')) {
    return next();
  }

  const clientIp = req.socket.remoteAddress || req.ip || 'unknown';
  const payloadStr = JSON.stringify(req.body || {}) + JSON.stringify(req.query || {});
  const payloadHash = crypto.createHash('md5').update(payloadStr).digest('hex').substring(0, 8);
  const actionKey = `${clientIp}:${path}:${payloadHash}`;

  const now = Date.now();
  let record = actionHistory.get(actionKey);

  const capHeader = req.headers['x-cap-token'] || req.query.cap_token;
  if (capHeader && typeof capHeader === 'string') {
    try {
      let challenge = '';
      let nonce = '';
      if (capHeader.includes(':')) {
        [challenge, nonce] = capHeader.split(':');
      } else {
        const decoded = Buffer.from(capHeader, 'base64').toString('utf8');
        [challenge, nonce] = decoded.split(':');
      }

      if (verifyCapSolution(challenge, nonce)) {
        actionHistory.delete(actionKey);
        return next();
      }
    } catch {}
  }

  if (!record || now - record.firstTime > ACTION_WINDOW_MS) {
    actionHistory.set(actionKey, { count: 1, firstTime: now });
    return next();
  }

  record.count++;
  if (record.count > MAX_IDENTICAL_HITS) {
    const challenge = createCapChallenge(clientIp);
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Обнаружены частые одинаковые действия. Пожалуйста, подтвердите капчу (CAP PoW).',
      captcha_required: true,
      challenge,
    });
  }

  next();
}

app.use(checkFrequentActionsMiddleware);

// CAP Endpoints
app.get('/api/captcha/challenge', (req, res) => {
  const clientIp = req.socket.remoteAddress || req.ip || '';
  res.json(createCapChallenge(clientIp));
});

app.post('/api/captcha/verify', (req, res) => {
  const { challenge, nonce, token } = req.body;
  let ch = challenge;
  let n = nonce;
  if (token && !ch) {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      [ch, n] = decoded.split(':');
    } catch {}
  }

  const isValid = verifyCapSolution(ch, n);
  if (isValid) {
    res.json({ success: true, message: 'Капча успешно пройдена' });
  } else {
    res.status(400).json({ success: false, error: 'Неверное решение капчи' });
  }
});

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
  console.log(`[NextPDA Public] Открытый сервер запущен на http://localhost:${PORT}`);
});
