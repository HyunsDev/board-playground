/* eslint-disable functional/no-expression-statements */
import chalk from 'chalk';
import Table from 'cli-table3';

import { AnalysisResult, RouteInfo } from './types';

export class ConsoleReporter {
  constructor(
    private readonly analysisResult: AnalysisResult,
    private readonly allNestRoutes: RouteInfo[],
  ) {}

  public report(duration: string): boolean {
    const { result, matchedIndices } = this.analysisResult;
    const { nestRoutes } = { nestRoutes: this.allNestRoutes };

    // 테이블 설정
    const table = new Table({
      head: [
        chalk.white.bold('Contract / Route'),
        chalk.white.bold('Access'),
        chalk.white.bold('Controller'),
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

    const separatorLine = chalk.gray('─'.repeat(Math.max(result.maxContentWidth, 60)));

    // 분석 결과 행 추가
    result.results.forEach((item) => {
      if (item.type === 'separator') {
        table.push([{ colSpan: 3, content: separatorLine }]);
      } else if (item.type === 'group') {
        table.push([`${item.indent}${chalk.white.bold(item.name)}`, '', '']);
      } else if (item.type === 'row') {
        const mark = item.status === 'pass' ? chalk.green('✔') : chalk.red('✘');
        const keyColor = item.status === 'pass' ? chalk.green(item.key) : chalk.red(item.key);
        table.push([
          `${item.indent}${mark} ${keyColor} ${item.routeStr}`,
          item.accessDisplay,
          item.controller,
        ]);
      }
    });

    // NestJS에만 정의된 추가 라우트 확인
    const extraRoutes = nestRoutes.filter((_, idx) => !matchedIndices.has(idx));
    if (extraRoutes.length > 0) {
      table.push([{ colSpan: 3, content: separatorLine }]);
      table.push([chalk.yellow.bold('Extra Routes (In NestJS only)'), '', '']);
      extraRoutes.forEach((r) => {
        table.push([
          `  ${chalk.yellow('?')} ${chalk.gray(`${r.method} ${r.path}`)}`,
          chalk.cyan(r.accessInfo),
          chalk.gray(r.controllerName),
        ]);
      });
    }

    console.log(table.toString());
    console.log('');

    // 최종 결과 출력
    return this.printSummary(extraRoutes.length, duration);
  }

  private printSummary(extraRoutesCount: number, duration: string): boolean {
    const { contractImplemented, contractMissing, accessImplemented, accessMissing } =
      this.analysisResult.result;

    const isFail = contractMissing > 0 || accessMissing > 0 || extraRoutesCount > 0;

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

    const contractTotal = contractImplemented + contractMissing;
    const accessTotal = accessImplemented + accessMissing;

    const contractMissingText =
      contractMissing > 0 ? chalk.bold.red(`${contractMissing} missing`) : '';
    const contractPassedText = chalk.bold.green(`${contractImplemented} passed`);
    const extraText = extraRoutesCount > 0 ? chalk.bold.yellow(`${extraRoutesCount} extra`) : '';
    const contractSummaryParts = [contractMissingText, contractPassedText, extraText].filter(
      Boolean,
    );

    console.log(
      `${chalk.bold('Contracts:')}   ${contractSummaryParts.join(', ')}, ${contractTotal} total`,
    );

    if (contractTotal > 0) {
      const accessMissingText = accessMissing > 0 ? chalk.bold.red(`${accessMissing} failed`) : '';
      const accessPassedText = chalk.bold.green(`${accessImplemented} passed`);
      const accessSummaryParts = [accessMissingText, accessPassedText].filter(Boolean);

      console.log(
        `${chalk.bold('Access:')}      ${accessSummaryParts.join(', ')}, ${accessTotal} checked`,
      );
    }

    console.log(`${chalk.bold('Time:')}        ${chalk.bold.white(duration + ' s')}`);
    console.log();

    return !isFail;
  }
}
