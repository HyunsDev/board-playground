/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable functional/no-expression-statements */
import { AnalysisResult, CheckResult, RouteInfo } from './types';
import { normalizePath } from './utils';

export class ContractAnalyzer {
  constructor(private readonly nestRoutes: RouteInfo[]) {}

  public analyze(contractNode: any): AnalysisResult {
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

  private updateMaxWidth(result: CheckResult, str1: string, str2: string, str3: string): void {
    const len = str1.length + str2.length + str3.length + 20;
    if (len > result.maxContentWidth) {
      result.maxContentWidth = len;
    }
  }

  private getContractAccess(node: any): string {
    const meta = node.metadata || {};

    if (meta.access?.isPublic === true) {
      return 'Public';
    }

    if (Array.isArray(meta.access?.roles) && meta.access.roles.length > 0) {
      return meta.access.roles.sort().join(',');
    }

    // isPublic이 undefined인 경우 (정의 누락)
    if (meta?.access?.isPublic === undefined) {
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
  ): void {
    const indent = depth >= 0 ? '  '.repeat(depth) : '';

    // 1. Endpoint 확인 (method와 path가 존재하면 엔드포인트로 간주)
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
        const implAccess = routeInfo?.accessInfo;
        const rowKey = `${indent}✔ ${currentKey} ${routeStr}`;
        const controller = routeInfo?.controllerName ?? '';
        const isAccessMatch = contractAccess === implAccess;

        let accessDisplay = '';

        if (contractAccess === 'undefined') {
          result.accessMissing++;
          accessDisplay = 'undefined';
        } else if (isAccessMatch) {
          result.accessImplemented++;
          accessDisplay = implAccess;
        } else {
          result.accessMissing++;
          accessDisplay = `${contractAccess}/${implAccess}`;
        }

        this.updateMaxWidth(result, rowKey, controller, accessDisplay);

        void result.results.push({
          type: 'row',
          status: 'pass',
          accessStatus: isAccessMatch ? 'match' : 'mismatch',
          key: currentKey,
          routeStr,
          controller,
          accessDisplay,
          indent,
        });
      } else {
        void result.contractMissing++;
        const rowKey = `${indent}✘ ${currentKey} ${routeStr}`;
        this.updateMaxWidth(result, rowKey, '', '');

        void result.results.push({
          type: 'row',
          status: 'fail',
          accessStatus: 'mismatch',
          key: currentKey,
          routeStr,
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
        void result.results.push({
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
