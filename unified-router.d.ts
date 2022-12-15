import { IRequestContext } from './unified-web-server.d.ts';


export type IRouteHandlerReturn = Response | Record<string, unknown> | unknown[] | string | number | undefined;

export interface IRoute {
  method: string;
  path: string;
  handler: (request: Request, context: IRequestContext) => IRouteHandlerReturn | Promise<IRouteHandlerReturn>;
}
