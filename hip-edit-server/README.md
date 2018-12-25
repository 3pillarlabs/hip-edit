# Hip Edit API

APIs powered by Express for Hip Editor application. It uses awslabs/aws-serverless-express to work as an AWS Lambda handler.

# Development and Testing

Prereq:

* NodeJS (latest LTS >= v8.11.2)

ActiveMQ version is 5.x.

Global dependencies are resolved with ``npx``, thus there are no binaries on your global path. Install all dependencies with:

```bash
npm install
```

Run development server (reloads on changes):

```bash
npm run dev:start
```

Run production build:

```bash
npm start
```

Build the production distribution:

```bash
npm run build
```

Run unit tests:

```bash
npm test
```

Run integration tests:

Install Docker before the next steps.

```bash
cd hip-edit-infra/
docker network create rarity
docker run -it --rm --name='activemq' -p'61613:61613' -p'61614:61614' \
-v "$PWD/artifacts/activemq:/opt/activemq/conf" --network rarity -d webcenter/activemq
npm run integration:spec
```

AWS SAM, install from https://github.com/awslabs/aws-sam-cli

```bash
# This will take long for the first request because it dowloads a docker image on getting a request.
npm run integration:spec:sam:start
# on another terminal
npm run integration:spec:sam
# back to first terminal
# Ctrl+C (stops the sam local API listener)
docker stop activemq
```

# Configuration

Configuration can be altered with ``npm_config`` (environment variables or command line arguments). For example:
```bash
npm_config_foo_bar=baz npm start
# or
npm --hip-edit-server:foo.bar=baz start
```

Log Level

```bash
# default is debug
npm_config_logger_console_level=info npm start
```

Node Server Port

```bash
# default is 9000
npm_config_server_port=8080 npm start
```

ActiveMQ

```
# default host is localhost and STOMP port is 61613
npm_config_messaging_host=activemq.aws.com npm start
npm_config_messaging_port=23000 npm start
```

# ActiveMQ Security

## Authentication

Secure ActiveMQ authentication with either Simple Authentication or with JAAS (refer to ActiveMQ documentation). To pass ``login`` and ``passcode``:

```bash
npm_config_messaging_user=system npm_config_messaging_password=manager npm start
```

## Authorization

Hip Edit will create topics for broadcasting editor events. Topics can be created by publishers and read by consumers (or guests).

```xml
<!-- sample ActiveMQ (activemq.xml) configuration snippet shows authorization -->
<broker xmlns="http://activemq.apache.org/schema/core" brokerName="localhost" dataDirectory="${activemq.data}">
  <plugins>
    <authorizationPlugin>
      <map>
        <authorizationMap>
          <authorizationEntries>
            <authorizationEntry topic=">" read="admins" write="admins" admin="admins"/>
            <authorizationEntry topic="ActiveMQ.Advisory.>" read="publishers,guests" write="publishers,guests"   admin="publishers,guests" />
            <authorizationEntry topic="HipEdit.Editor.>" read="guests,publishers" write="publishers"          admin="publishers" />
          </authorizationEntries>
        </authorizationMap>
      </map>
    </authorizationPlugin>
  </plugins>
</broker>
```

_The Advisory topic configuration is essential unless Advisory is turned off_.

Configure the domain (default is undefined):
```bash
npm_config_messaging_user=system \
npm_config_messaging_password=manager \
npm_config_messaging_editor_topic_domain='HipEdit.Editor' \
npm_config_messaging_host=activemq.aws.com \
npm start
```
