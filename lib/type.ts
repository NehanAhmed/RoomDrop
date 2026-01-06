export interface Room {
    code: string;
    creator: string;
    participants: string[];
    createdAt: string;
    expiresAt: string;
    duration: number;
    participantsCount: number;
    messageCount: number;
}

export interface Message {
    id: string;
    user: string;
    message: string;
    timestamp: string;
}

export interface RoomInfo extends Room {
    remainingSeconds: number;
    onlineUsers: string[];
}