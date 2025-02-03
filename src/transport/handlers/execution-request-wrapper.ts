import {ExecutionRequest, ExecutionResult} from '../../protocol/protocol'
import {RequestHandler} from '../../types/init'

export const executionRequestWrapper = async (
  msg: ExecutionRequest,
  send: (message: ExecutionResult) => void,
  callback: RequestHandler
) => {
  const result = await callback(msg.input)
  send(
    ExecutionResult.create({
      requestID: msg.requestID,
      isSuccessful: true,
      result,
    })
  )
}
