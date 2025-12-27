/* eslint-disable functional/no-expression-statements */
import Table from 'cli-table3';

import { ansi } from './ansi';
import { AnalysisResult, CheckResultRow, RouteInfo } from './types';

export class ConsoleReporter {
  constructor(
    private readonly analysisResult: AnalysisResult,
    private readonly allNestRoutes: RouteInfo[],
  ) {}

  public report(duration: string, extraRoutes?: RouteInfo[]): boolean {
    const { result, matchedIndices } = this.analysisResult;
    const { nestRoutes } = { nestRoutes: this.allNestRoutes };
    const extraRoutesList =
      extraRoutes ?? nestRoutes.filter((_, idx) => !matchedIndices.has(idx));

    // 테이블 설정
    const table = new Table({
      head: [
        ansi.boldWhite('Contract / Route'),
        ansi.boldWhite('Access'),
        ansi.boldWhite('Controller'),
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

    const separatorLine = ansi.gray('─'.repeat(Math.max(result.maxContentWidth, 60)));

    // 분석 결과 행 추가
    result.results.forEach((item) => {
      if (item.type === 'separator') {
        table.push([{ colSpan: 3, content: separatorLine }]);
      } else if (item.type === 'group') {
        table.push([`${item.indent}${ansi.boldWhite(item.name)}`, '', '']);
      } else if (item.type === 'row') {
        const mark = item.status === 'pass' ? ansi.green('✔') : ansi.red('✘');
        const keyColor = item.status === 'pass' ? ansi.green(item.key) : ansi.red(item.key);
        const routeStr = ansi.gray(item.routeStr);
        const controller = item.controller ? ansi.gray(item.controller) : '';
        const accessDisplay = this.formatAccessDisplay(item);
        table.push([
          `${item.indent}${mark} ${keyColor} ${routeStr}`,
          accessDisplay,
          controller,
        ]);
      }
    });

    // NestJS에만 정의된 추가 라우트 확인
    if (extraRoutesList.length > 0) {
      table.push([{ colSpan: 3, content: separatorLine }]);
      table.push([ansi.boldYellow('Extra Routes (In NestJS only)'), '', '']);
      extraRoutesList.forEach((r) => {
        table.push([
          `  ${ansi.yellow('?')} ${ansi.gray(`${r.method} ${r.path}`)}`,
          ansi.cyan(r.accessInfo),
          ansi.gray(r.controllerName),
        ]);
      });
    }

    console.log(table.toString());
    console.log('');

    // 최종 결과 출력
    return this.printSummary(extraRoutesList.length, duration);
  }

  private formatAccessDisplay(row: Extract<CheckResultRow, { type: 'row' }>): string {
    if (!row.accessDisplay) return '';
    if (row.accessDisplay === 'undefined') return ansi.red('undefined');
    if (row.accessStatus === 'match') return ansi.gray(row.accessDisplay);

    const [expected, actual] = row.accessDisplay.split('/');
    const expectedStr = expected ? ansi.gray(expected) : '';
    const actualStr = actual ? ansi.yellow(actual) : '';
    if (expectedStr && actualStr) {
      return `${expectedStr}/${actualStr}`;
    }
    return ansi.yellow(row.accessDisplay);
  }

  private printSummary(extraRoutesCount: number, duration: string): boolean {
    const { contractImplemented, contractMissing, accessImplemented, accessMissing } =
      this.analysisResult.result;

    const isFail = contractMissing > 0 || accessMissing > 0 || extraRoutesCount > 0;

    if (isFail) {
      console.log(
        `${ansi.bgRedWhiteBold(' FAIL ')} ${ansi.red('Contract implementation check failed.')}`,
      );
    } else {
      console.log(
        `${ansi.bgGreenBlackBold(' PASS ')} ${ansi.green('All contracts are correctly implemented.')}`,
      );
    }

    console.log('');

    const contractTotal = contractImplemented + contractMissing;
    const accessTotal = accessImplemented + accessMissing;

    const contractMissingText =
      contractMissing > 0 ? ansi.boldRed(`${contractMissing} missing`) : '';
    const contractPassedText = ansi.boldGreen(`${contractImplemented} passed`);
    const extraText = extraRoutesCount > 0 ? ansi.boldYellow(`${extraRoutesCount} extra`) : '';
    const contractSummaryParts = [contractMissingText, contractPassedText, extraText].filter(
      Boolean,
    );

    console.log(
      `${ansi.bold('Contracts:')}   ${contractSummaryParts.join(', ')}, ${contractTotal} total`,
    );

    if (contractTotal > 0) {
      const accessMissingText = accessMissing > 0 ? ansi.boldRed(`${accessMissing} failed`) : '';
      const accessPassedText = ansi.boldGreen(`${accessImplemented} passed`);
      const accessSummaryParts = [accessMissingText, accessPassedText].filter(Boolean);

      console.log(
        `${ansi.bold('Access:')}      ${accessSummaryParts.join(', ')}, ${accessTotal} checked`,
      );
    }

    console.log(`${ansi.bold('Time:')}        ${ansi.boldWhite(duration + ' s')}`);
    console.log('');

    return !isFail;
  }
}
