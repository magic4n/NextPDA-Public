import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import { getApiBaseUrl } from './platform';

export async function startDownload(
  fileUrl: string,
  fileName: string,
  expectedSizeBytes = 0
): Promise<void> {
  const uiStore = useUIStore.getState();
  const authStore = useAuthStore.getState();
  const downloadId = 'dl_' + Math.random().toString(36).substring(2, 9);

  const is4pdaUrl = fileUrl.includes('4pda.to') || fileUrl.startsWith('/');
  const is4pdaAttachment = fileUrl.includes('/forum/dl/post/') || fileUrl.includes('act=attach');

  // 4PDA forum attachments strictly require an authenticated member session
  if (is4pdaAttachment && !authStore.isAuthenticated) {
    uiStore.showToast('Для скачивания вложений с 4PDA требуется авторизация', 'warning');
    authStore.setAuthModalOpen(true);
    return;
  }

  // Direct external downloads (e.g. GitHub, Mega, Google Drive, bigota)
  if (!is4pdaUrl) {
    uiStore.showToast(`Запуск скачивания: ${fileName}`, 'info');
    triggerNativeDownload(fileUrl, fileName);

    uiStore.addDownload({
      id: downloadId,
      name: fileName,
      sizeBytes: expectedSizeBytes || 1024 * 1024,
      sizeFormatted: expectedSizeBytes ? formatBytes(expectedSizeBytes) : 'Внешняя ссылка',
      downloadedBytes: expectedSizeBytes || 1024 * 1024,
      progressPercent: 100,
      speedFormatted: 'Браузер',
      status: 'completed',
      url: fileUrl,
    });
    return;
  }

  // Proxied 4PDA file download
  const initialItem = {
    id: downloadId,
    name: fileName,
    sizeBytes: expectedSizeBytes || 10 * 1024 * 1024,
    sizeFormatted: expectedSizeBytes ? formatBytes(expectedSizeBytes) : '...',
    downloadedBytes: 0,
    progressPercent: 0,
    speedFormatted: '0 МБ/с',
    status: 'downloading' as const,
    url: fileUrl,
  };

  uiStore.addDownload(initialItem);
  uiStore.showToast(`Скачивание с 4PDA: ${fileName}`, 'info');

  const proxyUrl = `${getApiBaseUrl()}/proxy/download?url=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(fileName)}`;

  try {
    const headers: Record<string, string> = {};
    if (authStore.token) {
      headers['X-4PDA-Token'] = authStore.token;
    }

    const response = await fetch(proxyUrl, { headers });

    if (!response.ok) {
      let errorText = `Ошибка сервера (${response.status})`;
      try {
        const errorJson = await response.json();
        if (errorJson.error) {
          errorText = errorJson.error;
        }
        if (errorJson.code === 'AUTH_REQUIRED' || errorJson.code === 'GUEST_FORBIDDEN') {
          authStore.setAuthModalOpen(true);
        }
      } catch {
        // use default errorText
      }
      uiStore.failDownload(downloadId);
      uiStore.showToast(errorText, 'error');
      return;
    }

    const contentLength = response.headers.get('content-length');
    const totalBytes = contentLength ? parseInt(contentLength, 10) : (expectedSizeBytes || 10 * 1024 * 1024);

    if (!response.body) {
      const blob = await response.blob();
      triggerSave(blob, fileName);
      uiStore.completeDownload(downloadId);
      uiStore.showToast(`Файл ${fileName} успешно сохранен!`, 'success');
      return;
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;
    let lastTime = Date.now();
    let bytesInInterval = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        chunks.push(value);
        receivedBytes += value.length;
        bytesInInterval += value.length;
      }

      const now = Date.now();
      const timeDiff = (now - lastTime) / 1000;
      if (timeDiff >= 0.25) {
        const speedMBs = (bytesInInterval / 1024 / 1024 / Math.max(timeDiff, 0.001)).toFixed(1);
        uiStore.updateDownloadProgress(downloadId, receivedBytes, `${speedMBs} МБ/с`);
        lastTime = now;
        bytesInInterval = 0;
      }
    }

    const fullBlob = new Blob(chunks);
    const blobUrl = URL.createObjectURL(fullBlob);
    triggerSave(fullBlob, fileName);
    uiStore.completeDownload(downloadId, blobUrl);
    uiStore.showToast(`Файл ${fileName} успешно загружен!`, 'success');
  } catch (error: any) {
    console.error('Download stream failed:', error);
    uiStore.failDownload(downloadId);
    uiStore.showToast(`Сбой скачивания файла ${fileName}: ${error.message || 'Ошибка сети'}`, 'error');
  }
}

function triggerNativeDownload(url: string, fileName: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function triggerSave(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Б';
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
