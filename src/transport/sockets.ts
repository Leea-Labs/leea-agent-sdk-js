import {WebSocket} from 'ws'
import {protocolService} from '../services/protocol.service'
import {AgentHello} from '../protocol/protocol'
import {routes} from './handlers/routes'
import {AuthAwait} from '../types/auth'
import {appConfig} from '../services/config'

export class WebSocketClient {
  private socket: WebSocket | null = null
  private url: string = appConfig.LEEA_WS_URL
  private authAwait: AuthAwait = {
    promise: null,
    resolve: null,
  }

  public connect(token: string, helloData: AgentHello) {
    this.authAwait.promise = new Promise<boolean>((r) => (this.authAwait.resolve = r))
    this.socket = new WebSocket(this.url, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    this.socket.onopen = () => {
      console.log('Connection established')
      const helloMsg = AgentHello.create(helloData)
      this.sendMessage(helloMsg, true)
    }

    this.socket.onmessage = (event) => {
      this.handleMessage(event.data as ArrayBuffer)
    }

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed.', event.code, event.reason)
    }
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
