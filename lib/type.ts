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
    userName: string;
    message: string;
    imageUrl?: string;
    timestamp: string;
}

export interface RoomInfo extends Room {
    remainingSeconds: number;
    onlineUsers: string[];
}