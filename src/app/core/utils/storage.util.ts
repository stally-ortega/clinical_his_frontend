import { environment } from '../../../environments/environment';

const OBFUSCATION_KEY = environment.storageKey;

function xorTransform(input: string, key: string): string {
  let result = '';
  for (let i = 0; i < input.length; i++) {
    result += String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

export function secureSet(key: string, value: string): void {
  const transformed = xorTransform(value, OBFUSCATION_KEY);
  localStorage.setItem(key, btoa(transformed));
}

export function secureGet(key: string): string | null {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    const transformed = atob(raw);
    return xorTransform(transformed, OBFUSCATION_KEY);
  } catch {
    return null;
  }
}

export function secureRemove(key: string): void {
  localStorage.removeItem(key);
}
