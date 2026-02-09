import type { ErrorResponse } from "../shared/response";

export interface IUseHook {
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: ErrorResponse) => void;
}
