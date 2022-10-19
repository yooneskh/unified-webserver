

export interface IRequestContext {
  params: Record<string, string>;
  headers: Record<string, string>;
  queries: Record<string, string>;
  // deno-lint-ignore no-explicit-any
  body: any;
}
