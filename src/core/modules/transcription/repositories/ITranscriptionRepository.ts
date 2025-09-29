import { ITranscriptionDTO } from '../dtos/ITranscriptionDTO';
import { Transcription } from '../entities/Transcription';

export interface ITranscritpionRepository {
  create(data: ITranscriptionDTO): Promise<Transcription>;
}
