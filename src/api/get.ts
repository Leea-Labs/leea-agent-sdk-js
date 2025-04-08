import {HttpMethod} from './types'
import {Performer} from './core/performer'
import {Agent} from '../types/agent'

export type AgentDTO = Agent & {
  input_schema: string
  output_schema: string
}

export class AgentsGet extends Performer<
  {
    urlParams: {
      fullname: string
    }
  },
  Agent | null
> {
  protected method = HttpMethod.GET
  protected url = '/agent/{fullname}'
  protected responseTransformer = (agent: AgentDTO): Agent | null => {
    if (typeof agent !== 'object') {
      return null
    }
    return {
      ...agent,
      input_schema: JSON.parse(agent.input_schema),
      output_schema: JSON.parse(agent.output_schema),
    }
  }
}
