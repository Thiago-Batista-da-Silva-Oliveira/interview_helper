import { UniqueId } from '../../../shared/entities/value-objects/UniqueId';
import { Transcription } from './Transcription';

describe('Transcription Entity', () => {
  it('should test Transcription Entity"', () => {
    const transcrition = Transcription.create({
      text: 'Esse áudio foi gerado para testar',
      userId: new UniqueId(),
    });

    expect(transcrition.text).toBe('Esse áudio foi gerado para testar');
    expect(transcrition.id).toBeInstanceOf(UniqueId);
    expect(transcrition.userId).toBeInstanceOf(UniqueId);
    expect(transcrition.id).toBeTruthy();
  });
});
