import {ServerHello} from '../../protocol/protocol'
import {Handler} from './routes'

export const serverHelloHandler: Handler = async (msg: ServerHello, send, authAwait) => {
  authAwait.resolve!()
}
