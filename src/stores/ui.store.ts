import { create } from "zustand";

interface UIState {
  title: string;
  setTitle: (title: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  title: "",
  setTitle: (title: string) => {
    set({ title });
    document.title = title ? `Black Silver - ${title}` : "Black Silver";
  },
}));
