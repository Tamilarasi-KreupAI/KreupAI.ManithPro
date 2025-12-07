// ============================================================
// SERVICE WORKER - Registration and management utilities
// ============================================================

// ============================================
// Types
// ============================================
export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

export interface UpdateInfo {
  isAvailable: boolean;
  registration?: ServiceWorkerRegistration;
}

// ============================================
// Service Worker Registration
// ============================================
export function register(config: ServiceWorkerConfig = {}): void {
  if ('serviceWorker' in navigator) {
    // Only register in production
    const isProduction = process.env.NODE_ENV === 'production';
    const publicUrl = new URL(import.meta.env.BASE_URL, window.location.href);

    // Our service worker won't work if PUBLIC_URL is on a different origin
    if (publicUrl.origin !== window.location.origin) {
      console.warn('Service worker not registered: different origin');
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL}service-worker.js`;

      if (isProduction) {
        registerValidSW(swUrl, config);
      } else {
        // In development, check if service worker exists
        checkValidServiceWorker(swUrl, config);
      }

      // Add network status listeners
      setupNetworkListeners(config);
    });
  }
}

async function registerValidSW(
  swUrl: string,
  config: ServiceWorkerConfig
): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.register(swUrl);

    registration.onupdatefound = () => {
      const installingWorker = registration.installing;

      if (!installingWorker) return;

      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New content available; notify user
            console.log('New content available; please refresh.');
            config.onUpdate?.(registration);
          } else {
            // Content cached for offline use
            console.log('Content cached for offline use.');
            config.onSuccess?.(registration);
          }
        }
      };
    };
  } catch (error) {
    console.error('Error registering service worker:', error);
    config.onError?.(error as Error);
  }
}

async function checkValidServiceWorker(
  swUrl: string,
  config: ServiceWorkerConfig
): Promise<void> {
  try {
    const response = await fetch(swUrl, {
      headers: { 'Service-Worker': 'script' },
    });

    const contentType = response.headers.get('content-type');

    if (
      response.status === 404 ||
      (contentType && contentType.indexOf('javascript') === -1)
    ) {
      // Service worker not found or not JavaScript
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      window.location.reload();
    } else {
      // Valid service worker found
      registerValidSW(swUrl, config);
    }
  } catch {
    console.log('No internet connection. App is running offline.');
    config.onOffline?.();
  }
}

function setupNetworkListeners(config: ServiceWorkerConfig): void {
  window.addEventListener('online', () => {
    console.log('App is online');
    config.onOnline?.();
  });

  window.addEventListener('offline', () => {
    console.log('App is offline');
    config.onOffline?.();
  });
}

// ============================================
// Unregister Service Worker
// ============================================
export async function unregister(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      return registration.unregister();
    } catch (error) {
      console.error('Error unregistering service worker:', error);
      return false;
    }
  }
  return false;
}

// ============================================
// Check for Updates
// ============================================
export async function checkForUpdates(): Promise<UpdateInfo> {
  if (!('serviceWorker' in navigator)) {
    return { isAvailable: false };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();

    const hasUpdate = !!(registration.waiting || registration.installing);

    return {
      isAvailable: hasUpdate,
      registration: hasUpdate ? registration : undefined,
    };
  } catch (error) {
    console.error('Error checking for updates:', error);
    return { isAvailable: false };
  }
}

// ============================================
// Apply Update (Skip Waiting)
// ============================================
export async function applyUpdate(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;

  if (registration.waiting) {
    // Tell the waiting service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Reload once the new service worker takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }
}

// ============================================
// Clear Service Worker Cache
// ============================================
export async function clearCache(cacheNames?: string[]): Promise<void> {
  if (!('caches' in window)) return;

  const names = cacheNames || (await caches.keys());

  await Promise.all(names.map((name) => caches.delete(name)));
}

// ============================================
// Get Cache Size
// ============================================
export async function getCacheSize(): Promise<{
  total: number;
  formatted: string;
}> {
  if (!('caches' in window) || !('storage' in navigator)) {
    return { total: 0, formatted: '0 B' };
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;

    return {
      total: usage,
      formatted: formatBytes(usage),
    };
  } catch {
    return { total: 0, formatted: '0 B' };
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// ============================================
// Precache Resources
// ============================================
export async function precacheResources(urls: string[]): Promise<void> {
  if (!('caches' in window)) return;

  const cache = await caches.open('app-precache-v1');
  await cache.addAll(urls);
}

// ============================================
// Background Sync
// ============================================
export async function registerBackgroundSync(tag: string): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register(tag);
    return true;
  } catch (error) {
    console.error('Background sync registration failed:', error);
    return false;
  }
}

// ============================================
// Push Notification Subscription
// ============================================
export async function subscribeToPush(
  vapidPublicKey: string
): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      return subscription.unsubscribe();
    }

    return true;
  } catch (error) {
    console.error('Push unsubscription failed:', error);
    return false;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// ============================================
// Service Worker Communication
// ============================================
export async function sendMessageToSW(message: unknown): Promise<unknown> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker not supported');
  }

  const registration = await navigator.serviceWorker.ready;

  if (!registration.active) {
    throw new Error('No active service worker');
  }

  return new Promise((resolve, reject) => {
    const messageChannel = new MessageChannel();

    messageChannel.port1.onmessage = (event) => {
      if (event.data.error) {
        reject(new Error(event.data.error));
      } else {
        resolve(event.data);
      }
    };

    registration.active.postMessage(message, [messageChannel.port2]);
  });
}

// ============================================
// Export
// ============================================
export default {
  register,
  unregister,
  checkForUpdates,
  applyUpdate,
  clearCache,
  getCacheSize,
  precacheResources,
  registerBackgroundSync,
  subscribeToPush,
  unsubscribeFromPush,
  sendMessageToSW,
};
