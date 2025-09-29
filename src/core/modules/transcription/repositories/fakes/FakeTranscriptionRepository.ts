/* eslint-disable @typescript-eslint/require-await */
import { ITranscriptionDTO } from '../../dtos/ITranscriptionDTO';
import { Transcription } from '../../entities/Transcription';
import { ITranscritpionRepository } from '../ITranscriptionRepository';

export class FakeTranscriptionRepository implements ITranscritpionRepository {
  protected data: Transcription[] = [];
  async create(data: ITranscriptionDTO): Promise<Transcription> {
    const createdTranscription = Transcription.create(data);
    this.data.push(createdTranscription);
    return createdTranscription;
  }
}
