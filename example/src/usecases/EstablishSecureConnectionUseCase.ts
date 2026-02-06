import type { IPeerRepository } from '../repositories';

export class EstablishSecureConnectionUseCase {
  constructor(private readonly peerRepository: IPeerRepository) {}

  async execute(peerId: string): Promise<void> {
    if (!peerId || peerId.trim() === '') {
      throw new Error('Invalid peer ID');
    }

    try {
      await this.peerRepository.establishSecureConnection(peerId);
    } catch (error) {
      console.error('Error establishing secure connection:', error);
      throw error;
    }
  }
}
