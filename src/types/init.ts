import {type Schema} from 'zod'
import {Agent} from './agent'

export type RequestHandler = (data: any, fns: ContextFns, ctx: ExecutionContext) => string | Promise<string>

type ContextFns = {
  getAgent: (fullname: string) => Promise<Agent>
  getAgentsList: () => Promise<Agent[]>
  callAgent: (agentID: string, input: any) => Promise<string>
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
  secretPath: string
  requestHandler: RequestHandler
  displayName: string
  visibility?: 'public' | 'private'
  avatarPath?: string
}
