import { Outlet } from "react-router-dom";

export const PublicLayout = () => (
  <div
    className="w-full h-full flex items-center justify-center 
    bg-zinc-950"
  >
    <Outlet />
  </div>
);
