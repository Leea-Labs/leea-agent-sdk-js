import {Agent} from './agent'
import {Schema} from 'ajv'

export type RequestHandler = (data: any, fns: ContextFns, ctx: ExecutionContext) => any | Promise<any>

export type ContextFns = {
  callAgent: (agent: Agent, input: any) => Promise<any>
  getAgent: (fullname: string) => Promise<Agent | null>
  getAgentsList: () => Promise<Agent[]>
  log: (message: string) => void
}

export type ExecutionContext = {
  sessionId: string
  parentId?: string
  requestId: string
}

export type InitData = {
  name: string
  fee: number
  description: string
  inputSchema: Schema
  outputSchema: Schema
  apiToken: string
  secretPath?: string
  secretBase58?: string
  requestHandler: RequestHandler
  displayName: string
  visibility?: 'public' | 'private'
  avatarPath?: string
}
