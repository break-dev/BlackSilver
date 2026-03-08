import { useUIStore } from "../stores/ui.store";
import type { IMessage } from "../shared/interfaces";

export const useNotify = () => {
  const notify = useUIStore((state) => state.notify);

  return {
    notify: (message: IMessage) => notify(message),
  };
};
