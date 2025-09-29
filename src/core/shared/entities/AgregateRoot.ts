import { Entity } from './Entity';

export class AgregateRoot<T> extends Entity<T> {
  constructor(props: T) {
    super(props);
  }
}
