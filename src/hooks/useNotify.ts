import { useUIStore } from "../stores/ui.store";
import type { IMessage } from "../shared/interfaces";

export const useNotify = () => {
  const notify = useUIStore((state) => state.notify);

  return {
    notify: (message: IMessage) => notify(message),
    notifySuccess: (content: string) => notify({ type: "success", content }),
    notifyError: (content: string) => notify({ type: "error", content }),
    notifyInfo: (content: string) => notify({ type: "info", content }),
    clearNotify: () => notify({ type: "", content: "" }),
  };
};
