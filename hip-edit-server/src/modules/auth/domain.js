// @flow
// Types for auth module

export type User = {
  username: string,
  password: string
}

export type LocalAuthConfig = {
  enabled: boolean,
  db: User[]
}

export type GoogleAuthConfig = {
  enabled: boolean,
  clientID: string,
  clientSecret: string,
  callbackURL: string,
  prompt?: string
}

export type JwtConfig = {
  secretKey: string,
  expiresIn?: number,
  issuer: string
}

export type EventOptions = {
  authorizationToken: string,
  methodArn: string,
  [string]: any
}

export type AuthorizerCallback = (any, any) => void;

export type AuthorizerHandler = (EventOptions, {[string]: any}, AuthorizerCallback) => Promise<void>;
