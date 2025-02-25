import {LeeaAgent} from '../../agent'
import {ExecutionRequest, ExecutionResult} from '../../protocol/protocol'
import {ExecutionContext, RequestHandler} from '../../types/init'

export const executionRequestWrapper = async (
  request: ExecutionRequest,
  send: (message: ExecutionResult) => void,
  callback: RequestHandler,
  agent: LeeaAgent
) => {
  const context: ExecutionContext = {
    requestId: request.requestID,
    parentId: request.parentID,
    sessionId: request.sessionID,
  }

  let data

  try {
    data = JSON.parse(request.input)
  } catch {
    data = request.input
  }

  const result = await callback(
    data,
    {
      callAgent: (agentID: string, input: string) => agent.callAgent(agentID, input, context),
      getAgent: agent.getAgent,
      getAgentsList: agent.getAgentsList,
      log: (message) => agent.log(message, context.requestId),
    },
    context
  )

  send(
    ExecutionResult.create({
      requestID: context.requestId,
      isSuccessful: true,
      result,
    })
  )
}
