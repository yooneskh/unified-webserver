import { UnifiedRouter } from './unified-router.ts';
import { IRoute } from './unified-router.d.ts';
import { IRequestContext } from './unified-web-server.d.ts';


export class UnifiedWebServer extends UnifiedRouter {

  constructor() {
    super();
  }


  listen(context: { port?: number, hostname?: string, onListen: () => void }) {

    const { port, hostname, onListen } = context;

    const routes = this.compile();

    const patternedRoutes: (IRoute & { pattern: URLPattern })[] = routes.map(it => ({
      ...it,
      pattern: new URLPattern({ pathname: it.path }),
    }));


    Deno.serve(
      async request => {

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


        const response = await targetAction.handler(request, requestContext);


        if (response instanceof Response) {
          return response;
        }

        if (typeof response === 'object' || typeof response === 'undefined') {
          return Response.json(response);
        }

        return new Response(String(response));

      },
      {
        port,
        hostname,
        onListen,
      },
    )

  }

}
