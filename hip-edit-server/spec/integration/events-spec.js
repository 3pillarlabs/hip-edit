import agent from 'superagent';
import AppConfig from '../../dist/modules/app-config';

describe('Events API Integration Tests', () => {
  const baseUrl = `http://localhost:${AppConfig.serverPort}`;

  describe('POST /events', () => {
    it('should post the event to the topic', (done) => {
      agent
        .post(`${baseUrl}/events`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/hal+json,application/json')
        .send({
          sessionToken: '90c01e9a-9401-4953-a0c8-f5d434d76b4d',
          eventType: 'newText',
          text: 'class Foo',
        })
        .end((error, response) => {
          expect(error).toBeNull();
          expect(response.statusCode).toEqual(201);
          done();
        });
    });
  });
});
