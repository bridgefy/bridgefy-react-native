import type { Peer } from "../entities";
import type { IPeerRepository } from "../repositories";

export class GetPeersUseCase {
  constructor(
    private readonly peerRepository: IPeerRepository
  ) {}

  async execute(): Promise<Peer[]> {
    try {
      return await this.peerRepository.getPeers();
    } catch (error) {
      console.error('Error getting peers:', error);
      throw error;
    }
  }
}
