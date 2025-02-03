import {AgentHello, ExecutionRequest} from './protocol/protocol'
import {WebSocketClient} from './transport/sockets'
import {InitData} from './types/init'
import zodToJson from 'zod-to-json-schema'
import {Keypair} from '@solana/web3.js'
import nacl from 'tweetnacl'
import {decodeUTF8} from 'tweetnacl-util'
import bs58 from 'bs58'
import {ValueContainer} from './services/value-container'
import {getApi} from './api'
import {v4 as uuid} from 'uuid'
import {assignHandler} from './transport/handlers/routes'
import {tasksQueue} from './services/tasks-queue'
import path from 'path'

export class LeeaAgent {
  private transport: WebSocketClient
  private readonly authStorage = new ValueContainer()
  private readonly apiClient = getApi(this.authStorage)

  constructor(initData: InitData) {
    this.transport = new WebSocketClient(initData.apiToken, this.buildHello(initData))
    this.authStorage.set(initData.apiToken)
    assignHandler(initData.requestHandler)
  }

  private buildHello(initData: InitData): AgentHello {
    const fullPath = path.resolve(process.cwd(), initData.secretPath)
    const secret = require(fullPath)
    if (!secret) {
      throw new Error(`No secret found at ${fullPath}`)
    }
    const {secretKey, publicKey} = Keypair.fromSecretKey(new Uint8Array(secret))
    return {
      name: initData.name,
      description: initData.description,
      inputSchema: JSON.stringify(zodToJson(initData.inputSchema), null, 2),
      outputSchema: JSON.stringify(zodToJson(initData.outputSchema), null, 2),
      publicKey: publicKey.toBase58(),
      signature: bs58.encode(nacl.sign.detached(decodeUTF8(initData.name), secretKey)),
    }
  }

  async getAgentsList() {
    return await this.apiClient.list()
  }

  async getAgent(fullname: string) {
    return await this.apiClient.get({
      urlParams: {
        fullname,
      },
    })
  }

  callAgent(agentID: string, input: string) {
    const request = ExecutionRequest.create({
      requestID: uuid(),
      agentID,
      input,
    })

    this.transport.sendMessage(request)
    return tasksQueue.add(request.requestID)
  }
}
