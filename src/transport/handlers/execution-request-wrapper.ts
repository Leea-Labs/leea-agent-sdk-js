import {LeeaAgent} from '../../agent'
import {ExecutionRequest, ExecutionResult} from '../../protocol/protocol'
import {ExecutionContext, RequestHandler} from '../../types/init'

const parseInput = (input) => {
  try {
    return typeof input === 'string' ? JSON.parse(input) : input
  } catch {
    return input
  }
}

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

  const data = parseInput(request.input)

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
