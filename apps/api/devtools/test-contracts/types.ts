export type RouteInfo = {
  method: string;
  path: string;
  controllerName: string;
  moduleName: string;
  accessInfo: string;
};

export type CheckResultRow =
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
  | { type: 'separator' };

export type CheckResult = {
  contractImplemented: number;
  contractMissing: number;
  accessImplemented: number;
  accessMissing: number;
  maxContentWidth: number;
  results: CheckResultRow[];
};

export type AnalysisResult = {
  result: CheckResult;
  matchedIndices: Set<number>;
};
