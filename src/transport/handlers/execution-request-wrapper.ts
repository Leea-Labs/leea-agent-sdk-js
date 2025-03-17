import {Schema} from 'zod'
import {LeeaAgent} from '../../agent'
import {ExecutionRequest, ExecutionResult} from '../../protocol/protocol'
import {ExecutionContext, RequestHandler} from '../../types/init'
import {parseData} from './parser'

export const executionRequestWrapper = async (
  request: ExecutionRequest,
  send: (message: ExecutionResult) => void,
  callback: RequestHandler,
  agent: LeeaAgent,
  inputSchema: Schema,
  outputSchema: Schema
) => {
  const context: ExecutionContext = {
    requestId: request.requestID,
    parentId: request.parentID,
    sessionId: request.sessionID,
  }

  const data = parseData(request.input)
  const validatedData = inputSchema.parse(data)

  const result = await callback(
    validatedData,
    {
      callAgent: (agentID: string, input: string) => agent.callAgent(agentID, input, context),
      getAgent: agent.getAgent,
      getAgentsList: agent.getAgentsList,
      log: (message) => agent.log(message, context.requestId),
    },
    context
  )

  const validatedResult = outputSchema.parse(result)

  send(
    ExecutionResult.create({
      requestID: context.requestId,
      isSuccessful: true,
      result: JSON.stringify(validatedResult),
    })
  )
}
