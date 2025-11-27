import type { ILogsRepository } from "../repositories";

export class ClearEventsUseCase {
  constructor(
    private readonly logsRepository: ILogsRepository
  ) {}

  async execute(): Promise<void> {
    try {
      await this.logsRepository.clearEvents();
    } catch (error) {
      console.error('Error clearing events:', error);
      throw error;
    }
  }
}
