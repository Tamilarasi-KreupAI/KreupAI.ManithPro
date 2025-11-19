import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200';

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
    none: '',
  };

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-live="polite"
      aria-busy="true"
    />
  );
};

// Preset skeleton components for common use cases
export const JobCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton variant="rectangular" width={64} height={64} />
        <div className="flex-1">
          <Skeleton className="mb-2" width="70%" />
          <Skeleton width="50%" />
        </div>
      </div>
      <Skeleton className="mb-2" width="100%" />
      <Skeleton className="mb-4" width="90%" />
      <div className="flex gap-2 mb-4">
        <Skeleton variant="rectangular" width={80} height={24} />
        <Skeleton variant="rectangular" width={80} height={24} />
        <Skeleton variant="rectangular" width={80} height={24} />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton width={100} />
        <Skeleton variant="rectangular" width={120} height={36} />
      </div>
    </div>
  );
};

export const CandidateCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width={80} height={80} />
        <div className="flex-1">
          <Skeleton className="mb-2" width="60%" />
          <Skeleton width="40%" />
        </div>
      </div>
      <div className="mb-4">
        <Skeleton className="mb-2" width="100%" />
        <Skeleton width="80%" />
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rectangular" width={70} height={24} />
        ))}
      </div>
      <Skeleton variant="rectangular" width="100%" height={36} />
    </div>
  );
};

export const ApplicationCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="mb-2" width="70%" />
          <Skeleton width="50%" />
        </div>
        <Skeleton variant="rectangular" width={90} height={28} />
      </div>
      <Skeleton className="mb-2" width="100%" />
      <Skeleton className="mb-4" width="60%" />
      <div className="flex items-center justify-between">
        <Skeleton width={120} />
        <Skeleton width={100} />
      </div>
    </div>
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="flex items-center gap-6 mb-8">
        <Skeleton variant="circular" width={120} height={120} />
        <div className="flex-1">
          <Skeleton className="mb-3" width="40%" height={32} />
          <Skeleton className="mb-2" width="30%" />
          <Skeleton width="50%" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton width="100%" />
        <Skeleton width="95%" />
        <Skeleton width="90%" />
        <Skeleton width="85%" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => {
  return (
    <tr className="border-b border-gray-200">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton width="80%" />
        </td>
      ))}
    </tr>
  );
};

export const ListItemSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <Skeleton className="mb-2" width="70%" />
        <Skeleton width="40%" />
      </div>
      <Skeleton variant="rectangular" width={80} height={32} />
    </div>
  );
};

export const MessageSkeleton: React.FC = () => {
  return (
    <div className="flex items-start gap-3 p-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton width={100} />
          <Skeleton width={60} />
        </div>
        <Skeleton className="mb-1" width="100%" />
        <Skeleton width="80%" />
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 300 }) => {
  return (
    <div className="bg-white rounded-lg p-6">
      <Skeleton className="mb-6" width="40%" height={24} />
      <Skeleton variant="rectangular" width="100%" height={height} />
    </div>
  );
};

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton width={120} />
        <Skeleton variant="circular" width={48} height={48} />
      </div>
      <Skeleton width={100} height={36} />
      <Skeleton className="mt-2" width={80} />
    </div>
  );
};

export default Skeleton;
