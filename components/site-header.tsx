import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { RoomCountdown } from './Message/RoomCountdown'
import { getRoomInfo } from '@/lib/RoomService'

export async function SiteHeader({ roomCode }: { roomCode: string }) {
  const roomInfo = await getRoomInfo(roomCode)
  if (!roomInfo) return null
  const { remainingSeconds } = roomInfo

  return (
    <header className="flex h-(--header-height) py-2 shrink-0 items-center gap-2 border-b border-border/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger />
        <Separator orientation="vertical" />
        <RoomCountdown remainingSeconds={remainingSeconds} />
      </div>
    </header>
  )
}
