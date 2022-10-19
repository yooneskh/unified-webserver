import { IMethodRoute, IRoute } from './unified-router.d.ts';
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
      throw new Error('router is alredy compiled.');
    }


    this.routes.push({
      method,
      path,
      handler,
    });

  }

  get({ path, handler }: IMethodRoute) {
    this.route({
      method: 'get',
      path,
      handler,
    });
  }

  post({ path, handler }: IMethodRoute) {
    this.route({
      method: 'post',
      path,
      handler,
    });
  }

  put({ path, handler }: IMethodRoute) {
    this.route({
      method: 'put',
      path,
      handler,
    });
  }

  patch({ path, handler }: IMethodRoute) {
    this.route({
      method: 'patch',
      path,
      handler,
    });
  }

  delete({ path, handler }: IMethodRoute) {
    this.route({
      method: 'delete',
      path,
      handler,
    });
  }

  head({ path, handler }: IMethodRoute) {
    this.route({
      method: 'head',
      path,
      handler,
    });
  }


  use(basePath: string, router: UnifiedRouter) {

    if (this.isCompiled) {
      throw new Error('router is alredy compiled.');
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