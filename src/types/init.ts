import {type Schema} from 'zod'
import {ExecutionRequest} from '../protocol/protocol'

export type RequestHandler = (msg: ExecutionRequest['input']) => string | Promise<string>

export type InitData = {
  name: string
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
