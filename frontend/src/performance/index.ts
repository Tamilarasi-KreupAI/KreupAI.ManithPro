// ============================================================
// PERFORMANCE MODULE - Main Entry Point
// ============================================================

// Lazy Loading & Code Splitting
export {
  createLazyComponent,
  lazyWithRetry,
  lazyWithPreload,
  lazyRoutes,
  preloadCriticalRoutes,
  usePreloadOnInteraction,
  usePreloadOnVisible,
  preloadComponents,
  DefaultLoadingFallback,
  DefaultErrorFallback,
  type LazyComponentOptions,
  type PreloadableComponent,
} from './lazy';

// Image Optimization
export {
  OptimizedImage,
  Avatar,
  LazyBackground,
  Picture,
  preloadImage,
  preloadImages,
  getOptimizedUrl,
  generateBlurPlaceholder,
  type OptimizedImageProps,
  type AvatarProps,
  type LazyBackgroundProps,
  type PictureProps,
} from './images';

// Caching
export {
  cacheManager,
  cached,
  dedupe,
  type CacheEntry,
  type CacheOptions,
  type CacheStats,
} from './cache';

// Service Worker
export {
  register as registerServiceWorker,
  unregister as unregisterServiceWorker,
  checkForUpdates,
  applyUpdate,
  clearCache,
  getCacheSize,
  precacheResources,
  registerBackgroundSync,
  subscribeToPush,
  unsubscribeFromPush,
  sendMessageToSW,
  type ServiceWorkerConfig,
  type UpdateInfo,
} from './serviceWorker';

// Monitoring & Error Tracking
export {
  errorMonitor,
  captureReactError,
  type ErrorReport,
  type ErrorType,
  type ErrorSeverity,
  type Breadcrumb,
  type PerformanceMetric,
  type MonitoringConfig,
} from './monitoring';

// API Optimization
export {
  apiClient,
  requestQueue,
  ApiError,
  interceptors,
  debouncedRequest,
  type RequestConfig,
  type ApiResponse,
  type BatchRequest,
  type BatchResponse,
} from './api';

// Logging & Analytics
export {
  logger,
  analytics,
  performanceTracker,
  featureFlags,
  createTraceContext,
  type LogLevel,
  type LogEntry,
  type LoggerConfig,
  type AnalyticsEvent,
} from './logger';
