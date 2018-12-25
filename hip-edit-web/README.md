# HipEditWeb

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Start ActiveMQ docker container -
```bash
cd hip-edit-infra/
docker network create rarity
docker run -it --rm --name='activemq' -p'61613:61613' -p'61614:61614' \
-v "$PWD/artifacts/activemq:/opt/activemq/conf" --network rarity -d webcenter/activemq
```

Start `hip-edit-server` API services -
```bash
cd ../hip-edit-server
npm run integration:spec:sam:start
```

On another terminal, run `ng e2e --proxy-conf proxy.conf.json --env e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

Stop the API services by `docker stop activemq`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
