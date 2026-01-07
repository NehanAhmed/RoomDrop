"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle, IconClock } from "@tabler/icons-react";
import { cleanupExpiredRooms } from "@/lib/cleanupRoomUtility";

interface RoomCountdownProps {
  expiresAt: Date;
  onCleanup?: () => void;
}

export function RoomCountdown({ expiresAt, onCleanup }: RoomCountdownProps) {
  const router = useRouter();
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [showExpiredDialog, setShowExpiredDialog] = useState(false);

  // Calculate initial remaining time
  useEffect(() => {
    const calculateRemaining = () => {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
      return remaining;
    };

    setRemainingSeconds(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setRemainingSeconds(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        setShowExpiredDialog(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hrs, mins, secs]
      .map((unit) => unit.toString().padStart(2, "0"))
      .join(":");
  };

  // Determine visual state based on remaining time
  const getTimerState = () => {
    if (remainingSeconds <= 20) {
      return {
        variant: "critical" as const,
        bgColor: "bg-destructive/10",
        textColor: "text-destructive",
        borderColor: "border-destructive/20",
        icon: IconAlertTriangle,
      };
    }
    if (remainingSeconds <= 120) {
      return {
        variant: "warning" as const,
        bgColor: "bg-accent/10",
        textColor: "text-accent-foreground",
        borderColor: "border-accent/20",
        icon: IconClock,
      };
    }
    return {
      variant: "normal" as const,
      bgColor: "bg-muted",
      textColor: "text-muted-foreground",
      borderColor: "border-border",
      icon: IconClock,
    };
  };

  const handleExpiredClose = async () => {
    setShowExpiredDialog(false);
    await cleanupExpiredRooms();
    localStorage.removeItem("chat_room_session");
    router.push("/");
  };

  const timerState = getTimerState();
  const Icon = timerState.icon;

  return (
    <>
      <div
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg border
          transition-all duration-300 ease-in-out
          ${timerState.bgColor}
          ${timerState.borderColor}
        `}
        role="timer"
        aria-live="polite"
        aria-label={`Room expires in ${formatTime(remainingSeconds)}`}
      >
        <Icon
          className={`
            h-4 w-4 transition-all duration-300
            ${timerState.textColor}
            ${timerState.variant === "critical" ? "animate-pulse" : ""}
          `}
        />
        <span
          className={`
            text-sm font-mono font-medium tabular-nums tracking-tight
            transition-all duration-300
            ${timerState.textColor}
          `}
        >
          {formatTime(remainingSeconds)}
        </span>
      </div>

      <Dialog open={showExpiredDialog} onOpenChange={setShowExpiredDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconAlertTriangle className="h-5 w-5 text-destructive" />
              Room Time Expired
            </DialogTitle>
            <DialogDescription className="pt-2">
              The room has reached its time limit and is now closed. All
              messages and data will be cleared.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button onClick={handleExpiredClose} className="w-full sm:w-auto">
              Return to Home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}