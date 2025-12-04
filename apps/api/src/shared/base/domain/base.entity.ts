export interface BaseEntityProps {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEntityProps<T> {
  id: string;
  props: T;
  createdAt?: Date;
  updatedAt?: Date;
}

export abstract class Entity<EntityProps> {
  protected _id: string;
  protected readonly props: EntityProps;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;

  constructor({ id, props, createdAt, updatedAt }: CreateEntityProps<EntityProps>) {
    this.setId(id);
    const now = new Date();
    this._createdAt = createdAt || now;
    this._updatedAt = updatedAt || now;
    this.props = props;

    this.validate();
  }

  private setId(id: string): void {
    this._id = id;
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

  getProps(): EntityProps & BaseEntityProps {
    const propsCopy = {
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      ...this.props,
    };
    return Object.freeze(propsCopy);
  }

  public equals(object?: Entity<EntityProps>): boolean {
    if (object === null || object === undefined) {
      return false;
    }
    if (this === object) {
      return true;
    }
    if (!Entity.isEntity(object)) {
      return false;
    }
    return this.id ? this.id === object.id : false;
  }

  static isEntity(entity: unknown): entity is Entity<unknown> {
    return entity instanceof Entity;
  }

  public abstract validate(): void;
}
