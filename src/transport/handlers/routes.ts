import {Envelope_MessageType as MsgType, Envelope_MessageType} from '../../protocol/protocol'
import {AuthAwait} from '../../types/auth'
import {RequestHandler} from '../../types/init'
import {executionRequestWrapper} from './execution-request-wrapper'
import {executionResultHandler} from './execution-result.handler'
import {serverHelloHandler} from './server-hello.handler'

export type Handler = (
  msg: any,
  send: (message: object) => void,
  authAwait: AuthAwait
) => Promise<void> | ((msg: any, send: (message) => void) => Promise<void>)

export type Routes<T extends Envelope_MessageType = Envelope_MessageType> = Partial<Record<T, Handler>>

export const routes: Routes = {
  [MsgType.ServerHello]: serverHelloHandler,
  [MsgType.ExecutionResult]: executionResultHandler,
}

export const assignHandler = (request: RequestHandler) => {
  routes[MsgType.ExecutionRequest] = (msg, send) => executionRequestWrapper(msg, send, request)
}
