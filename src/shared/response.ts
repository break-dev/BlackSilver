export type ErrorResponse = string | string[] | object | null | undefined;

export interface IRespuesta<T> {
  success: boolean;
  data: T | null;
  error?: ErrorResponse;
}
