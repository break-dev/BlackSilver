import { create } from "zustand";
import type { IMessage } from "../shared/interfaces";

interface UIState {
  title: string;
  setTitle: (title: string) => void;
  message: IMessage;
  notify: (message: IMessage) => void;
  clearMessage: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  title: "",
  setTitle: (title: string) => {
    set({ title });
    document.title = title ? `${title} | Black Silver` : "Black Silver";
  },
  message: { type: "", content: "" },
  notify: (message: IMessage) => {
    set({ message });
  },
  clearMessage: () => {
    set({ message: { type: "", content: "" } });
  },
}));
