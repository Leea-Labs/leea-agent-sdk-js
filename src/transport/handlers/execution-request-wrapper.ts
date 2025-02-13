import {LeeaAgent} from '../../agent'
import {ExecutionRequest, ExecutionResult} from '../../protocol/protocol'
import {RequestHandler} from '../../types/init'

export const executionRequestWrapper = async (
  request: ExecutionRequest,
  send: (message: ExecutionResult) => void,
  callback: RequestHandler,
  agent: LeeaAgent
) => {
  const context = {
    requestId: request.requestID,
    parentId: request.parentID,
    sessionId: request.sessionID,
  }

  const data = typeof request.input === 'string' ? JSON.parse(request.input) : request.input

  const result = await callback(data, {
    callAgent: (agentID: string, input: string) => agent.callAgent(agentID, input, context),
    getAgent: agent.getAgent,
    getAgentsList: agent.getAgentsList,
    log: (message) => agent.log(message, context.requestId),
  })

  send(
    ExecutionResult.create({
      requestID: context.requestId,
      isSuccessful: true,
      result,
    })
  )
}
