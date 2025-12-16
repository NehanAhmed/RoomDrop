import { useState } from 'react';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { cn } from '@/lib/utils'; // shadcn utils for class merging

// Reusable Copy Button Component
interface CopyButtonProps {
  textToCopy: string;
  onCopySuccess?: () => void;
  onCopyError?: (error: Error) => void;
  resetDelay?: number; // milliseconds
  className?: string;
  copiedClassName?: string;
  iconSize?: number;
  ariaLabel?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'success';
}

export function CopyButton({
  textToCopy,
  onCopySuccess,
  onCopyError,
  resetDelay = 2000,
  className,
  copiedClassName,
  iconSize = 18,
  ariaLabel = 'Copy to clipboard',
  variant = 'outline',
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers or non-HTTPS
        fallbackCopyTextToClipboard(textToCopy);
      }

      setIsCopied(true);
      onCopySuccess?.();

      // Reset after delay
      setTimeout(() => {
        setIsCopied(false);
      }, resetDelay);
    } catch (error) {
      console.error('Failed to copy:', error);
      onCopyError?.(error as Error);
    }
  };

  // Fallback copy method for older browsers
  function fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
    } catch (err) {
      throw new Error('Fallback: Failed to copy');
    } finally {
      document.body.removeChild(textArea);
    }
  }

  // Base styles matching shadcn/ui design system
  const baseStyles = cn(
    // Base button styles
    'inline-flex items-center justify-center rounded-md text-sm font-medium',
    'transition-colors focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'h-9 w-9 p-0', // Icon button size
  );

  // Variant styles
  const variantStyles = {
    default: cn(
      'bg-primary text-primary-foreground hover:bg-primary/90',
      isCopied && 'bg-green-600 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-700'
    ),
    outline: cn(
      'border border-input bg-background hover:bg-background/80',
      isCopied && 'border-green-600 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 dark:border-green-700'
    ),
    ghost: cn(
      'hover:bg-accent hover:text-accent-foreground',
      isCopied && 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
    ),
    success: cn(
      'bg-accent text-accent-foreground hover:bg-accent/90',
      isCopied && 'bg-green-600 text-white hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-700'
    ),
  };

  const buttonClasses = cn(
    baseStyles,
    variantStyles[variant],
    className,
    isCopied && copiedClassName
  );

  return (
    <button
      onClick={handleCopy}
      disabled={isCopied}
      className={buttonClasses}
      aria-label={isCopied ? 'Copied!' : ariaLabel}
      type="button"
      title={isCopied ? 'Copied!' : ariaLabel}
    >
      {isCopied ? (
        <IconCheck 
          size={iconSize} 
          aria-hidden="true"
          className="transition-all duration-200" 
        />
      ) : (
        <IconCopy 
          size={iconSize} 
          aria-hidden="true"
          className="transition-all duration-200" 
        />
      )}
    </button>
  );
}