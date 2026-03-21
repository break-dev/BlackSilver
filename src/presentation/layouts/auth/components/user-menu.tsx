import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../../../stores/auth.store";
import { useMenuNavegacionStore } from "../../../../stores/menu.store";
import { usePerfilStore } from "../../../../views/perfil/hooks/usePerfilStore";

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);

  const logout = () => {
    useAuthStore.getState().clearAuth();
    useMenuNavegacionStore.getState().clearMenu();
    usePerfilStore.getState().reset();
    navigate("/login");
  };

  // cerrar menu cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Boton del avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 rounded-full bg-linear-to-br from-zinc-800 
        to-zinc-900 flex items-center justify-center text-sm font-bold 
        text-zinc-200 ring-1 ring-white/10 hover:ring-white/20 
        transition-all duration-300 hover:scale-105 shadow-md overflow-hidden group"
      >
        <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <span className="relative z-10 drop-shadow-sm">
          {usuario?.nombre?.charAt(0).toUpperCase() || "U"}
        </span>
      </button>

      {/* Menu de usuario */}
      {isOpen && (
        <div
          className="absolute right-0 top-12 w-52 bg-zinc-950/90 backdrop-blur-3xl 
          border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] 
          overflow-hidden animate-slideDown ring-1 ring-white/5 z-50"
        >
          {/* Informacion del usuario */}
          <div className="px-4 py-3 border-b border-white/5 bg-white/5">
            <p className="text-[13px] font-semibold text-white truncate drop-shadow-sm">
              {usuario?.nombre || "Usuario"}
            </p>
          </div>

          {/* Items del menú */}
          <div className="p-1.5 space-y-0.5">
            {/* Ver perfil */}
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/perfil");
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl 
              hover:bg-white/10 transition-colors group"
            >
              <UserIcon className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
              <span className="text-[13px] font-medium text-zinc-300 group-hover:text-white transition-colors">
                Ver Perfil
              </span>
            </button>

            {/* Cerrar sesión */}
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl 
              hover:bg-rose-500/10 transition-colors group"
            >
              <ArrowLeftStartOnRectangleIcon className="w-4 h-4 text-rose-400/80 group-hover:text-rose-400 transition-colors" />
              <span className="text-[13px] font-medium text-rose-400/80 group-hover:text-rose-400 transition-colors">
                Cerrar Sesión
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
