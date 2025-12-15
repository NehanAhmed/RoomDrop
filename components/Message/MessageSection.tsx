import React from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

const MessageSection = () => {
    return (
        <section className="w-full border-t p-4">
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Type text..."
                    className="flex-1"
                />
                <Button>Send</Button>
            </div>
        </section>
    )
}

export default MessageSection
