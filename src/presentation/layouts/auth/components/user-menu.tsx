import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../../../stores/auth.store";
import { useMenuNavegacionStore } from "../../../../stores/menu.store";

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);

  const logout = () => {
    useAuthStore.getState().clearAuth();
    useMenuNavegacionStore.getState().clearMenu();
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
      {/* Boton del avatar - Reducido de w-9 a w-7 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-7 h-7 rounded-full bg-linear-to-br from-zinc-700 
        to-zinc-800 flex items-center justify-center text-xs font-semibold 
        text-white ring-2 ring-zinc-700 hover:ring-zinc-600 
        transition-all hover:scale-105"
      >
        {usuario?.nombre?.charAt(0).toUpperCase() || "U"}
      </button>

      {/* Menu de usuario */}
      {isOpen && (
        /* Ajustado top-12 a top-9 para que esté pegado al header h-11 */
        <div
          className="absolute right-0 top-9 w-44 bg-slate-950/95 backdrop-blur-xl 
          border border-zinc-800 rounded-xl shadow-xl overflow-hidden 
          animate-slideDown"
        >
          {/* Informacion del usuario */}
          <div className="px-3 py-2 border-b border-zinc-800">
            <p className="text-xs font-medium text-white truncate">
              {usuario?.nombre || "Usuario"}
            </p>
          </div>

          {/* Items del menú */}
          <div className="p-1">
            {/* Ver perfil */}
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/perfil");
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md 
              hover:bg-white/5 transition-colors group"
            >
              <UserIcon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white" />
              <span className="text-[12px] font-medium text-zinc-400 group-hover:text-white">
                Ver Perfil
              </span>
            </button>

            {/* Cerrar sesión */}
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md 
              hover:bg-red-500/10 transition-colors group"
            >
              <ArrowLeftStartOnRectangleIcon className="w-3.5 h-3.5 text-red-400/80" />
              <span className="text-xs font-medium text-red-400/80 group-hover:text-red-400">
                Cerrar Sesión
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
