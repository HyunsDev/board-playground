import { describe, it, expect } from '@jest/globals';

import { ConsoleReporter } from './console.reporter';
import { formatDurationSeconds, runContractCheck } from './runner';

describe('test-contract', () => {
  it('matches implemented NestJS routes and access rules', () => {
    const summary = runContractCheck();

    if (!summary.success) {
      const reporter = new ConsoleReporter(summary.analysisResult, summary.nestRoutes);
      reporter.report(formatDurationSeconds(summary.durationMs), summary.extraRoutes);
    }

    expect(summary.success).toBe(true);
  });
});
