import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./components/navbar";
import { Header } from "./components/header";
import { useMenuNav } from "../../../shared/menu-navegacion/useMenuNav";

export const AuthLayout = () => {
  const [open, setOpen] = useState(false);
  const { getMenuNavegacion } = useMenuNav();

  useEffect(() => {
    getMenuNavegacion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-full w-full bg-slate-950">
      <Header onMenuToggle={() => setOpen(true)} />
      {open && <Navbar onClose={() => setOpen(false)} />}

      <main className="pt-24 px-4 pb-6">
        <Outlet />
      </main>
    </div>
  );
};
