import { IRequestContext } from './unified-web-server.d.ts';


type D = {
  [key: string]: unknown;
};

export type IRouteHandlerReturn = unknown;

export interface IRoute {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';
  path: string;
  handler: (request: Request, context: IRequestContext) => IRouteHandlerReturn | Promise<IRouteHandlerReturn>;
}
