import { AgregateRoot } from '../../../shared/entities/AgregateRoot';
import { ITranscriptionDTO } from '../dtos/ITranscriptionDTO';

export class Transcription extends AgregateRoot<ITranscriptionDTO> {
  constructor(props: ITranscriptionDTO) {
    super(props);
  }

  get text() {
    return this.props.text;
  }

  get id() {
    return this.props.id;
  }

  get userId() {
    return this.props.userId;
  }

  static create(props: ITranscriptionDTO) {
    return new Transcription(props);
  }
}
