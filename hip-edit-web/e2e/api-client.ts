import { request, IncomingMessage, ClientRequest, IncomingHttpHeaders } from 'http';
const url = require('url');

interface PostResponse {
  headers: IncomingHttpHeaders,
  data: string,
  status: number
}

export class ApiClient {
  constructor(private connection: {host: string, port: number}) {}

  createTopic(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.post('/auth/login',
                this.jsonToFormUrlEncoded({userName: 'admin', password: 'password'}),
                'application/x-www-form-urlencoded')
          .then((headersAndData) => {
            const locURL = new url.URL(headersAndData.headers.location);
            const sessionToken = locURL.searchParams.get('sessionToken');
            resolve(sessionToken);
          })
          .catch((error: Error) => reject(error));
    });
  }

  private post(path: string,
               data: string,
               contentType: string = 'application/json'): Promise<PostResponse> {
    return new Promise((resolve, reject) => {
      const guard: {
        [key: string]: any
      } = {
        resolved: false,
        rejected: false,
      };

      guard.resolve = function (params: any) {
        if (!this.rejected) {
          resolve(params);
          this.resolved = true;
        }
      }.bind(guard);

      guard.reject = function (error?: Error) {
        if (!this.resolved) {
          reject(error);
          this.rejected = true;
        }
      }.bind(guard);

      const req: ClientRequest = request({
        ...this.connection,
        method: 'POST',
        path: path,
        headers: {
          'Content-Type': contentType,
          'Content-Length': Buffer.byteLength(data)
        }
      }, (res: IncomingMessage) => {
        res.setEncoding('utf8');
        const headersAndData: PostResponse = {headers: res.headers, data: '', status: res.statusCode};
        res.on('data', (chunk: string) => headersAndData.data += chunk);
        res.on('end', () => {
          if (headersAndData.status >= 400) {
            guard.reject(new Error(`status: ${headersAndData.status}`));
          } else {
            guard.resolve(headersAndData);
          }
        });
        res.on('error', (error) => guard.reject(error));
      });

      req.on('error', (error) => guard.reject(error));
      req.write(data);
      req.end();
    });
  }

  private jsonToFormUrlEncoded(data: {[key: string]: any}): string {
    return Object.entries(data)
                 .map((e) => [e[0], encodeURI(e[1])])
                 .map((e) => e.join('='))
                 .join('&');
  }
}
