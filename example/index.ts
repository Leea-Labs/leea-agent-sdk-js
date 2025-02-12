import { z } from 'zod'
import { LeeaAgent, RequestHandler } from '../src/'

const requestHandler: RequestHandler = (payload, log) => {
  log('First step of processing')
  return new Promise<string>((resolve) => {
    setTimeout(() => resolve(`It is very hard job to process "${payload}"`), 4000)
  })
}

export const main = async () => {
  const agent = new LeeaAgent()
  await agent.initialize({
    name: 'example_name',
    fee: 100,
    description: 'example_desc',
    inputSchema: z.string(),
    outputSchema: z.string(),
    secretPath: './example/id.json',
    apiToken: '391320f6-8584-4655-a0f7-3d64545b0721',
    requestHandler,
    visibility: 'private',
    displayName: 'My Example name',
    avatarPath: './example/avatar.png',
  });

  const someA = await agent.getAgent('abc/example_name')
  console.log(someA)

  const list = await agent.getAgentsList()
  console.log(list)
  // @ts-ignore
  const response = await agent.callAgent(list[0].id, 'Hello World!', {})
  console.log("That's what I needed! Result:", response)
}

main()
