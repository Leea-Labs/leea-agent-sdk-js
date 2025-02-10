import {ExecutionLog, ExecutionRequest, ExecutionResult} from '../../protocol/protocol'
import {RequestHandler} from '../../types/init'

export const executionRequestWrapper = async (
  msg: ExecutionRequest,
  send: (message: ExecutionResult | ExecutionLog) => void,
  callback: RequestHandler
) => {
  const logFn = (message: string) => {
    const log = ExecutionLog.create({
      requestID: msg.requestID,
      message,
    })

    send(log)
  }

  const result = await callback(msg.input, logFn)
  send(
    ExecutionResult.create({
      requestID: msg.requestID,
      isSuccessful: true,
      result,
    })
  )
}
