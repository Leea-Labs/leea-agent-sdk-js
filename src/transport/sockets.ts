import {WebSocket} from 'ws'
import {protocolService} from '../services/protocol.service'
import {AgentHello} from '../protocol/protocol'
import {routes} from './handlers/routes'
import {AuthAwait} from '../types/auth'
import {appConfig} from '../services/config'

export class WebSocketClient {
  private socket: WebSocket | null = null
  private readonly url: string = appConfig.LEEA_WS_URL
  private readonly authAwait: AuthAwait = {
    promise: null,
    resolve: null,
  }
  private readonly maxRetries = 20
  private readonly reconnectDelay = 1000
  private reconnectAttempts = 0

  constructor(private readonly token: string, private readonly helloData: AgentHello) {
    this.connect()
  }

  public connect() {
    this.authAwait.promise = new Promise<boolean>((r) => (this.authAwait.resolve = r))
    this.socket = new WebSocket(this.url, {
      headers: {
        authorization: `Bearer ${this.token}`,
      },
    })

    this.socket.onopen = () => {
      this.reconnectAttempts = 0
      console.log('Connection established')
      const helloMsg = AgentHello.create(this.helloData)
      this.sendMessage(helloMsg, true)
    }

    this.socket.onmessage = (event) => {
      this.handleMessage(event.data as ArrayBuffer)
    }

    this.socket.onerror = (event) => {
      console.error(`Leea connection error: ${event.error?.code}`)
    }

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed.', event.code, event.reason)
      this.reconnect()
    }
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxRetries) {
      throw new Error('Max reconnect attempts reached')
    }

    const delay = this.reconnectDelay * ++this.reconnectAttempts

    setTimeout(() => {
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
      this.connect()
    }, delay)
  }

  public disconnect = () => {
    this.socket?.close()
  }

  async sendMessage(message: object, skipAuth = false) {
    if (!skipAuth) {
      await this.authAwait.promise
    }
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(protocolService.pack(message))
    } else {
      console.error('WebSocket is not open. Unable to send message:', message)
    }
  }

  private handleMessage(data: ArrayBuffer) {
    const [messageType, message] = protocolService.unpack(data)
    const handler = routes[messageType]
    if (!handler) {
      return
    }
    handler(message, this.sendMessage.bind(this), this.authAwait)
  }
}
