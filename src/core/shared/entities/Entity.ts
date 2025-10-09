import { UniqueId } from './value-objects/UniqueId';

export class Entity<T> {
  protected _id: UniqueId;
  protected props: T;

  constructor(props: T, id?: UniqueId | string) {
    this._id = id instanceof UniqueId ? id : new UniqueId(id);
    this.props = props;
  }

  get id(): UniqueId {
    return this._id;
  }
}
