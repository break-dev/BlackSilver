import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  XMarkIcon,
  ChevronRightIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { MenuStore } from "../../../stores/menu.store";
import type { IModulo } from "../../../services/menu/dtos/menu.dto";

interface FloatingNavbarProps {
  onClose: () => void;
}

export const FloatingNavbar = ({ onClose }: FloatingNavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState<string | null>(null);

  const [menu, setMenu] = useState<IModulo[]>(() => MenuStore.getState().menu);

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = MenuStore.subscribe((state) => {
      setMenu(state.menu);
    });

    return unsubscribe;
  }, []);

  const go = (url: string) => {
    onClose();
    navigate(url);
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm 
      animate-fadeIn"
      onClick={onClose}
    >
      <nav
        className="absolute left-4 top-4 bottom-4 w-80 max-w-[85vw] 
        bg-zinc-900/95 backdrop-blur-xl rounded-2xl border border-zinc-800/50 
        shadow-2xl overflow-hidden animate-slideInLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b 
          border-zinc-800/50"
        >
          <span className="font-semibold text-white">Navegación</span>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 
            rounded-lg transition-colors"
            aria-label="Cerrar menú"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <div
          className="p-3 space-y-1 overflow-y-auto h-[calc(100%-60px)] 
          custom-scrollbar"
        >
          {/* Home */}
          <button
            onClick={() => go("/home")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl 
            text-sm font-medium transition-all ${
              location.pathname === "/home"
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <HomeIcon className="w-4 h-4" />
            Inicio
          </button>

          {/* Renderizar menu de navegacion */}
          {Array.isArray(menu) &&
            menu.map((mod) => (
              // Modulo
              <div key={mod.id_modulo || mod.nombre}>
                <button
                  onClick={() =>
                    setExpanded(expanded === mod.nombre ? null : mod.nombre)
                  }
                  className="w-full flex items-center justify-between px-3 py-2.5 
                  rounded-xl text-sm font-medium text-zinc-400 hover:text-white 
                  hover:bg-white/5 transition-all"
                >
                  <span>{mod.nombre || "Sin nombre"}</span>
                  <ChevronRightIcon
                    className={`w-4 h-4 transition-transform duration-200 ${
                      expanded === mod.nombre ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {/* Submodulos */}
                {expanded === mod.nombre && Array.isArray(mod.submodulos) && (
                  <div
                    className="ml-4 mt-1 space-y-1 border-l-2 border-zinc-800 pl-3 
                    animate-slideDown"
                  >
                    {mod.submodulos.map((sub) => (
                      <div key={sub.id_submodulo || sub.nombre}>
                        {/* Submodule header */}
                        <div
                          className="text-xs font-semibold text-zinc-500 
                          uppercase tracking-wider px-3 py-2"
                        >
                          {sub.nombre || "Sin nombre"}
                        </div>

                        {/* Secciones */}
                        {Array.isArray(sub.secciones) &&
                          sub.secciones.map((sec) => (
                            <button
                              key={sec.id_seccion || sec.nombre}
                              onClick={() => go(sec.url || "#")}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                location.pathname === sec.url
                                  ? "text-white bg-white/10 font-medium"
                                  : "text-zinc-400 hover:text-zinc-300 hover:bg-white/5"
                              }`}
                            >
                              {sec.nombre || "Sin nombre"}
                            </button>
                          ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </nav>
    </div>
  );
};
