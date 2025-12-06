/* eslint-disable functional/no-expression-statements */

import { performance } from 'perf_hooks';

import { INestApplication, LoggerService, Type } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import chalk from 'chalk';
import Table from 'cli-table3';

// [User Import]
import { contract } from '@workspace/contract';

import { AppModule } from '../../src/app.module';

// --- Constants ---
const ROLES_KEY = 'roles';
const IS_PUBLIC_KEY = 'isPublic';

// --- Types ---
type RouteInfo = {
  method: string;
  path: string;
  controllerName: string;
  moduleName: string;
  accessInfo: string; // Implementation Access
};

type CheckResult = {
  contractImplemented: number;
  contractMissing: number;
  accessImplemented: number;
  accessMissing: number;
  maxContentWidth: number;
  results: Array<
    | {
        type: 'row';
        status: 'pass' | 'fail';
        accessStatus: 'match' | 'mismatch';
        key: string;
        routeStr: string;
        controller: string;
        accessDisplay: string;
        indent: string;
      }
    | { type: 'group'; name: string; indent: string }
    | { type: 'separator' }
  >;
};

// --- Utilities ---

function clearConsole() {
  const isWindows = process.platform === 'win32';
  process.stdout.write(isWindows ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');
}

function normalizePath(path: string): string {
  if (!path) return '/';
  const p = path.replace(/\/+/g, '/');
  return p.startsWith('/') ? p : `/${p}`;
}

function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[\d+m/g, '');
}

class SilentLogger implements LoggerService {
  log() {}
  error() {}
  warn() {}
  debug() {}
  verbose() {}
}

// --- Core Logic Classes ---

class NestRouteExtractor {
  constructor(private readonly app: INestApplication) {}

  public getRoutes(): RouteInfo[] {
    const modulesContainer = this.app.get(ModulesContainer);
    const reflector = this.app.get(Reflector);
    const routes: RouteInfo[] = [];
    const modules = [...modulesContainer.entries()];

    for (const [token, module] of modules) {
      const controllers = [...module.controllers.values()];
      for (const controller of controllers) {
        if (!controller.instance) continue;
        this.extractRoutesFromController(controller, module, token, reflector, routes);
      }
    }
    return routes;
  }

  private extractRoutesFromController(
    controller: any,
    module: any,
    token: any,
    reflector: Reflector,
    routes: RouteInfo[],
  ) {
    const controllerName = controller.metatype?.name || 'UnknownController';
    const controllerPaths = this.getPaths(reflector, controller.metatype);

    const prototype = Object.getPrototypeOf(controller.instance);
    const methods = Object.getOwnPropertyNames(prototype);

    for (const methodName of methods) {
      if (methodName === 'constructor') continue;
      const methodRef = prototype[methodName];
      const methodMetadata = reflector.get<number>(METHOD_METADATA, methodRef);

      if (methodMetadata !== undefined) {
        const httpMethod = this.getHttpMethodName(methodMetadata);
        const methodPaths = this.getPaths(reflector, methodRef);
        const accessInfo = this.getAccessStatus(reflector, methodRef, controller.metatype);

        controllerPaths.forEach((cPath) => {
          methodPaths.forEach((mPath) => {
            const fullPath = normalizePath(`/${cPath}/${mPath}`);
            routes.push({
              method: httpMethod,
              path: fullPath,
              controllerName,
              moduleName: module.metatype?.name || String(token),
              accessInfo,
            });
          });
        });
      }
    }
  }

  private getAccessStatus(
    reflector: Reflector,
    method: Function,
    controllerClass: Type<any>,
  ): string {
    // 1. @Public 확인
    const isPublic = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [method, controllerClass]);
    if (isPublic) return 'Public';

    // 2. @Roles / @Auth 확인
    const roles = reflector.getAllAndOverride<string[]>(ROLES_KEY, [method, controllerClass]);

    // roles가 undefined이면(데코레이터 없음) Public
    if (roles === undefined) return 'Public';

    // roles가 빈 배열이면(@Auth()만 사용) SignedIn
    if (roles.length === 0) return 'SignedIn';

    // [수정] 공백 없이 콤마로만 연결
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

class ContractAnalyzer {
  constructor(private readonly nestRoutes: RouteInfo[]) {}

  public analyze(contractNode: any): { result: CheckResult; matchedIndices: Set<number> } {
    const matchedIndices = new Set<number>();
    const result: CheckResult = {
      contractImplemented: 0,
      contractMissing: 0,
      accessImplemented: 0,
      accessMissing: 0,
      maxContentWidth: 0,
      results: [],
    };

    this.traverse(contractNode, matchedIndices, result);

    return { result, matchedIndices };
  }

  private updateMaxWidth(result: CheckResult, str1: string, str2: string, str3: string) {
    const len = stripAnsi(str1).length + stripAnsi(str2).length + stripAnsi(str3).length + 20;
    if (len > result.maxContentWidth) {
      result.maxContentWidth = len;
    }
  }

  private getContractAccess(node: any): string {
    const meta = node.metadata || {};

    if (meta.isPublic === true) {
      return 'Public';
    }

    if (Array.isArray(meta.roles) && meta.roles.length > 0) {
      // [수정] 공백 없이 콤마로만 연결
      return meta.roles.sort().join(',');
    }

    // isPublic이 undefined인 경우(실수)
    if (meta.isPublic === undefined) {
      return 'undefined';
    }

    return 'SignedIn';
  }

  private traverse(
    node: any,
    matchedIndices: Set<number>,
    result: CheckResult,
    prefixPath = '',
    accumulatedName = '',
    currentKey = '',
    depth = 0,
  ) {
    const indent = depth >= 0 ? '  '.repeat(depth) : '';

    // 1. Endpoint 확인
    if (node.method && node.path) {
      const currentMethod = node.method.toUpperCase();
      const currentPath = normalizePath(prefixPath + node.path);
      const routeStr = `(${currentMethod} ${currentPath})`;

      const matchIndex = this.nestRoutes.findIndex(
        (nr, idx) =>
          !matchedIndices.has(idx) && nr.method === currentMethod && nr.path === currentPath,
      );

      const contractAccess = this.getContractAccess(node);

      if (matchIndex !== -1) {
        matchedIndices.add(matchIndex);
        result.contractImplemented++;

        const routeInfo = this.nestRoutes[matchIndex];
        const implAccess = routeInfo.accessInfo;

        const rowKey = `${indent}✔ ${currentKey} ${routeStr}`;
        const controller = routeInfo.controllerName;

        const isAccessMatch = contractAccess === implAccess;

        let accessDisplay = '';

        // [수정] contractAccess가 'undefined'인 경우 빨간색 'undefined'만 표시
        if (contractAccess === 'undefined') {
          result.accessMissing++;
          accessDisplay = chalk.red('undefined');
        } else if (isAccessMatch) {
          result.accessImplemented++;
          accessDisplay = chalk.gray(implAccess);
        } else {
          result.accessMissing++;
          // [수정] 불일치 시 색상 변경 (Contract: 회색, Controller: 노란색)
          const expectedStr = chalk.gray(contractAccess);
          const receivedStr = chalk.yellow(implAccess);

          accessDisplay = `${expectedStr}/${receivedStr}`;
        }

        this.updateMaxWidth(result, rowKey, controller, accessDisplay);

        result.results.push({
          type: 'row',
          status: 'pass',
          accessStatus: isAccessMatch ? 'match' : 'mismatch',
          key: currentKey,
          routeStr: chalk.gray(routeStr),
          controller: chalk.gray(controller),
          accessDisplay,
          indent,
        });
      } else {
        result.contractMissing++;
        const rowKey = `${indent}✘ ${currentKey} ${routeStr}`;
        this.updateMaxWidth(result, rowKey, '', '');

        result.results.push({
          type: 'row',
          status: 'fail',
          accessStatus: 'mismatch',
          key: currentKey,
          routeStr: chalk.gray(routeStr),
          controller: '',
          accessDisplay: '',
          indent,
        });
      }
    }
    // 2. Router(그룹) 확인
    else if (typeof node === 'object' && node !== null) {
      if (depth === 0 && result.results.length > 0) {
        result.results.push({ type: 'separator' });
      }

      if (depth >= 0 && accumulatedName) {
        result.results.push({
          type: 'group',
          name: accumulatedName,
          indent,
        });
      }

      for (const key in node) {
        const nextName = accumulatedName ? `${accumulatedName}.${key}` : key;
        this.traverse(node[key], matchedIndices, result, prefixPath, nextName, key, depth + 1);
      }
    }
  }
}

// --- Main Execution ---

async function bootstrapTestApp() {
  const moduleBuilder = Test.createTestingModule({ imports: [AppModule] });

  moduleBuilder.useMocker(() => ({
    onModuleInit: () => {},
    onApplicationBootstrap: () => {},
    onModuleDestroy: () => {},
    connect: () => {},
  }));

  moduleBuilder.setLogger(new SilentLogger());

  const moduleRef = await moduleBuilder.compile();
  const app = moduleRef.createNestApplication();

  app.useLogger(new SilentLogger());

  await app.init();
  return app;
}

async function run() {
  const startTime = performance.now();

  clearConsole();

  const app = await bootstrapTestApp();
  const extractor = new NestRouteExtractor(app);
  const nestRoutes = extractor.getRoutes();
  await app.close();

  const analyzer = new ContractAnalyzer(nestRoutes);
  const { result, matchedIndices } = analyzer.analyze(contract);

  // [수정] 컬럼 순서 변경: Contract / Route | Access | Controller
  const table = new Table({
    head: [
      chalk.white.bold('Contract / Route'),
      chalk.white.bold('Access'),
      chalk.white.bold('Controller'),
    ],
    wordWrap: true,
    style: {
      head: [],
      border: [],
      compact: true,
      'padding-right': 2,
      'padding-left': 1,
    },
  });

  const separatorLine = chalk.gray('─'.repeat(Math.max(result.maxContentWidth, 60)));

  result.results.forEach((item) => {
    if (item.type === 'separator') {
      table.push([{ colSpan: 3, content: separatorLine }]);
    } else if (item.type === 'group') {
      table.push([`${item.indent}${chalk.white.bold(item.name)}`, '', '']);
    } else if (item.type === 'row') {
      const mark = item.status === 'pass' ? chalk.green('✔') : chalk.red('✘');
      const keyColor = item.status === 'pass' ? chalk.green(item.key) : chalk.red(item.key);
      // [수정] 데이터 삽입 순서 변경
      table.push([
        `${item.indent}${mark} ${keyColor} ${item.routeStr}`,
        item.accessDisplay,
        item.controller,
      ]);
    }
  });

  const extraRoutes = nestRoutes.filter((_, idx) => !matchedIndices.has(idx));
  if (extraRoutes.length > 0) {
    table.push([{ colSpan: 3, content: separatorLine }]);
    table.push([chalk.yellow.bold('Extra Routes (In NestJS only)'), '', '']);
    extraRoutes.forEach((r) => {
      // [수정] 데이터 삽입 순서 변경
      table.push([
        `  ${chalk.yellow('?')} ${chalk.gray(`${r.method} ${r.path}`)}`,
        chalk.cyan(r.accessInfo),
        chalk.gray(r.controllerName),
      ]);
    });
  }

  console.log(table.toString());
  console.log('');

  const contractTotal = result.contractImplemented + result.contractMissing;
  const accessTotal = result.accessImplemented + result.accessMissing;

  const isFail = result.contractMissing > 0 || result.accessMissing > 0 || extraRoutes.length > 0;

  if (isFail) {
    console.log(
      `${chalk.bgRed.white.bold(' FAIL ')} ${chalk.red('Contract implementation check failed.')}`,
    );
  } else {
    console.log(
      `${chalk.bgGreen.black.bold(' PASS ')} ${chalk.green('All contracts are correctly implemented.')}`,
    );
  }

  console.log();

  const contractMissingText =
    result.contractMissing > 0 ? chalk.bold.red(`${result.contractMissing} missing`) : '';
  const contractPassedText = chalk.bold.green(`${result.contractImplemented} passed`);
  const extraText = extraRoutes.length > 0 ? chalk.bold.yellow(`${extraRoutes.length} extra`) : '';
  const contractSummaryParts = [contractMissingText, contractPassedText, extraText].filter(Boolean);

  console.log(
    `${chalk.bold('Contracts:')}   ${contractSummaryParts.join(', ')}, ${contractTotal} total`,
  );

  if (contractTotal > 0) {
    const accessMissingText =
      result.accessMissing > 0 ? chalk.bold.red(`${result.accessMissing} failed`) : '';
    const accessPassedText = chalk.bold.green(`${result.accessImplemented} passed`);
    const accessSummaryParts = [accessMissingText, accessPassedText].filter(Boolean);

    console.log(
      `${chalk.bold('Access:')}      ${accessSummaryParts.join(', ')}, ${accessTotal} checked`,
    );
  }

  const endTime = performance.now();
  const duration = ((endTime - startTime) / 1000).toFixed(3);
  console.log(`${chalk.bold('Time:')}        ${chalk.bold.white(duration + ' s')}`);
  console.log();

  if (isFail) process.exit(1);
  else process.exit(0);
}

void run();
