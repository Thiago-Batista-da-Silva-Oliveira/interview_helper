import { UniqueId } from '../../../shared/entities/value-objects/UniqueId';
import { ITranscriptionDTO } from '../dtos/ITranscriptionDTO';
import { Transcription } from '../entities/Transcription';

export const transcriptionFactory = (
  data?: Partial<ITranscriptionDTO>,
): Transcription => {
  const transcription = Transcription.create(
    Object.assign(
      {
        text: 'test',
        userId: new UniqueId(),
      },
      {
        ...data,
      },
    ),
  );
  return transcription;
};
