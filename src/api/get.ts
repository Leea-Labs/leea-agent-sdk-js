import {HttpMethod} from './types'
import {Performer} from './core/performer'
import {Agent} from '../types/agent'

export class AgentsGet extends Performer<
  {
    urlParams: {
      fullname: string
    }
  },
  Agent
> {
  protected method = HttpMethod.GET
  protected url = '/agent/{fullname}'
}
