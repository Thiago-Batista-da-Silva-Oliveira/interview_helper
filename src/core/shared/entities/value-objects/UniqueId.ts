import { randomUUID } from 'node:crypto';

export class UniqueId {
  protected _id: string;

  constructor(id?: string) {
    this._id = id ?? randomUUID();
  }

  toString(): string {
    return this._id;
  }

  toValue(): string {
    return this._id;
  }

  equals(id?: UniqueId): boolean {
    if (id === null || id === undefined) {
      return false;
    }

    if (!(id instanceof UniqueId)) {
      return false;
    }

    return id.toValue() === this._id;
  }
}
