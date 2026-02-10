import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./components/navbar";
import { Header } from "./components/header";

export const AuthLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-full w-full bg-zinc-950">
      <Header onMenuToggle={() => setOpen(true)} />
      {open && <Navbar onClose={() => setOpen(false)} />}

      <main className="pt-24 px-4 pb-6">
        <Outlet />
      </main>
    </div>
  );
};
