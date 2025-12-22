import { randomUUID } from 'crypto';

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Subject, Observable, filter, map, finalize, merge, interval } from 'rxjs';

import { SseEmitOptions, SseClientMetadata, SseScopeEnum, SseMessageEvent } from '../sse/sse.types';

@Injectable()
export class SseConnectionService implements OnModuleDestroy {
  private readonly logger = new Logger(SseConnectionService.name);
  private readonly eventSubject = new Subject<SseEmitOptions>();

  private readonly connectedClients = new Map<string, Map<string, SseClientMetadata>>();

  /**
   * SSE 스트림 연결
   */
  subscribe(userId: string, sessionId: string): Observable<SseMessageEvent> {
    // 1. Connection ID 생성 (이 물리적 연결의 고유 식별자)
    const connectionId = randomUUID();

    // 2. 메모리에 클라이언트 등록
    if (!this.connectedClients.has(userId)) {
      this.connectedClients.set(userId, new Map());
    }

    this.connectedClients.get(userId)?.set(connectionId, {
      sessionId,
      connectedAt: new Date(),
    });

    this.logger.debug(
      `[SSE] Connected: User ${userId} / Conn ${connectionId} (Total Clients: ${this.totalConnections})`,
    );

    // 3. 비즈니스 이벤트 스트림
    const eventStream = this.eventSubject.asObservable().pipe(
      filter((message) => {
        // (A) 전체 공지: 무조건 통과
        if (message.scope === SseScopeEnum.Broadcast) return true;

        // (B) 개인/그룹 알림: 타겟 목록에 내 ID가 있는지 확인
        if (message.scope === SseScopeEnum.User) {
          return message.targets?.includes(userId) ?? false;
        }
        return false;
      }),
      map(
        (message) =>
          ({
            id: randomUUID(),
            type: message.event,
            data: {
              metadata: {
                userId,
                createdAt: message.createdAt,
              },
              payload: message.payload,
            }, // 데이터 래핑
          }) satisfies SseMessageEvent,
      ),
    );

    // 4. 하트비트 스트림 (30초마다 핑 - 연결 유지)
    const heartbeatStream = interval(30000).pipe(
      map(
        () =>
          ({
            id: randomUUID(),
            type: 'Ping',
            data: {
              metadata: {
                createdAt: new Date().toISOString(),
                userId: null,
              },
              payload: {},
            },
          }) satisfies SseMessageEvent,
      ),
    );

    // 5. 스트림 병합 및 종료 처리
    return merge(eventStream, heartbeatStream).pipe(
      finalize(() => {
        this.handleDisconnect(userId, connectionId);
      }),
    );
  }

  /**
   * 이벤트 발행 (Integration Listener에서 호출)
   */
  emit(options: SseEmitOptions): void {
    // [최적화 1] 유저 타겟팅인데, 내 서버에 해당 유저가 한 명도 없으면 중단
    if (options.scope === SseScopeEnum.User) {
      const hasLocalClient = options.targets?.some((id) => this.connectedClients.has(id));
      if (!hasLocalClient) return;
    }

    // [최적화 2] 전체 발송인데, 내 서버에 아무도 없으면 중단
    if (options.scope === SseScopeEnum.Broadcast && this.connectedClients.size === 0) {
      return;
    }

    this.eventSubject.next(options);
  }

  private handleDisconnect(userId: string, connectionId: string) {
    const userConnections = this.connectedClients.get(userId);

    if (userConnections) {
      // 해당 탭(connection)만 정확히 제거
      userConnections.delete(connectionId);

      if (userConnections.size === 0) {
        // 모든 탭이 닫히면 유저 자체를 맵에서 제거
        this.connectedClients.delete(userId);
        this.logger.debug(`[SSE] User Offline: ${userId}`);
      } else {
        this.logger.debug(`[SSE] Connection Closed: ${connectionId} (User ${userId} still online)`);
      }
    }
  }

  private get totalConnections(): number {
    let count = 0;
    for (const connections of this.connectedClients.values()) {
      count += connections.size;
    }
    return count;
  }

  onModuleDestroy() {
    this.eventSubject.complete();
  }
}
