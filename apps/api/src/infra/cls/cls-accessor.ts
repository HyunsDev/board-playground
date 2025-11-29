import { ClsService } from 'nestjs-cls';

import { USER_ROLE, UserRole } from '@workspace/contract';
import { Prisma } from '@workspace/db/dist';

import { TokenPayload } from '@/shared/types';

export class ClsAccessor {
  private static cls: ClsService;

  static setClsService(service: ClsService) {
    this.cls = service;
  }

  static get<T = any>(key: string): T | undefined {
    return this.cls?.get(key);
  }

  static set<T = any>(key: string, value: T) {
    this.cls?.set(key, value);
  }

  // ---- requestId ----
  static getRequestId(): string | undefined {
    return this.get<string>('requestId');
  }

  static setRequestId(id: string) {
    this.cls?.set('requestId', id);
  }

  // ---- Prisma 트랜잭션 공유 ----
  static setTransactionClient(tx: Prisma.TransactionClient) {
    this.set('transaction', tx);
  }

  static getTransactionClient(): Prisma.TransactionClient | undefined {
    return this.get('transaction');
  }

  static clearTransactionClient() {
    this.set('transaction', undefined);
  }

  // ---- 현재 토큰 정보 ----
  private static readonly TOKEN_KEY = 'token';

  static setToken(token: TokenPayload): void {
    this.set(this.TOKEN_KEY, token);
  }

  static getToken(): TokenPayload | undefined {
    return this.get(this.TOKEN_KEY);
  }

  static getUserId(): string | undefined {
    return this.getToken()?.sub;
  }

  static getUserRole(): UserRole | undefined {
    return this.getToken()?.role;
  }

  static isUserAdmin(): boolean {
    return this.getUserRole() === USER_ROLE.ADMIN;
  }

  // ---- 클라이언트 정보 (IP, User-Agent) ----
  private static readonly CLIENT_INFO = 'clientInfo';

  static setClientInfo(info: { ip: string; userAgent: string }): void {
    this.set(this.CLIENT_INFO, info);
  }

  static getClientInfo(): { ip: string; userAgent: string } | undefined {
    return this.get(this.CLIENT_INFO);
  }

  static getClientIp(): string | undefined {
    return this.getClientInfo()?.ip;
  }

  static getClientUserAgent(): string | undefined {
    return this.getClientInfo()?.userAgent;
  }
}
