import { create } from "zustand";

interface UIState {
  title: string;
  setTitle: (title: string) => void;
}

export const UIStore = create<UIState>((set) => ({
  title: "",
  setTitle: (title: string) => {
    set({ title });
    document.title = title ? `Black Silver - ${title}` : "Black Silver";
  },
}));
