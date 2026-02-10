export interface IUseHook {
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string) => void;
  setSuccess: (success: boolean) => void;
}
