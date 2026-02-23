export interface IRespuesta<T> {
  success: boolean;
  data: T | null;
  message: string; // Nuevo estándar
  error?: string; // Por eliminar
}
