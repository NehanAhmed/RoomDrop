import React from 'react'

const ModalSection = ({ children }: { children: React.ReactNode }) => {
    return (
        <section className='max-w-4xl max-h-192 h-full w-full  b-card border border-border border-dashed  flex flex-col text-center gap-10 items-center justify-center p-10'>

            {children}
        </section>
    )
}

export default ModalSection