import { Toaster, toast as hotToast } from 'react-hot-toast';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// Toast Content Component
interface ToastContentProps {
  message: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  onDismiss?: () => void;
}

function ToastContent({
  message,
  description,
  type,
  onDismiss,
}: ToastContentProps) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-success-500" />,
    error: <XCircle className="h-5 w-5 text-error-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning-500" />,
    info: <Info className="h-5 w-5 text-info-500" />,
    loading: <Loader2 className="h-5 w-5 text-brand-500 animate-spin" />,
  };

  const borderColors = {
    success: 'border-l-success-500',
    error: 'border-l-error-500',
    warning: 'border-l-warning-500',
    info: 'border-l-info-500',
    loading: 'border-l-brand-500',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-l-4 shadow-dropdown rounded-lg p-4',
        borderColors[type]
      )}
    >
      <span className="shrink-0 mt-0.5">{icons[type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {message}
        </p>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {onDismiss && type !== 'loading' && (
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 -m-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Toast Functions
export const toast = {
  success: (message: string, description?: string) => {
    return hotToast.custom(
      (t) => (
        <div
          className={cn(
            'transform transition-all duration-300',
            t.visible
              ? 'animate-slide-in-right'
              : 'animate-fade-out opacity-0'
          )}
        >
          <ToastContent
            message={message}
            description={description}
            type="success"
            onDismiss={() => hotToast.dismiss(t.id)}
          />
        </div>
      ),
      { duration: 5000 }
    );
  },

  error: (message: string, description?: string) => {
    return hotToast.custom(
      (t) => (
        <div
          className={cn(
            'transform transition-all duration-300',
            t.visible
              ? 'animate-slide-in-right'
              : 'animate-fade-out opacity-0'
          )}
        >
          <ToastContent
            message={message}
            description={description}
            type="error"
            onDismiss={() => hotToast.dismiss(t.id)}
          />
        </div>
      ),
      { duration: 6000 }
    );
  },

  warning: (message: string, description?: string) => {
    return hotToast.custom(
      (t) => (
        <div
          className={cn(
            'transform transition-all duration-300',
            t.visible
              ? 'animate-slide-in-right'
              : 'animate-fade-out opacity-0'
          )}
        >
          <ToastContent
            message={message}
            description={description}
            type="warning"
            onDismiss={() => hotToast.dismiss(t.id)}
          />
        </div>
      ),
      { duration: 5000 }
    );
  },

  info: (message: string, description?: string) => {
    return hotToast.custom(
      (t) => (
        <div
          className={cn(
            'transform transition-all duration-300',
            t.visible
              ? 'animate-slide-in-right'
              : 'animate-fade-out opacity-0'
          )}
        >
          <ToastContent
            message={message}
            description={description}
            type="info"
            onDismiss={() => hotToast.dismiss(t.id)}
          />
        </div>
      ),
      { duration: 4000 }
    );
  },

  loading: (message: string, description?: string) => {
    return hotToast.custom(
      (t) => (
        <div
          className={cn(
            'transform transition-all duration-300',
            t.visible
              ? 'animate-slide-in-right'
              : 'animate-fade-out opacity-0'
          )}
        >
          <ToastContent
            message={message}
            description={description}
            type="loading"
          />
        </div>
      ),
      { duration: Infinity }
    );
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: Error) => string);
    },
    options?: {
      loadingDescription?: string;
      successDescription?: string | ((data: T) => string);
      errorDescription?: string | ((err: Error) => string);
    }
  ) => {
    const toastId = toast.loading(
      messages.loading,
      options?.loadingDescription
    );

    promise
      .then((data) => {
        hotToast.dismiss(toastId);
        const successMessage =
          typeof messages.success === 'function'
            ? messages.success(data)
            : messages.success;
        const successDesc =
          typeof options?.successDescription === 'function'
            ? options.successDescription(data)
            : options?.successDescription;
        toast.success(successMessage, successDesc);
        return data;
      })
      .catch((err) => {
        hotToast.dismiss(toastId);
        const errorMessage =
          typeof messages.error === 'function'
            ? messages.error(err)
            : messages.error;
        const errorDesc =
          typeof options?.errorDescription === 'function'
            ? options.errorDescription(err)
            : options?.errorDescription;
        toast.error(errorMessage, errorDesc);
      });

    return toastId;
  },

  dismiss: (toastId?: string) => {
    hotToast.dismiss(toastId);
  },

  dismissAll: () => {
    hotToast.dismiss();
  },
};

// Toast Container/Provider
function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      containerClassName="!top-20"
      toastOptions={{
        duration: 5000,
      }}
      gutter={12}
    />
  );
}

export { ToastProvider };
