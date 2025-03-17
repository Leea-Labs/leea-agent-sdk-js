import {ExecutionResult} from '../../protocol/protocol'
import {tasksQueue} from '../../services/tasks-queue'
import {Handler} from './routes'
import {parseData} from './parser'

export const executionResultHandler: Handler = async (msg: ExecutionResult) => {
  tasksQueue.resolve(msg.requestID, parseData(msg.result))
}
