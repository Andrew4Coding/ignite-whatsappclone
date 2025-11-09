/**
 * These types indicate the shape of the data you expect to receive from your
 * API endpoint, assuming it's a JSON object like we have.
 */
export interface EpisodeItem {
  title: string
  pubDate: string
  link: string
  guid: string
  author: string
  thumbnail: string
  description: string
  content: string
  enclosure: {
    link: string
    type: string
    length: number
    duration: number
    rating: { scheme: string; value: string }
  }
  categories: string[]
}

export interface ApiFeedResponse {
  status: string
  feed: {
    url: string
    title: string
    link: string
    author: string
    description: string
    image: string
  }
  items: EpisodeItem[]
}

/**
 * The options used to configure apisauce.
 */
export interface ApiConfig {
  /**
   * The URL of the api.
   */
  url: string

  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number
}

/**
 * WhatsApp Clone API Types
 */

/**
 * Represents a chat room/conversation
 */
export interface Room {
  id: string
  name: string
  description?: string
  imageUrl?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
  participants?: string[]
  createdAt: string
  updatedAt?: string
}

/**
 * Represents a message in a chat room
 */
export interface Message {
  id: string
  roomId: string
  content: string
  senderId: string
  senderName?: string
  senderAvatar?: string
  type?: "text" | "image" | "video" | "audio" | "file"
  status?: "sent" | "delivered" | "read"
  createdAt: string
  updatedAt?: string
  replyTo?: string
  metadata?: Record<string, any>
}

/**
 * API Response Types
 */

/**
 * The result of getting a single room
 */
export type GetRoomResult =
  | { kind: "ok"; room: Room }
  | { kind: "bad-data" }
  | { kind: "unauthorized" }
  | { kind: "forbidden" }
  | { kind: "not-found" }
  | { kind: "rejected" }
  | { kind: "unknown" }
  | { kind: "bad-request" }
  | { kind: "timeout" }
  | { kind: "cannot-connect" }
  | { kind: "server" }

/**
 * The result of getting multiple rooms
 */
export type GetRoomsResult =
  | { kind: "ok"; rooms: Room[] }
  | { kind: "bad-data" }
  | { kind: "unauthorized" }
  | { kind: "forbidden" }
  | { kind: "not-found" }
  | { kind: "rejected" }
  | { kind: "unknown" }
  | { kind: "bad-request" }
  | { kind: "timeout" }
  | { kind: "cannot-connect" }
  | { kind: "server" }

/**
 * The result of getting a single message
 */
export type GetMessageResult =
  | { kind: "ok"; message: Message }
  | { kind: "bad-data" }
  | { kind: "unauthorized" }
  | { kind: "forbidden" }
  | { kind: "not-found" }
  | { kind: "rejected" }
  | { kind: "unknown" }
  | { kind: "bad-request" }
  | { kind: "timeout" }
  | { kind: "cannot-connect" }
  | { kind: "server" }

/**
 * The result of getting multiple messages
 */
export type GetMessagesResult =
  | { kind: "ok"; messages: Message[] }
  | { kind: "bad-data" }
  | { kind: "unauthorized" }
  | { kind: "forbidden" }
  | { kind: "not-found" }
  | { kind: "rejected" }
  | { kind: "unknown" }
  | { kind: "bad-request" }
  | { kind: "timeout" }
  | { kind: "cannot-connect" }
  | { kind: "server" }
