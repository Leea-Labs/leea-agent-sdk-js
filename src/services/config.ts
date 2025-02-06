type Config = {
  [K in (typeof AppConfig.fields)[number]]: string
}

class AppConfig {
  static readonly fields = ['LEEA_API_URL', 'LEEA_WS_URL', 'NODE_ENV'] as const

  private readonly requiredFiedls: Partial<typeof AppConfig.fields> = ['LEEA_API_URL', 'LEEA_WS_URL']

  private container: Config

  constructor(initConfig: object) {
    this.init(initConfig)
    this.validate()
  }

  private init(initConfig: object): void {
    this.container = AppConfig.fields.reduce((acc, field) => {
      acc[field] = initConfig[field]!
      return acc
    }, {} as Config)
  }

  private validate(): void {
    for (const field of this.requiredFiedls) {
      if (!this.container[field!]) {
        throw new Error(`Не задан ${field}`)
      }
    }
  }

  get value(): Config {
    return this.container
  }
}

const configInstance = new AppConfig({
  LEEA_API_URL: 'https://api.leealabs.com',
  LEEA_WS_URL: 'wss://api.leealabs.com/api/v1/connect',
})

export const appConfig = configInstance.value
