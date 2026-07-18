import React from 'react'

const ModalSection = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="max-w-4xl h-full w-full rounded-xl border border-border/40 border-dashed flex flex-col text-center gap-10 items-center justify-center p-10 bg-card/30">
      {children}
    </section>
  )
}

export default ModalSection
