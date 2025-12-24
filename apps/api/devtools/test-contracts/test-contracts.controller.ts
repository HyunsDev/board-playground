import { Controller, Get, Header } from '@nestjs/common';

import { formatDurationSeconds, runContractCheck } from './runner';
import { renderHtml } from './view.renderer';

@Controller()
export class TestContractsController {
  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  getReport(): string {
    const summary = runContractCheck();
    return renderHtml({
      summary,
      durationSeconds: formatDurationSeconds(summary.durationMs),
    });
  }
}
