import { IRoute } from './unified-router.d.ts';
import { joinPaths } from './util.ts';


export class UnifiedRouter {

  private routes: IRoute[];
  private childRouters: { basePath: string, router: UnifiedRouter }[];

  private isCompiled: boolean;
  private compiledRoutes: IRoute[];


  constructor() {

    this.routes = [];
    this.childRouters = [];

    this.isCompiled = false;
    this.compiledRoutes = [];

  }


  route({ method, path, handler }: IRoute) {

    if (this.isCompiled) {
      throw new Error('router is already compiled.');
    }


    this.routes.push({
      method,
      path,
      handler,
    });

  }


  use(basePath: string, router: UnifiedRouter) {

    if (this.isCompiled) {
      throw new Error('router is already compiled.');
    }


    this.childRouters.push({
      basePath,
      router,
    });

  }


  compile() {

    if (this.isCompiled) {
      return this.compiledRoutes;
    }


    for (const route of this.routes) {
      this.compiledRoutes.push({
        ...route
      });
    }


    for (const childRouter of this.childRouters) {
      for (const route of childRouter.router.compile()) {

        this.compiledRoutes.push({
          method: route.method,
          path: joinPaths(childRouter.basePath, route.path),
          handler: route.handler,
        });

      }
    }


    this.isCompiled = true;
    return this.compiledRoutes;

  }

}