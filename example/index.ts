import {LeeaAgent, RequestHandler} from '../src/'

const requestHandler: RequestHandler = (data, fns, _ctx) => {
  fns.log('First step of processing')
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = `It is very hard job to process "${JSON.stringify(data)}"`
      resolve(result)
    }, 4000)
  })
}

export const main = async () => {
  const agent = new LeeaAgent()
  await agent.initialize({
    name: 'example_name',
    fee: 100,
    description: 'example_desc',
    inputSchema: {
      type: 'object',
      properties: {
        hola: {type: 'integer'},
        adios: {type: 'string'},
      },
      required: ['hola', 'adios'],
      additionalProperties: false,
    },
    outputSchema: {type: 'string'},
    secretPath: './example/id.json',
    apiToken: '391320f6-8584-4655-a0f7-3d64545b0721',
    requestHandler,
    visibility: 'private',
    displayName: 'My Example name',
    avatarPath: './example/avatar.png',
  })

  const someA = await agent.getAgent('abc/twitter')
  console.log(someA)

  const list = await agent.getAgentsList()
  console.log(list)

  const payload = {
    profilesToFind: 'Top 100 AI influencers',
    summarizer: 'Define what is trending and predict future. Create post for X',
  }

  if (someA) {
    const response = await agent.callAgent<string>(someA, payload)
    console.log("That's what I needed! Result:", response)
  }
}

main()
