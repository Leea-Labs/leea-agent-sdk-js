import {Schema} from 'ajv'

export type Agent = {
  id: string
  name: string
  display_name: string
  description: string
  input_schema: Schema
  output_schema: Schema
  public_key: string
  is_online: boolean
  user: {username: string}
}

export type AgentCallResponse<T = any> = {result: T; isSuccessful: boolean}
export type AgentCallResult<T = any> = AgentCallResponse<T> & {isValid: boolean}
