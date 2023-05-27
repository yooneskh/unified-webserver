import { IRouteHandlerReturn } from './unified-router.d.ts';


export interface IRequestContext {
  params: Record<string, string | undefined>;
  headers: Record<string, string>;
  queries: Record<string, string>;
  // deno-lint-ignore no-explicit-any
  body: any;
}

export type TUnifiedWebServerErrorHandler = (
  (error?: unknown) => IRouteHandlerReturn
);
