import { LoggerService } from '@nestjs/common';

export function clearConsole(): void {
  const isWindows = process.platform === 'win32';
  // eslint-disable-next-line functional/no-expression-statements
  process.stdout.write(isWindows ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');
}

export function normalizePath(path: string): string {
  if (!path) return '/';
  const p = path.replace(/\/+/g, '/');
  return p.startsWith('/') ? p : `/${p}`;
}

export function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[\d+m/g, '');
}

/**
 * NestJS 애플리케이션 생성 시 로그를 억제하기 위한 더미 로거
 */
export class SilentLogger implements LoggerService {
  log(): void {}
  error(): void {}
  warn(): void {}
  debug(): void {}
  verbose(): void {}
}
