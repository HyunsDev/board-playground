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

// --- Types ---
type RouteInfo = {
  method: string;
  path: string;
  controllerName: string;
  moduleName: string;
};

type CheckResult = {
  implemented: number;
  missing: number;
  maxContentWidth: number; // 가로선 길이를 계산하기 위한 최대 너비
  results: Array<
    | {
        type: 'row';
        status: 'pass' | 'fail';
        key: string;
        routeStr: string;
        controller: string;
        indent: string;
      }
    | { type: 'group'; name: string; indent: string }
    | { type: 'separator' }
  >;
};

// --- Utilities ---

/**
 * 터미널 화면을 깨끗하게 지웁니다.
 */
function clearConsole() {
  console.clear();
}

function normalizePath(path: string): string {
  if (!path) return '/';
  const p = path.replace(/\/+/g, '/');
  return p.startsWith('/') ? p : `/${p}`;
}

/**
 * ANSI 색상 코드를 제거하여 순수 문자열 길이를 계산하기 위함
 */
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[\d+m/g, '');
}

/**
 * NestJS 초기화 로그를 완전히 숨기기 위한 더미 로거
 */
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

        controllerPaths.forEach((cPath) => {
          methodPaths.forEach((mPath) => {
            const fullPath = normalizePath(`/${cPath}/${mPath}`);
            routes.push({
              method: httpMethod,
              path: fullPath,
              controllerName,
              moduleName: module.metatype?.name || String(token),
            });
          });
        });
      }
    }
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
    const result: CheckResult = { implemented: 0, missing: 0, maxContentWidth: 0, results: [] };

    this.traverse(contractNode, matchedIndices, result);

    return { result, matchedIndices };
  }

  private updateMaxWidth(result: CheckResult, str1: string, str2: string) {
    // indent 등을 고려한 대략적인 여유값(Padding) + 10
    const len = stripAnsi(str1).length + stripAnsi(str2).length + 15;
    if (len > result.maxContentWidth) {
      result.maxContentWidth = len;
    }
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

      if (matchIndex !== -1) {
        matchedIndices.add(matchIndex);
        result.implemented++;
        const rowKey = `${indent}✔ ${currentKey} ${routeStr}`;
        const controller = this.nestRoutes[matchIndex].controllerName;

        this.updateMaxWidth(result, rowKey, controller);

        result.results.push({
          type: 'row',
          status: 'pass',
          key: currentKey,
          routeStr: chalk.gray(routeStr),
          controller: chalk.gray(controller),
          indent,
        });
      } else {
        result.missing++;
        const rowKey = `${indent}✘ ${currentKey} ${routeStr}`;
        this.updateMaxWidth(result, rowKey, '');

        result.results.push({
          type: 'row',
          status: 'fail',
          key: currentKey,
          routeStr: chalk.gray(routeStr),
          controller: '',
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

  // Mocking
  moduleBuilder.useMocker(() => ({
    onModuleInit: () => {},
    onApplicationBootstrap: () => {},
    onModuleDestroy: () => {},
    connect: () => {},
  }));

  // [수정] SilentLogger를 사용하여 초기화 로그 완전 차단
  moduleBuilder.setLogger(new SilentLogger());

  const moduleRef = await moduleBuilder.compile();
  const app = moduleRef.createNestApplication();

  // App 초기화 시에도 로그가 나올 수 있으므로 여기서도 Logger 설정
  app.useLogger(new SilentLogger());

  await app.init();
  return app;
}

async function run() {
  const startTime = performance.now();

  // 1. 콘솔 클리어
  clearConsole();

  // 2. 앱 실행 및 라우트 추출
  const app = await bootstrapTestApp();
  const extractor = new NestRouteExtractor(app);
  const nestRoutes = extractor.getRoutes();
  await app.close();

  // 3. 계약 분석
  const analyzer = new ContractAnalyzer(nestRoutes);
  const { result, matchedIndices } = analyzer.analyze(contract);

  // 4. 테이블 생성
  const table = new Table({
    head: [chalk.white.bold('Contract / Route'), chalk.white.bold('Controller')],
    wordWrap: true,
    style: {
      head: [],
      border: [],
      compact: true,
      // [수정] 오른쪽 Padding 추가하여 텍스트 여유 확보
      'padding-right': 2,
      'padding-left': 1,
    },
  });

  // [수정] 계산된 최대 너비를 이용하여 적응형 가로선 생성
  const separatorLine = chalk.gray('─'.repeat(Math.max(result.maxContentWidth, 60)));

  // 분석 결과 테이블에 추가
  result.results.forEach((item) => {
    if (item.type === 'separator') {
      // [수정] 적응형 가로선 삽입
      table.push([{ colSpan: 2, content: separatorLine }]);
    } else if (item.type === 'group') {
      table.push([`${item.indent}${chalk.white.bold(item.name)}`, '']);
    } else if (item.type === 'row') {
      const mark = item.status === 'pass' ? chalk.green('✔') : chalk.red('✘');
      const keyColor = item.status === 'pass' ? chalk.green(item.key) : chalk.red(item.key);
      table.push([`${item.indent}${mark} ${keyColor} ${item.routeStr}`, item.controller]);
    }
  });

  // Extra Routes 확인
  const extraRoutes = nestRoutes.filter((_, idx) => !matchedIndices.has(idx));
  if (extraRoutes.length > 0) {
    // Extra Routes 전에도 적응형 가로선
    table.push([{ colSpan: 2, content: separatorLine }]);
    table.push([chalk.yellow.bold('Extra Routes (In NestJS only)'), '']);
    extraRoutes.forEach((r) => {
      table.push([
        `  ${chalk.yellow('?')} ${chalk.gray(`${r.method} ${r.path}`)}`,
        chalk.gray(r.controllerName),
      ]);
    });
  }

  // 5. 결과 출력
  console.log(table.toString());
  console.log('');

  const total = result.implemented + result.missing;
  const isFail = result.missing > 0 || extraRoutes.length > 0;

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

  // [수정] 텍스트 Bold 처리 및 색상 변경
  const missingText = result.missing > 0 ? chalk.bold.red(`${result.missing} missing`) : '';
  const passedText = chalk.bold.green(`${result.implemented} passed`);
  const extraText = extraRoutes.length > 0 ? chalk.bold.yellow(`${extraRoutes.length} extra`) : '';

  const summaryParts = [missingText, passedText, extraText].filter(Boolean);

  console.log(`${chalk.bold('Tests:')}       ${summaryParts.join(', ')}, ${total} total`);

  // Time Summary
  const endTime = performance.now();
  const duration = ((endTime - startTime) / 1000).toFixed(3);
  // [수정] 시간 값 굵은 흰색으로 변경
  console.log(`${chalk.bold('Time:')}        ${chalk.bold.white(duration + ' s')}`);
  console.log();

  if (isFail) process.exit(1);
  else process.exit(0);
}

void run();
