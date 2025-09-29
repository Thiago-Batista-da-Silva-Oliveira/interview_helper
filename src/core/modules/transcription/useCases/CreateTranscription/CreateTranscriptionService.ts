import { ITranscriptionDTO } from '../../dtos/ITranscriptionDTO';
import { Transcription } from '../../entities/Transcription';
import { ITranscritpionRepository } from '../../repositories/ITranscriptionRepository';

export class CreateTranscriptionService {
  constructor(private transcriptionRepository: ITranscritpionRepository) {}
  async execute(data: ITranscriptionDTO): Promise<Transcription> {
    const transcription = await this.transcriptionRepository.create(data);
    return transcription;
  }
}
