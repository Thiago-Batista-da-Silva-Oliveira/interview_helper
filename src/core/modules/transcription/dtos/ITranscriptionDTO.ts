import { UniqueId } from 'src/core/shared/entities/value-objects/UniqueId';

export interface ITranscriptionDTO {
  id?: UniqueId;
  text: string;
  userId: UniqueId;
}
