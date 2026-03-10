import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { Navbar } from "./components/navbar";
import { Header } from "./components/header";
import { useMenuNav } from "../../../hooks/useMenuNav";
import { useUIStore } from "../../../stores/ui.store";

export const AuthLayout = () => {
  const [open, setOpen] = useState(false);
  const { getMenuNavegacion } = useMenuNav();
  const message = useUIStore((state) => state.message);
  const clearMessage = useUIStore((state) => state.clearMessage);

  useEffect(() => {
    getMenuNavegacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global Notification Observer
  useEffect(() => {
    if (!message.type || !message.content) return;

    const colorMap: Record<string, string> = {
      success: "green",
      error: "red",
      info: "blue",
    };

    const titleMap: Record<string, string> = {
      success: "Éxito",
      error: "Error",
      info: "Información",
    };

    notifications.show({
      title: titleMap[message.type] || "Aviso",
      message: message.content,
      color: colorMap[message.type] || "gray",
    });

    clearMessage();
  }, [message, clearMessage]);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col">
      <Header onMenuToggle={() => setOpen(true)} />
      {open && <Navbar onClose={() => setOpen(false)} />}

      <main className="flex-1 pt-24 px-4 pb-6">
        <Outlet />
      </main>
    </div>
  );
};
