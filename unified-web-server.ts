import { UnifiedRouter } from './unified-router.ts';
import { IRoute } from './unified-router.d.ts';
import { IRequestContext, TUnifiedWebServerErrorHandler } from './unified-web-server.d.ts';


export class UnifiedWebServer extends UnifiedRouter {

  private errorHandler?: TUnifiedWebServerErrorHandler;

  constructor() {
    super();
  }


  public setErrorHandler(errorHandler: TUnifiedWebServerErrorHandler) {
    this.errorHandler = errorHandler;
  }


  async listen(context: { port?: number, hostname?: string, signal?: AbortSignal, onListen?: () => void, onError?: (error: unknown) => Response | Promise<Response>, }) {

    const { port, hostname, signal, onListen, onError } = context;

    const routes = this.compile();

    const patternedRoutes: (IRoute & { pattern: URLPattern })[] = routes.map(it => ({
      ...it,
      pattern: new URLPattern({ pathname: it.path }),
    }));


    const requestHandler = async (request: Request) => {
      try {

        const targetAction = patternedRoutes.find(it => it.method === request.method.toLowerCase() && it.pattern!.test(request.url));

        if (!targetAction) {
          return new Response(`${request.method} ${new URL(request.url).pathname} not found.`, {
            status: 404,
          });
        }


        const patternResult = targetAction.pattern.exec(request.url);

        if (!patternResult) {
          return new Response(`could not process ${request.method} ${new URL(request.url).pathname} url.`, {
            status: 400,
          });
        }


        // deno-lint-ignore no-explicit-any
        let requestBody: any;
        const requestHeaders = Object.fromEntries(request.headers.entries());

        if (requestHeaders['content-type']?.includes('multipart/form-data')) {
          try {
            requestBody = await request.formData();
          }
          catch {
            return new Response(`could not parse request body as multipart form data`, {
              status: 400,
            });
          }
        }
        else if (requestHeaders['content-type']?.includes('application/x-www-form-urlencoded')) {
          try {
            requestBody = Object.fromEntries( (await request.formData()).entries() );
          }
          catch {
            return new Response(`could not parse request body as url encoded form data`, {
              status: 400,
            });
          }
        }
        else {

          requestBody = await request.text();

          if (requestHeaders['content-type']?.includes('application/json')) {
            try {
              requestBody = JSON.parse(requestBody);
            }
            catch {
              return new Response(`request indicated that content type is json but could not parse body as a json`, {
                status: 400,
              });
            }
          }

        }


        const requestContext: IRequestContext = {
          params: patternResult.pathname.groups,
          headers: requestHeaders,
          queries: Object.fromEntries(new URL(request.url).searchParams.entries()),
          body: requestBody,
        };


        let response;

        try {
          response = await targetAction.handler(request, requestContext);
        }
        catch (error) {

          if (!this.errorHandler) {
            throw error;
          }

          response = await this.errorHandler(error);

        }


        if (response instanceof Response) {
          return response;
        }

        if (typeof response === 'object' || typeof response === 'undefined' || typeof response === 'boolean') {
          return Response.json(response);
        }

        return new Response(String(response));

      }
      catch (error) {

        console.error('could not process request', request);
        console.error(error);

        return new Response('Could not process request', {
          status: 500,
        });

      }
    };

    const serveRef = Deno.serve(
      {
        port,
        hostname,
        signal,
        onListen,
        onError,
      },
      requestHandler,
    );


    await serveRef.finished;

  }

}
