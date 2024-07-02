export enum OriginMessage {me, other}

export interface IMessage {
  body: string;
  messageId?: string;
  origin: OriginMessage;
}