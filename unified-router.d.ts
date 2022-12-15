import { IRequestContext } from './unified-web-server.d.ts';


export type IRouteHandlerReturn = Response | Record<string, unknown> | unknown[] | string | number | undefined;

export interface IRoute {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';
  path: string;
  handler: (request: Request, context: IRequestContext) => IRouteHandlerReturn | Promise<IRouteHandlerReturn>;
}
