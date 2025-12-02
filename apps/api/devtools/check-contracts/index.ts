import { INestApplication, Logger } from '@nestjs/common';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { ModulesContainer } from '@nestjs/core';
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

// --- Helpers ---

function normalizePath(path: string): string {
  if (!path) return '/';
  const p = path.replace(/\/+/g, '/');
  return p.startsWith('/') ? p : `/${p}`;
}

// NestJS 라우트 추출
function getNestRoutes(app: INestApplication): RouteInfo[] {
  const modulesContainer = app.get(ModulesContainer);
  const reflector = app.get(Reflector);
  const routes: RouteInfo[] = [];
  const modules = [...modulesContainer.entries()];

  for (const [token, module] of modules) {
    const controllers = [...module.controllers.values()];
    for (const controller of controllers) {
      if (!controller.instance) continue;

      const controllerName = controller.metatype?.name || 'UnknownController';
      const controllerPaths = reflector.get<string | string[]>(PATH_METADATA, controller.metatype);
      const cPaths = Array.isArray(controllerPaths) ? controllerPaths : [controllerPaths || ''];

      const prototype = Object.getPrototypeOf(controller.instance);
      const methods = Object.getOwnPropertyNames(prototype);

      for (const methodName of methods) {
        if (methodName === 'constructor') continue;
        const methodRef = prototype[methodName];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const methodMetadata = reflector.get<number>(METHOD_METADATA, methodRef);

        if (methodMetadata !== undefined) {
          let httpMethod = 'GET';
          switch (methodMetadata) {
            case 0:
              httpMethod = 'GET';
              break;
            case 1:
              httpMethod = 'POST';
              break;
            case 2:
              httpMethod = 'PUT';
              break;
            case 3:
              httpMethod = 'DELETE';
              break;
            case 4:
              httpMethod = 'PATCH';
              break;
            case 5:
              httpMethod = 'ALL';
              break;
            case 6:
              httpMethod = 'OPTIONS';
              break;
            case 7:
              httpMethod = 'HEAD';
              break;
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const methodPathMetadata = reflector.get<string | string[]>(PATH_METADATA, methodRef);
          const mPaths = Array.isArray(methodPathMetadata)
            ? methodPathMetadata
            : [methodPathMetadata || ''];

          cPaths.forEach((cPath) => {
            mPaths.forEach((mPath) => {
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
  }
  return routes;
}

// Contract 순회 및 테이블 Row 추가
function traverseAndCheck(
  contractNode: any,
  nestRoutes: RouteInfo[],
  matchedNestIndices: Set<number>,
  table: Table.Table,
  prefixPath = '',
  accumulatedName = '',
  currentKey = '',
  depth = 0,
): { implemented: number; missing: number } {
  let implementedCount = 0;
  let missingCount = 0;

  const indent = depth >= 0 ? '  '.repeat(depth) : '';

  // 1. Endpoint 확인
  if (contractNode.method && contractNode.path) {
    const currentMethod = contractNode.method.toUpperCase();
    const currentPath = normalizePath(prefixPath + contractNode.path);

    const matchIndex = nestRoutes.findIndex(
      (nr, idx) =>
        !matchedNestIndices.has(idx) && nr.method === currentMethod && nr.path === currentPath,
    );

    const routeStr = chalk.gray(`(${currentMethod} ${currentPath})`);

    if (matchIndex !== -1) {
      // ✅ PASS
      const matchedRoute = nestRoutes[matchIndex];
      matchedNestIndices.add(matchIndex);
      implementedCount++;

      table.push([
        `${indent}${chalk.green('✔')} ${chalk.green(currentKey)} ${routeStr}`,
        chalk.gray(matchedRoute.controllerName),
      ]);
    } else {
      // ❌ FAIL
      missingCount++;
      table.push([`${indent}${chalk.red('✘')} ${chalk.red(currentKey)} ${routeStr}`, '']);
    }
  }
  // 2. Router(그룹) 확인
  else if (typeof contractNode === 'object' && contractNode !== null) {
    // [수정] 가로선 길이 조정 (120 - margin = 115) ... 방지
    if (depth === 0 && table.length > 0) {
      table.push([{ colSpan: 2, content: chalk.gray('─'.repeat(119)) }]);
    }

    if (depth >= 0 && accumulatedName) {
      // Router 이름
      table.push([`${indent}${chalk.white.bold(accumulatedName)}`, '']);
    }

    for (const key in contractNode) {
      const value = contractNode[key];
      if (typeof value === 'object') {
        const nextName = accumulatedName ? `${accumulatedName}.${key}` : key;
        const result = traverseAndCheck(
          value,
          nestRoutes,
          matchedNestIndices,
          table,
          prefixPath,
          nextName,
          key,
          depth + 1,
        );
        implementedCount += result.implemented;
        missingCount += result.missing;
      }
    }
  }

  return { implemented: implementedCount, missing: missingCount };
}

// --- Main ---

async function run() {
  console.log();

  const moduleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });

  moduleBuilder.useMocker(() => {
    // 모든 의존성 주입 요청에 대해 '빈 객체'를 반환합니다.
    // DB 연결, 외부 API 호출 등을 원천 차단합니다.
    return {
      onModuleInit: () => {}, // Lifecycle Hook 무력화
      onApplicationBootstrap: () => {}, // Lifecycle Hook 무력화
      onModuleDestroy: () => {},
      connect: () => {}, // 혹시 모를 connect 메서드 무력화
    };
  });

  // 3. 로거 비활성화 (지저분한 초기화 로그 제거)
  moduleBuilder.setLogger(new Logger()); // 혹은 { log: () => {} } 로 완전 침묵 가능

  // 4. 컴파일 및 앱 생성
  const moduleRef = await moduleBuilder.compile();
  const app = moduleRef.createNestApplication();

  await app.init();
  const nestRoutes = getNestRoutes(app);
  await app.close();

  const table = new Table({
    head: [chalk.white.bold('Contract / Route'), chalk.white.bold('Controller')],
    colWidths: [80, 40], // 총 120 width
    wordWrap: true,
    style: {
      head: [],
      border: [],
      compact: true,
    },
  });

  const matchedNestIndices = new Set<number>();

  const { implemented, missing } = traverseAndCheck(
    contract,
    nestRoutes,
    matchedNestIndices,
    table,
    '',
    '',
    '',
    -1,
  );

  // Extra Routes
  const extraRoutes = nestRoutes.filter((_, idx) => !matchedNestIndices.has(idx));

  if (extraRoutes.length > 0) {
    // [수정] 가로선 길이 조정
    table.push([{ colSpan: 2, content: chalk.gray('─'.repeat(119)) }]);
    table.push([chalk.yellow.bold('Extra Routes (In NestJS only)'), '']);

    extraRoutes.forEach((r) => {
      table.push([
        `  ${chalk.yellow('?')} ${chalk.gray(`${r.method} ${r.path}`)}`,
        chalk.gray(r.controllerName),
      ]);
    });
  }

  // 테이블 출력
  console.log(table.toString());

  // [수정] 표와 결과 사이 구분선 제거 (공백만 둠)
  console.log('');

  const total = implemented + missing;
  const isFail = missing > 0 || extraRoutes.length > 0;

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
  console.log(
    `Tests:       ${missing > 0 ? chalk.red(`${missing} missing`) : ''}${missing > 0 && implemented > 0 ? ', ' : ''}${chalk.green(`${implemented} passed`)}${extraRoutes.length > 0 ? `, ${chalk.yellow(`${extraRoutes.length} extra`)}` : ''}, ${total} total`,
  );
  console.log();

  if (isFail) process.exit(1);
  else process.exit(0);
}

void run();
