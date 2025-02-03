import Axios from 'axios'
import {authRequestInterceptor} from '../interceptors/auth.request'
import {authResponseInterceptor} from '../interceptors/auth.response'
import {appConfig} from '../../services/config'
import {ValueContainer} from '../../services/value-container'

export const getHttpClient = (tokenStorage: ValueContainer) => {
  const httpClient = Axios.create({
    baseURL: appConfig.LEEA_API_URL,
    timeout: 20000,
  })

  authRequestInterceptor.activate(httpClient, tokenStorage)
  authResponseInterceptor.activate(httpClient)
  return httpClient
}
