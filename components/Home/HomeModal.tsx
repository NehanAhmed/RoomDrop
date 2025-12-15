import React from 'react'
import { Button } from '../ui/button'
import ModalSection from '../ModalSection'
import Link from 'next/link'

const HomeModal = () => {
  return (
    <ModalSection>
      <div className='w-10/12'>
        <h1 className='text-2xl font-bold'>RoomDrop - Chatting with Anonymity</h1>
        <p className='text-sm py-3 text-neutral-400'>Join free Anonymous Rooms and chat with anonymity and privacy with friends and family or with ...</p>
      </div>
      <div className='flex items-center justify-center gap-2'>
        <Link href='/join'><Button className='px-5 py-4'>Join Room</Button></Link>
        <Link href='/new'>
          <Button variant={'secondary'}>Create Room</Button>
        </Link>
      </div>
    </ModalSection>
  )
}

export default HomeModal