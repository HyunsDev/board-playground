import 'dotenv/config';
import 'reflect-metadata';
import { performance } from 'perf_hooks';

import { contract } from '@workspace/contract';

import { ContractAnalyzer } from './contract.analyzer';
import { NestRouteExtractor } from './nest-route.extractor';
import { AnalysisResult, RouteInfo } from './types';
import { AppModule } from '../../src/app.module';

export type ContractCheckSummary = {
  analysisResult: AnalysisResult;
  nestRoutes: RouteInfo[];
  extraRoutes: RouteInfo[];
  durationMs: number;
  success: boolean;
};

export function runContractCheck(): ContractCheckSummary {
  const startTime = performance.now();

  const extractor = new NestRouteExtractor(AppModule);
  const nestRoutes = extractor.getRoutes();

  const analyzer = new ContractAnalyzer(nestRoutes);
  const analysisResult = analyzer.analyze(contract);

  const extraRoutes = nestRoutes.filter((_, idx) => !analysisResult.matchedIndices.has(idx));
  const success = isContractSuccess(analysisResult, extraRoutes);

  const durationMs = performance.now() - startTime;

  return { analysisResult, nestRoutes, extraRoutes, durationMs, success };
}

export function formatDurationSeconds(durationMs: number): string {
  return (durationMs / 1000).toFixed(3);
}

export function isContractSuccess(
  analysisResult: AnalysisResult,
  extraRoutes: RouteInfo[],
): boolean {
  const { contractMissing, accessMissing } = analysisResult.result;
  return contractMissing === 0 && accessMissing === 0 && extraRoutes.length === 0;
}
