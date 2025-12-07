// ============================================================
// IMAGE OPTIMIZATION - Lazy loading and optimization utilities
// ============================================================

import React, { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

// ============================================
// Types
// ============================================
export interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  placeholder?: 'blur' | 'empty' | React.ReactNode;
  blurDataURL?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export interface ImageSet {
  src: string;
  width: number;
  type?: string;
}

// ============================================
// Image Loading States
// ============================================
type ImageLoadState = 'loading' | 'loaded' | 'error';

// ============================================
// Optimized Image Component
// ============================================
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  placeholder = 'empty',
  blurDataURL,
  priority = false,
  quality = 75,
  sizes,
  className,
  onLoad,
  onError,
  ...props
}) => {
  const [loadState, setLoadState] = useState<ImageLoadState>(
    priority ? 'loaded' : 'loading'
  );
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = (): void => {
    setLoadState('loaded');
    onLoad?.();
  };

  const handleError = (): void => {
    setLoadState('error');
    onError?.();
  };

  // Generate srcset for responsive images
  const generateSrcSet = (): string | undefined => {
    if (!width) return undefined;

    const widths = [0.5, 1, 1.5, 2].map((multiplier) =>
      Math.round(width * multiplier)
    );

    return widths
      .map((w) => `${getOptimizedUrl(src, w, quality)} ${w}w`)
      .join(', ');
  };

  // Placeholder rendering
  const renderPlaceholder = (): React.ReactNode => {
    if (loadState === 'loaded') return null;

    if (placeholder === 'blur' && blurDataURL) {
      return (
        <img
          src={blurDataURL}
          alt=""
          className={cn(
            'absolute inset-0 h-full w-full object-cover',
            'filter blur-lg scale-110 transform',
            className
          )}
          aria-hidden="true"
        />
      );
    }

    if (typeof placeholder === 'object') {
      return placeholder;
    }

    return (
      <div
        className={cn(
          'absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse',
          className
        )}
        aria-hidden="true"
      />
    );
  };

  const aspectRatio = width && height ? width / height : undefined;

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      style={{
        width: width ? `${width}px` : undefined,
        aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
      }}
    >
      {renderPlaceholder()}

      {(isInView || priority) && (
        <img
          ref={imgRef}
          src={getOptimizedUrl(src, width, quality)}
          srcSet={generateSrcSet()}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            loadState === 'loaded' ? 'opacity-100' : 'opacity-0',
            loadState === 'error' && 'hidden'
          )}
          {...props}
        />
      )}

      {loadState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

// ============================================
// Avatar Component with Optimization
// ============================================
export interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fallback?: string;
  className?: string;
}

const AVATAR_SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 96,
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  fallback,
  className,
}) => {
  const [error, setError] = useState(false);
  const pixelSize = AVATAR_SIZES[size];

  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
    '2xl': 'h-24 w-24 text-2xl',
  };

  if (!src || error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-brand-100 text-brand-700 font-medium',
          sizeClasses[size],
          className
        )}
        aria-label={alt}
      >
        {fallback || getInitials(alt)}
      </div>
    );
  }

  return (
    <img
      src={getOptimizedUrl(src, pixelSize * 2, 80)} // 2x for retina
      alt={alt}
      width={pixelSize}
      height={pixelSize}
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
      className={cn('rounded-full object-cover', sizeClasses[size], className)}
    />
  );
};

// ============================================
// Background Image with Lazy Loading
// ============================================
export interface LazyBackgroundProps {
  src: string;
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const LazyBackground: React.FC<LazyBackgroundProps> = ({
  src,
  placeholder,
  className,
  children,
  style,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
  }, [isInView, src]);

  return (
    <div
      ref={ref}
      className={cn('bg-cover bg-center bg-no-repeat transition-all duration-500', className)}
      style={{
        backgroundImage: loaded
          ? `url(${src})`
          : placeholder
            ? `url(${placeholder})`
            : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// Image Preloader
// ============================================
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImages = async (sources: string[]): Promise<void> => {
  await Promise.all(sources.map((src) => preloadImage(src).catch(() => {})));
};

// ============================================
// Image URL Optimization Helper
// ============================================
export function getOptimizedUrl(
  src: string,
  width?: number,
  quality = 75
): string {
  // If using a CDN or image optimization service, transform URL here
  // Example for Cloudinary, Imgix, etc.

  // For now, return original URL
  // In production, this would transform to something like:
  // return `https://your-cdn.com/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;

  return src;
}

// ============================================
// Generate Blur Placeholder
// ============================================
export function generateBlurPlaceholder(color = '#e5e7eb'): string {
  // Generate a simple SVG blur placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 5">
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="1" />
      </filter>
      <rect preserveAspectRatio="none" filter="url(#b)" x="0" y="0" height="100%" width="100%" fill="${color}" />
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// ============================================
// Picture Component for Art Direction
// ============================================
export interface PictureProps {
  sources: Array<{
    srcSet: string;
    media?: string;
    type?: string;
  }>;
  fallback: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export const Picture: React.FC<PictureProps> = ({
  sources,
  fallback,
  alt,
  className,
  width,
  height,
}) => {
  return (
    <picture>
      {sources.map((source, index) => (
        <source
          key={index}
          srcSet={source.srcSet}
          media={source.media}
          type={source.type}
        />
      ))}
      <img
        src={fallback}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={className}
      />
    </picture>
  );
};

export default {
  OptimizedImage,
  Avatar,
  LazyBackground,
  Picture,
  preloadImage,
  preloadImages,
  getOptimizedUrl,
  generateBlurPlaceholder,
};
