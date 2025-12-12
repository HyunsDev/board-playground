export interface AbstractEntityProps {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AbstractCreateEntityProps<T> {
  id: string;
  props: T;
  createdAt?: Date;
  updatedAt?: Date;
}

export abstract class AbstractEntity<TProps> {
  protected _id: string;
  protected readonly props: TProps;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;

  constructor({ id, props, createdAt, updatedAt }: AbstractCreateEntityProps<TProps>) {
    this._id = id;
    const now = new Date();
    this._createdAt = createdAt || now;
    this._updatedAt = updatedAt || now;
    this.props = props;

    this.validate();
  }

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  getProps(): TProps & AbstractEntityProps {
    const propsCopy = {
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      ...this.props,
    };
    return Object.freeze(propsCopy);
  }

  equals(object?: AbstractEntity<TProps>): boolean {
    if (object === null || object === undefined) {
      return false;
    }
    if (this === object) {
      return true;
    }
    if (!AbstractEntity.isEntity(object)) {
      return false;
    }
    return this.id ? this.id === object.id : false;
  }

  static isEntity(entity: unknown): entity is AbstractEntity<unknown> {
    return entity instanceof AbstractEntity;
  }

  abstract validate(): void;
}
