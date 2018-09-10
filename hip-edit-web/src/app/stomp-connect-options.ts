export interface StompConnectOptions {
  host: string,
  port: number,
  headers?: {login: string, passcode: string},
  domain?: string
}
