import { Outlet } from "react-router-dom";

export const PublicLayout = () => (
  <div
    className="w-full h-full flex items-center justify-center 
    bg-slate-950 bg-linear-to-tr from-gray-950 to-slate-900"
  >
    <Outlet />
  </div>
);
