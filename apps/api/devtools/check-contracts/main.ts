/* eslint-disable functional/no-expression-statements */
import 'dotenv/config';
import 'reflect-metadata';

import { performance } from 'perf_hooks';

import { contract } from '@workspace/contract';

import { ConsoleReporter } from './console.reporter';
import { ContractAnalyzer } from './contract.analyzer';
import { NestRouteExtractor } from './nest-route.extractor';
import { clearConsole } from './utils';
import { AppModule } from '../../src/app.module';

async function run() {
  const startTime = performance.now();

  // 1. 콘솔 초기화
  clearConsole();

  // 2. NestJS 라우트 추출
  const extractor = new NestRouteExtractor(AppModule);
  const nestRoutes = extractor.getRoutes();

  // 3. 계약(Contract) 분석 및 비교
  const analyzer = new ContractAnalyzer(nestRoutes);
  const analysisResult = analyzer.analyze(contract);

  // 4. 리포팅 (테이블 출력 및 결과 요약)
  const endTime = performance.now();
  const duration = ((endTime - startTime) / 1000).toFixed(3);

  const reporter = new ConsoleReporter(analysisResult, nestRoutes);
  const success = reporter.report(duration);

  // 5. 종료 코드 설정
  if (!success) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

void run();
