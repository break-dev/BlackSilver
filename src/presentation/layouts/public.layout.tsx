import { Outlet, useLocation } from "react-router-dom";
import { motion } from "motion/react";

export const PublicLayout = () => {
  const { pathname } = useLocation();

  return (
    <div
      className="w-full h-full flex items-center justify-center 
      bg-slate-950 bg-linear-to-tr from-gray-950 to-slate-900 relative overflow-hidden"
    >
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-full h-full flex items-center justify-center"
      >
        <Outlet />
      </motion.div>
    </div>
  );
};
