import type { SDKEvent } from '../entities/iSDKEvent';
import type { ILogsRepository } from '../repositories';

export class GetEventsUseCase {
  constructor(private readonly logsRepository: ILogsRepository) {}

  async execute(): Promise<SDKEvent[]> {
    try {
      return await this.logsRepository.getEvents();
    } catch (error) {
      console.error('Error getting events:', error);
      throw error;
    }
  }
}
