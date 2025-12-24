/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DynamicModule, ForwardReference, Type } from '@nestjs/common';
import { METHOD_METADATA, MODULE_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';

import { RouteInfo } from './types';
import { normalizePath } from './utils';

// Constants for metadata keys
const ROLES_KEY = 'roles';
const IS_PUBLIC_KEY = 'isPublic';

export class NestRouteExtractor {
  constructor(private readonly rootModule: Type<any>) {}

  public getRoutes(): RouteInfo[] {
    const reflector = new Reflector();
    const routes: RouteInfo[] = [];
    const visitedModules = new Set<Type<any>>();
    const queue: Array<Type<any> | DynamicModule> = [this.rootModule];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;

      const resolved = this.unwrapForwardRef(current);
      if (!resolved) continue;

      const { moduleClass, imports, controllers } = this.resolveModule(resolved);
      if (!moduleClass || visitedModules.has(moduleClass)) continue;

      void visitedModules.add(moduleClass);

      controllers.forEach((controller) =>
        this.extractRoutesFromController(controller, moduleClass, reflector, routes),
      );

      imports.forEach((m) => {
        const unwrapped = this.unwrapForwardRef(m);
        if (unwrapped) void queue.push(unwrapped);
      });
    }

    return routes;
  }

  private isForwardRef(moduleLike: any): moduleLike is ForwardReference<any> {
    return typeof moduleLike === 'object' && moduleLike !== null && 'forwardRef' in moduleLike;
  }

  private unwrapForwardRef(
    moduleLike?: ForwardReference | Type<any> | DynamicModule,
  ): Type<any> | DynamicModule | undefined {
    if (!moduleLike) return undefined;
    if (this.isForwardRef(moduleLike) && typeof moduleLike.forwardRef === 'function') {
      return moduleLike.forwardRef();
    }
    return moduleLike as Type<any> | DynamicModule;
  }

  private isDynamicModule(moduleLike: Type<any> | DynamicModule): moduleLike is DynamicModule {
    return typeof moduleLike === 'object' && moduleLike !== null && 'module' in moduleLike;
  }

  private resolveModule(moduleLike: Type<any> | DynamicModule): {
    moduleClass: Type<any> | undefined;
    imports: Array<Type<any> | DynamicModule>;
    controllers: Type<any>[];
  } {
    const isDynamic = this.isDynamicModule(moduleLike);
    const dynamicImports = (isDynamic ? moduleLike.imports : undefined) ?? [];
    const dynamicControllers = (isDynamic ? moduleLike.controllers : undefined) ?? [];
    const moduleClass = isDynamic ? moduleLike.module : moduleLike;

    const metaImports =
      Reflect.getMetadata(MODULE_METADATA.IMPORTS, moduleClass) ??
      ([] as Array<Type<any> | DynamicModule>);
    const metaControllers =
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, moduleClass) ?? ([] as Type<any>[]);

    return {
      moduleClass,
      imports: [...metaImports, ...dynamicImports],
      controllers: [...metaControllers, ...dynamicControllers],
    };
  }

  private extractRoutesFromController(
    controllerClass: Type<any>,
    moduleClass: Type<any>,
    reflector: Reflector,
    routes: RouteInfo[],
  ): void {
    const controllerName = controllerClass?.name || 'UnknownController';
    const controllerPaths = this.getPaths(reflector, controllerClass);

    const { prototype } = controllerClass;
    const methods = Object.getOwnPropertyNames(prototype);

    for (const methodName of methods) {
      if (methodName === 'constructor') continue;
      const methodRef = prototype[methodName];
      const methodMetadata = reflector.get<number>(METHOD_METADATA, methodRef);

      if (methodMetadata !== undefined) {
        const httpMethod = this.getHttpMethodName(methodMetadata);
        const methodPaths = this.getPaths(reflector, methodRef);
        const accessInfo = this.getAccessStatus(reflector, methodRef, controllerClass);

        controllerPaths.forEach((cPath) => {
          methodPaths.forEach((mPath) => {
            const fullPath = normalizePath(`/${cPath}/${mPath}`);
            void routes.push({
              method: httpMethod,
              path: fullPath,
              controllerName,
              moduleName: moduleClass?.name || 'UnknownModule',
              accessInfo,
            });
          });
        });
      }
    }
  }

  private getAccessStatus(reflector: Reflector, method: any, controllerClass: Type<any>): string {
    // 1. @Public 확인
    const isPublic = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [method, controllerClass]);
    if (isPublic) return 'Public';

    // 2. @Roles / @Auth 확인
    const roles = reflector.getAllAndOverride<string[]>(ROLES_KEY, [method, controllerClass]);

    // roles가 undefined이면(데코레이터 없음) Public이 아니라 SignedIn(기본값)으로 간주
    if (roles === undefined) return 'SignedIn';

    // roles가 빈 배열이면(@Auth()만 사용) SignedIn
    if (roles.length === 0) return 'SignedIn';

    // 역할 목록 반환
    return roles.sort().join(',');
  }

  private getPaths(reflector: Reflector, target: Type<any> | Function): string[] {
    const pathMetadata = reflector.get<string | string[]>(PATH_METADATA, target);
    if (Array.isArray(pathMetadata)) return pathMetadata;
    return [pathMetadata || ''];
  }

  private getHttpMethodName(methodCode: number): string {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'ALL', 'OPTIONS', 'HEAD'];
    return methods[methodCode] || 'GET';
  }
}
