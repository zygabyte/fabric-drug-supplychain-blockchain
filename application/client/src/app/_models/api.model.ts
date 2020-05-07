export interface ApiModel<T> {
  code: number;
  message: string;
  response: T;
}
