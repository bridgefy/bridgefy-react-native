import type { BridgefyPropagationProfile } from "../../index";

export interface IInitializeIn {
  apiKey: string;
  verboseLogging?: boolean;
}
export interface IStartIn {
  userId?: string;
  propagationProfile?: BridgefyPropagationProfile
}