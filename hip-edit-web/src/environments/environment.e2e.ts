// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=e2e` then `environment.e2e.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  hipEditApiPrefix: 'he-api',
  stomp: {
    server: {
      host: 'localhost',
      port: 61614,
      headers: {
        login: 'e2e_consumer',
        passcode: 'password',
      },
      domain: 'HipEdit.Editor',
    }
  }
};
