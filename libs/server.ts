import { makeRequestHandler } from '../utils/request-handler.ts';


export interface IRoute {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';
  path: string;
  handler: IRequestHandler;
}

export type IRequestHandler = (context: IRequestContext) => unknown

export interface IRequestContext {
  request: Request;
  params: Record<string, string | undefined>;
  headers: Record<string, string>;
  queries: Record<string, string>;
  // deno-lint-ignore no-explicit-any
  body: any;
}


export class Server {

  private routes: IRoute[] = [];


  route(route: IRoute) {
    this.routes.push(route);
  }

  listen(options: Deno.ServeOptions): Deno.HttpServer {

    const handler = makeRequestHandler(this.routes);

    const server = Deno.serve(options, handler);
    return server;

  }

}
