/* eslint-disable functional/no-expression-statements */
import 'dotenv/config';
import 'reflect-metadata';

import { ConsoleReporter } from './console.reporter';
import { formatDurationSeconds, runContractCheck } from './runner';
import { clearConsole } from './utils';

async function run() {
  // 1. 콘솔 초기화
  clearConsole();

  // 2. 계약(Contract) 분석 및 비교
  const summary = runContractCheck();
  const duration = formatDurationSeconds(summary.durationMs);

  // 3. 리포팅 (테이블 출력 및 결과 요약)
  const reporter = new ConsoleReporter(summary.analysisResult, summary.nestRoutes);
  const success = reporter.report(duration, summary.extraRoutes);

  // 4. 종료 코드 설정
  if (!success) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

void run();
