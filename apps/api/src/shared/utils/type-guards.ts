export function assertUnreachable(x: never): never;

// 2. [추가] 단일 타입이라서 소거되지 않고 남았을 때 (안전장치용)
export function assertUnreachable(x: { code: string }): never;

// 구현부
export function assertUnreachable(x: any): never {
  throw new Error(`처리되지 않은 케이스가 도달했습니다: ${x.code}`);
}
