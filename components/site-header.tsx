import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { RoomCountdown } from "./Message/RoomCountdown"
import { getRoomInfo } from "@/lib/RoomService"

export async function SiteHeader({ roomCode }: { roomCode: string }) {

  const roomInfo = await getRoomInfo(roomCode)
  if (!roomInfo) {
    return null
  }
  const { remainingSeconds } = roomInfo

  return (
    <header className="flex h-(--header-height) py-2 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <RoomCountdown expiresAt={new Date(Date.now() + remainingSeconds * 1000)} />
      </div>
    </header>
  )
}
