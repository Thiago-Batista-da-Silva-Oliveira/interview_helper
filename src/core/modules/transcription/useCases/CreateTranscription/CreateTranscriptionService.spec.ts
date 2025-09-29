import { CreateTranscriptionService } from './CreateTranscriptionService';
import { ITranscritpionRepository } from '../../repositories/ITranscriptionRepository';
import { FakeTranscriptionRepository } from '../../repositories/fakes/FakeTranscriptionRepository';
import { UniqueId } from '../../../../shared/entities/value-objects/UniqueId';

describe('CreateTranscriptionService', () => {
  let sut: CreateTranscriptionService;
  let fakeTranscritpionRepository: ITranscritpionRepository;

  beforeEach(async () => {
    fakeTranscritpionRepository = new FakeTranscriptionRepository();
    sut = new CreateTranscriptionService(fakeTranscritpionRepository);
  });

  describe('create transcription service', () => {
    it('should create a transcription"', async () => {
      const transcription = await sut.execute({
        text: 'test',
        userId: new UniqueId(),
      });
      expect(transcription.text).toBe('test');
    });
  });
});
