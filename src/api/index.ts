import {ValueContainer} from '../services/value-container'
import {getHttpClient} from './core/http-client'
import {AgentsGet} from './get'
import {AgentsList} from './list'

export const getApi = (tokenStorage: ValueContainer<string>) => {
  const httpClient = getHttpClient(tokenStorage)
  return {
    list: new AgentsList(httpClient).perform,
    get: new AgentsGet(httpClient).perform,
  }
}
