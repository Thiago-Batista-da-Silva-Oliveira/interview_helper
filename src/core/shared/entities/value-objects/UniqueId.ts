import { randomUUID } from 'node:crypto';

export class UniqueId {
  protected _id: string;

  constructor(id?: string) {
    this._id = id ?? randomUUID();
  }
}
