/**
 * Platform Configuration Service (Public Edition)
 * Базовая конфигурация для открытого веб-клиента NextPDA.
 */

export type PlatformType = 'web';

export const isWeb = true;
export const isNativeApp = false;
export const platformType: PlatformType = 'web';

export function isTauri(): boolean {
  return false;
}

export function getPlatformType(): PlatformType {
  return 'web';
}

export function getApiBaseUrl(): string {
  return '/api';
}

export async function invokeTauriCommand(): Promise<null> {
  return null;
}
