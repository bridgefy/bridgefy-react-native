export enum LogType {
  success = 'success',
  finish = 'finish',
  error = 'error',
  normal = 'normal',
}

export interface ILog {
  text: string;
  type?: LogType;
}
