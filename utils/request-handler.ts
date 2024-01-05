import { IRequestContext, IRoute } from '../mod.ts';


interface IRoutePatterned extends IRoute {
  pattern: URLPattern;
}


export function makeRequestHandler(routes: IRoute[]): Deno.ServeHandler {

  const patternedRoutes: IRoutePatterned[] = routes.map(it => ({
    ...it,
    pattern: new URLPattern({ pathname: it.path }),
  }));


  return async (request, _info) => {

    /* find route */

    const route = patternedRoutes.find(it =>
      it.method === request.method.toLowerCase() && it.pattern.test(request.url)
    );

    if (!route) {
      return new Response('Path not found: ' + new URL(request.url).pathname, {
        status: 404,
      });
    }


    /* extract context */

    const headers = Object.fromEntries(request.headers.entries());
    const params = route.pattern.exec(request.url)?.pathname?.groups || {};
    const queries = Object.fromEntries(new URL(request.url).searchParams.entries());


    let body;

    if (headers['content-type']?.includes('multipart/form-data')) {
      try {
        body = await request.formData();
      }
      catch {
        return new Response(`could not parse request body as multipart form data`, {
          status: 400,
        });
      }
    }
    else if (headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      try {
        body = Object.fromEntries( (await request.formData()).entries() );
      }
      catch {
        return new Response(`could not parse request body as url encoded form data`, {
          status: 400,
        });
      }
    }
    else {

      body = await request.text();

      if (headers['content-type']?.includes('application/json')) {
        try {
          body = JSON.parse(body);
        }
        catch {
          return new Response(`request indicated that content type is json but could not parse body as a json`, {
            status: 400,
          });
        }
      }

    }


    const context: IRequestContext = {
      request,
      headers,
      params,
      queries,
      body,
    };

    
    /* response */

    const response = await route.handler(context);

    if (response instanceof Response) {
      return response;
    }

    if (typeof response === 'object' || typeof response === 'undefined' || typeof response === 'boolean' || typeof response === 'number') {
      return Response.json(response);
    }

    return new Response(String(response));

  };

}