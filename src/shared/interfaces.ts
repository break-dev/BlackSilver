export interface IRespuesta<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface IMessage {
  type: "success" | "info" | "error" | "";
  content: string;
}
