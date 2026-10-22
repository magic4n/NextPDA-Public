/**
 * CAP Captcha Client Service (https://github.com/tiagozip/cap compatible)
 * -----------------------------------------------------------------------
 * Автономный Proof-of-Work (PoW) клиент для защиты от частых одинаковых действий.
 * Вычисляет криптографическое доказательство работы через Web Crypto API за ~200-400мс.
 */

export interface CapChallenge {
  challenge: string;
  difficulty: number;
  expiresAt: number;
}

export interface CapSolution {
  challenge: string;
  nonce: number;
  token: string;
  hash: string;
}

let activeCapToken: string | null = null;

export function getActiveCapToken(): string | null {
  return activeCapToken;
}

export function setActiveCapToken(token: string | null): void {
  activeCapToken = token;
}

// Преобразование ArrayBuffer в hex-строку
function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  const hexCodes: string[] = [];
  for (let i = 0; i < byteArray.length; i++) {
    const byte = byteArray[i];
    hexCodes.push((byte >>> 4).toString(16));
    hexCodes.push((byte & 0x0f).toString(16));
  }
  return hexCodes.join('');
}

/**
 * Решение Proof-of-Work задачи CAP
 */
export async function solveCapChallenge(
  challenge: string,
  difficulty = 4,
  onProgress?: (nonce: number) => void
): Promise<CapSolution> {
  const targetPrefix = '0'.repeat(difficulty);
  const encoder = new TextEncoder();
  let nonce = 0;

  // Итеративный поиск nonce, дающего хеш с нужным числом нулей
  while (true) {
    const data = encoder.encode(`${challenge}:${nonce}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashHex = bufferToHex(hashBuffer);

    if (hashHex.startsWith(targetPrefix)) {
      const token = btoa(`${challenge}:${nonce}`);
      setActiveCapToken(token);
      return {
        challenge,
        nonce,
        token,
        hash: hashHex,
      };
    }

    nonce++;
    if (nonce % 500 === 0 && onProgress) {
      onProgress(nonce);
      // Небольшая уступка event loop, чтобы UI не зависал
      await new Promise((r) => setTimeout(r, 0));
    }
  }
}

/**
 * Запрос нового PoW испытания с сервера
 */
export async function fetchCapChallenge(apiBaseUrl = '/api'): Promise<CapChallenge> {
  const res = await fetch(`${apiBaseUrl}/captcha/challenge`);
  if (!res.ok) {
    throw new Error('Не удалось получить испытание капчи');
  }
  return await res.json();
}

/**
 * Отправка решения на сервер для валидации
 */
export async function verifyCapSolutionOnServer(
  token: string,
  apiBaseUrl = '/api'
): Promise<boolean> {
  try {
    const res = await fetch(`${apiBaseUrl}/captcha/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}
