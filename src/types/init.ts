import {type Schema} from 'zod'

export type RequestHandler = (context: ExecutionContext, data: any) => string | Promise<string>

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
