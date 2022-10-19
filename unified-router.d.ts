import { IRequestContext } from './unified-web-server.d.ts';


export interface IRoute {
  method: string;
  path: string;
  handler: (request: Request, context: IRequestContext) => Response | Promise<Response>;
}

export type IMethodRoute = Omit<IRoute, 'method'>;
