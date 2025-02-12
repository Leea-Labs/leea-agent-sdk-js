import {ExecutionRequest, ExecutionResult} from '../../protocol/protocol'
import {RequestHandler} from '../../types/init'

export const executionRequestWrapper = async (
  request: ExecutionRequest,
  send: (message: ExecutionResult) => void,
  callback: RequestHandler
) => {
  const context = {
    requestId: request.requestID,
    parentId: request.parentID,
    sessionId: request.sessionID,
  }

  const data = request.input

  const result = await callback(context, data)

  send(
    ExecutionResult.create({
      requestID: context.requestId,
      isSuccessful: true,
      result,
    })
  )
}
