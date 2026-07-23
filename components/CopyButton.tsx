import { useState } from 'react'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  textToCopy: string
  onCopySuccess?: () => void
  onCopyError?: (error: Error) => void
  resetDelay?: number
  className?: string
  copiedClassName?: string
  iconSize?: number
  ariaLabel?: string
  variant?: 'default' | 'outline' | 'ghost' | 'success'
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
  variant = 'ghost',
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = textToCopy
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setIsCopied(true)
      onCopySuccess?.()
      setTimeout(() => setIsCopied(false), resetDelay)
    } catch (error) {
      console.error('Failed to copy:', error)
      onCopyError?.(error as Error)
    }
  }

  const baseStyles = cn(
    'inline-flex items-center justify-center text-sm font-medium',
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'h-9 w-9 p-0 active:scale-[0.92]',
  )

  const variantStyles = {
    default: cn(
      'bg-primary text-primary-foreground hover:bg-primary/90',
      isCopied && 'bg-green-600 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-700'
    ),
    outline: cn(
      'border border-border bg-transparent hover:bg-muted/50',
      isCopied && 'border-green-600 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 dark:border-green-700'
    ),
    ghost: cn(
      'hover:bg-muted/50 text-muted-foreground',
      isCopied && 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
    ),
    success: cn(
      'bg-primary/10 text-primary hover:bg-primary/20',
      isCopied && 'bg-green-600 text-white hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-700'
    ),
  }

  return (
    <button
      onClick={handleCopy}
      disabled={isCopied}
      className={cn(baseStyles, variantStyles[variant], className, isCopied && copiedClassName)}
      aria-label={isCopied ? 'Copied!' : ariaLabel}
      type="button"
      title={isCopied ? 'Copied!' : ariaLabel}
    >
      {isCopied ? (
        <IconCheck size={iconSize} aria-hidden="true" />
      ) : (
        <IconCopy size={iconSize} aria-hidden="true" />
      )}
    </button>
  )
}
