export type Agent = {
  id: string
  name: string
  description: string
  input_schema: string
  output_schema: string
  public_key: string
  user: {username: string}
}
