/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/#backend-api-integration)
 * documentation for more details.
 */
import { ApiResponse, ApisauceInstance, create } from "apisauce"

import Config from "@/config"

import { getGeneralApiProblem } from "./apiProblem"
import type {
  ApiConfig,
  GetMessageResult,
  GetMessagesResult,
  GetRoomResult,
  GetRoomsResult,
  Message,
  Room,
} from "./types"

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })
  }

  /**
   * Gets all chat rooms
   */
  async getRooms(): Promise<GetRoomsResult> {
    // make the api call
    const response: ApiResponse<Room[]> = await this.apisauce.get("/Room")

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const rooms = response.data
      if (!rooms) return { kind: "bad-data" }
      return { kind: "ok", rooms }
    } catch (e) {
      if (__DEV__) {
        console.tron.log(e)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Gets a single chat room by ID
   */
  async getRoom(id: string): Promise<GetRoomResult> {
    // make the api call
    const response: ApiResponse<Room> = await this.apisauce.get(`/Room/${id}`)

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const room = response.data
      if (!room) return { kind: "bad-data" }
      return { kind: "ok", room }
    } catch (e) {
      if (__DEV__) {
        console.tron.log(e)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Creates a new chat room
   */
  async addRoom(room: Omit<Room, "createdAt" | "id">): Promise<GetRoomResult> {
    // make the api call
    const response: ApiResponse<Room> = await this.apisauce.post("/Room", room)

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const room = response.data
      if (!room) return { kind: "bad-data" }
      return { kind: "ok", room }
    } catch (e) {
      if (__DEV__) {
        console.tron.log(e)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Gets all messages for a specific room
   */
  async getMessages(roomId: string): Promise<GetMessagesResult> {
    // make the api call
    const response: ApiResponse<Message[]> = await this.apisauce.get(`/Room/${roomId}/Message`)

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const messages = response.data
      if (!messages) return { kind: "bad-data" }
      return { kind: "ok", messages }
    } catch (e) {
      if (__DEV__) {
        console.tron.log(e)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Sends a new message to a room
   */
  async addMessage(
    message: Omit<Message, "id" | "createdAt" | "roomId">,
    roomId: string,
  ): Promise<GetMessageResult> {
    // make the api call
    const response: ApiResponse<Message> = await this.apisauce.post(
      `/Room/${roomId}/Message`,
      message,
    )

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const message = response.data
      if (!message) return { kind: "bad-data" }
      return { kind: "ok", message }
    } catch (e) {
      if (__DEV__) {
        console.tron.log(e)
      }
      return { kind: "bad-data" }
    }
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
