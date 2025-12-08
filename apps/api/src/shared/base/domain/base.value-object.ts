export type Primitives = string | number | boolean;

export interface DomainPrimitive<T extends Primitives | Date> {
  value: T;
}

type ValueObjectProps<T> = T extends Primitives | Date ? DomainPrimitive<T> : T;

export abstract class ValueObject<T> {
  protected readonly props: ValueObjectProps<T>;

  constructor(props: ValueObjectProps<T>) {
    this.validate(props);
    this.props = props;
  }

  protected abstract validate(props: ValueObjectProps<T>): void;

  /**
   * 재귀적으로 Value Object의 동등성을 비교합니다.
   * JSON.stringify보다 안전하고 정확합니다.
   */
  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (vo.props === undefined) {
      return false;
    }
    return this.shallowEqual(this.props, vo.props);
  }

  /**
   * 원시 값(Primitive)을 반환하거나, 객체를 그대로 반환합니다.
   * 불변성을 위해 객체인 경우 Object.freeze 처리가 된 상태가 권장됩니다.
   */
  public unpack(): T {
    if (this.isDomainPrimitive(this.props)) {
      return this.props.value as unknown as T; // Type assertion needed for conditional types
    }
    // 객체형 VO인 경우 복사본을 리턴하여 불변성 유지 (선택 사항)
    return { ...this.props } as unknown as T;
  }

  private isDomainPrimitive(obj: unknown): obj is DomainPrimitive<T & (Primitives | Date)> {
    return (
      typeof obj === 'object' && obj !== null && 'value' in obj && Object.keys(obj).length === 1
    );
  }

  /**
   * 객체 및 배열, Date, 다른 ValueObject에 대한 재귀적 비교
   */
  private shallowEqual(objA: any, objB: any): boolean {
    if (objA === objB) return true;

    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
      return false;
    }

    // Date 객체 비교
    if (objA instanceof Date && objB instanceof Date) {
      return objA.getTime() === objB.getTime();
    }

    // 다른 Value Object인 경우 재귀 호출
    if (objA instanceof ValueObject && objB instanceof ValueObject) {
      return objA.equals(objB);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const keysA = Object.keys(objA);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(objB, key)) {
        return false;
      }
      // 재귀적 비교 수행
      if (!this.shallowEqual(objA[key], objB[key])) {
        return false;
      }
    }

    return true;
  }
}
