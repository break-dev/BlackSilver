import { useAuthStore } from "../stores/auth.store";

export const useAuthUser = () => {
  return useAuthStore((state) => state.usuario);
};
