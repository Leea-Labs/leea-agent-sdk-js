import * as protocol from '../protocol/protocol'

class ProtocolService {
  public pack<T extends object>(message: T): ArrayBuffer {
    for (const [msgName, msgType] of Object.entries(protocol)) {
      // @ts-ignore
      if (!msgType.typeName?.startsWith('leea_agent_protocol')) {
        continue
      }
      // @ts-ignore
      if (msgType.is(message)) {
        const e = protocol.Envelope.create({
          type: protocol.Envelope_MessageType[msgName],
          // @ts-ignore
          payload: msgType.toBinary(message),
        })
        return protocol.Envelope.toBinary(e)
      }
    }
    throw new Error('Cannot pack message')
  }

  public unpack<T extends object>(data: ArrayBuffer): [protocol.Envelope_MessageType, T] {
    const envelope = protocol.Envelope.fromBinary(data as Uint8Array)
    const type = protocol.Envelope_MessageType[envelope.type]
    return [envelope.type, protocol[type].fromBinary(envelope.payload)]
  }

  public getMessageType(message: object): protocol.Envelope_MessageType | null {
    for (const [msgName, msgType] of Object.entries(protocol)) {
      if (msgName == 'Envelope_MessageType') {
        continue
      }
      // @ts-ignore
      if (msgType.is(message)) {
        return protocol.Envelope_MessageType[msgName]
      }
    }
    return null
  }
}

export const protocolService = new ProtocolService()
