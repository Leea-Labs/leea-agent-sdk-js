import {Schema} from 'ajv'
import {ajv} from './validator'
import {AgentCallResponse, AgentCallResult} from '../types/agent'

class TasksQueue {
  private queue = new Map<string, {resolve: Function; resultSchema: Schema}>()

  add(requestId: string, resultSchema: Schema) {
    const promise = new Promise<AgentCallResult>((resolve) => {
      this.queue.set(requestId, {resolve, resultSchema})
    })

    return promise
  }

  resolve(requestId: string, {result, isSuccessful}: AgentCallResponse) {
    const task = this.queue.get(requestId)
    this.queue.delete(requestId)

    if (!task) {
      console.error(`Task result wasn't expected for request ${requestId} but received`)
      return
    }

    const {resolve, resultSchema} = task
    const isValid = ajv.compile(resultSchema)(result)
    const callResult: AgentCallResult = {
      result,
      isValid,
      isSuccessful,
    }

    resolve(callResult)
  }
}

export const tasksQueue = new TasksQueue()
