import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./components/navbar";
import { Header } from "./components/header";
import { GlobalNotification } from "./components/global-notification";
import { useMenuNav } from "../../../hooks/useMenuNav";

export const AuthLayout = () => {
  const [open, setOpen] = useState(false);
  const { getMenuNavegacion } = useMenuNav();

  useEffect(() => {
    getMenuNavegacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col">
      <GlobalNotification />
      <Header onMenuToggle={() => setOpen(true)} />
      {open && <Navbar onClose={() => setOpen(false)} />}

      <main className="flex-1 pt-24 px-4 pb-6">
        <Outlet />
      </main>
    </div>
  );
};
