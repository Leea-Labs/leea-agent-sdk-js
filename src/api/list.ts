import {HttpMethod} from './types'
import {Performer} from './core/performer'
import {Agent} from '../types/agent'

export class AgentsList extends Performer<void, Agent[]> {
  protected method = HttpMethod.GET
  protected url = '/agents'
}
