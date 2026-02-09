import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./header";
import { FloatingNavbar } from "./navbar";

export const AuthLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-full bg-zinc-950">
      <Header onMenuToggle={() => setOpen(true)} />
      {open && <FloatingNavbar onClose={() => setOpen(false)} />}

      <main className="pt-24 px-4 pb-6">
        <Outlet />
      </main>
    </div>
  );
};
