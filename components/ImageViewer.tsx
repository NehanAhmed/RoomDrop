'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { IconX, IconDownload } from '@tabler/icons-react'

interface ImageViewerProps {
  src: string
  alt?: string
  open: boolean
  onClose: () => void
}

export function ImageViewer({ src, alt, open, onClose }: ImageViewerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  const handleDownload = useCallback(async () => {
    try {
      const res = await fetch(src)
      const blob = await res.blob()
      const ext = blob.type.split('/')[1] || 'jpg'
      const filename = alt && alt !== 'Uploaded image'
        ? `${alt.replace(/\s+/g, '_')}.${ext}`
        : `image_${Date.now()}.${ext}`

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(src, '_blank')
    }
  }, [src, alt])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <div
            className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/40 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-sans text-sm text-white/80 font-medium truncate max-w-[60%]">
              {alt ?? 'Image preview'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white font-sans text-xs font-medium hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200"
                aria-label="Download image"
              >
                <IconDownload className="h-4 w-4" />
                Download
              </button>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center bg-white/10 text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200"
                aria-label="Close image viewer"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>
          </div>

          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            src={src}
            alt={alt ?? 'Uploaded image'}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
