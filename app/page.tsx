import HomeModal from "@/components/Home/HomeModal";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

export default function Page() {
    return (
        <main className="w-full min-h-screen font-mono flex justify-center items-center">
            <HomeModal />
        </main>
    )
}