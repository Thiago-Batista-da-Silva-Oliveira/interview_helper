import { UniqueId } from './value-objects/UniqueId';

export class Entity<T> {
  protected props: T;
  constructor(props: T, id?: string) {
    this.props = {
      ...props,
      id: new UniqueId(id),
    };
  }
}
