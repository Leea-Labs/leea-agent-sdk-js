import {LeeaAgent} from '../../agent'
import {ExecutionRequest, ExecutionResult} from '../../protocol/protocol'
import {ExecutionContext, RequestHandler} from '../../types/init'
import {parseData} from './parser'
import {Agent} from '../../types/agent'
import {Schema} from 'ajv'
import {ajv} from '../../services/validator'

export const executionRequestWrapper = async (
  request: ExecutionRequest,
  send: (message: ExecutionResult) => void,
  callback: RequestHandler,
  currentAgent: LeeaAgent,
  inputSchema: Schema,
  outputSchema: Schema
) => {
  const context: ExecutionContext = {
    requestId: request.requestID,
    parentId: request.parentID,
    sessionId: request.sessionID,
  }

  const data = parseData(request.input)
  const inputIsValid = ajv.compile(inputSchema)(data)
  if (!inputIsValid) {
    send(
      ExecutionResult.create({
        requestID: context.requestId,
        isSuccessful: false,
      })
    )
    return
  }

  const result = await callback(
    data,
    {
      callAgent: (agent: Agent, input: string) => currentAgent.callAgent(agent, input, context),
      getAgent: currentAgent.getAgent,
      getAgentsList: currentAgent.getAgentsList,
      log: (message) => currentAgent.log(message, context.requestId),
    },
    context
  )

  const outputIsValid = ajv.compile(outputSchema)(result)

  send(
    ExecutionResult.create({
      requestID: context.requestId,
      isSuccessful: outputIsValid,
      result: JSON.stringify(result),
    })
  )
}
