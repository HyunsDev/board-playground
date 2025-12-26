import { BrandId } from '@workspace/common';

import { AbstractEntity, AbstractEntityProps } from './abstract.entity';

export class EntityCollection<T extends AbstractEntity<AbstractEntityProps<BrandId>, BrandId>> {
  private _currentItems: T[] = []; // 현재 유효한 아이템들
  private _removedItems: T[] = []; // 삭제된 아이템들 (DB 반영용)
  private _newItems: Set<T> = new Set(); // 새로 추가된 아이템들

  constructor(initialItems: T[] = []) {
    this._currentItems = [...initialItems];
  }

  // 1. 조회
  get currentItems(): T[] {
    return this._currentItems;
  }

  get removedItems(): T[] {
    return this._removedItems;
  }

  // 2. 추가
  add(item: T): void {
    this._currentItems.push(item);
    this._newItems.add(item);
  }

  // 3. 삭제 (ID 기반)
  remove(item: T): void {
    // 현재 리스트에서 제거
    this._currentItems = this._currentItems.filter((i) => !i.equals(item));

    // 만약 새로 추가했다가 바로 지운거면(_newItems에 있다면), 삭제 목록에 넣을 필요 없음
    if (this._newItems.has(item)) {
      this._newItems.delete(item);
    } else {
      // DB에 있던거라면 삭제 목록에 추가
      this._removedItems.push(item);
    }
  }

  // 4. Repository가 사용할 헬퍼 메서드
  getChanges() {
    return {
      added: Array.from(this._newItems),
      removed: this._removedItems,
      current: this._currentItems, // (업데이트 여부는 엔티티 스스로 판단하거나 전체 갱신)
    };
  }
}
