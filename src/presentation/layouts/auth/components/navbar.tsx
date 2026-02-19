import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  XMarkIcon,
  ChevronRightIcon,
  HomeIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { iconos_menu_navegacion } from "../../../../shared/variables";
import { MenuStore } from "../../../../stores/menu.store";
import type { IModulo } from "../../../../services/menu/dtos/responses";

interface NavbarProps {
  onClose: () => void;
}

export const Navbar = ({ onClose }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [menu, setMenu] = useState<IModulo[]>(() => MenuStore.getState().menu);

  // Suscrubirse a los cambios del store
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
      className="fixed inset-0 z-10 bg-black/70 backdrop-blur-sm 
      animate-fadeIn"
      onClick={onClose}
    >
      <nav
        className="absolute left-4 top-4 bottom-4 w-80 max-w-[85vw] 
        bg-gray-950 backdrop-blur-xl rounded-2xl border border-zinc-800/50 
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
            text-xs font-medium transition-all ${location.pathname === "/home"
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <HomeIcon className="w-4 h-4" />
            Inicio
          </button>

          {/* Renderizar menu de navegacion */}
          {Array.isArray(menu) &&
            menu.map((mod) => {
              const modIconData = iconos_menu_navegacion.find(
                (i) => i.modulo_path === mod.path,
              );
              const ModIcon = modIconData?.icono || CubeIcon;

              return (
                // Modulo
                <div key={mod.id_modulo || mod.nombre}>
                  <button
                    onClick={() =>
                      setExpanded(expanded === mod.nombre ? null : mod.nombre)
                    }
                    className="w-full flex items-center justify-between px-3 py-2.5 
                    rounded-xl text-xs font-medium text-zinc-400 hover:text-white
                    hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <ModIcon className="w-4 h-4" />
                      <span>{mod.nombre || "Sin nombre"}</span>
                    </div>
                    <ChevronRightIcon
                      className={`w-4 h-4 transition-transform duration-200 ${expanded === mod.nombre ? "rotate-90" : ""
                        }`}
                    />
                  </button>

                  {/* Submodulos */}
                  {expanded === mod.nombre && Array.isArray(mod.submodulos) && (
                    <div
                      className="ml-4 mt-1 space-y-1 border-l-2 border-zinc-800 pl-3 
                    animate-slideDown"
                    >
                      {mod.submodulos.map((sub) => {
                        const subIconData = Array.isArray(
                          modIconData?.submodulos,
                        )
                          ? modIconData?.submodulos.find(
                            (s) => s.submodulo_path === sub.path,
                          )
                          : null;
                        const SubIcon = subIconData?.icono || CubeIcon;

                        return (
                          <div key={sub.id_submodulo || sub.nombre}>
                            {/* Submodule header */}
                            <div
                              className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 
                              uppercase tracking-wider px-3 py-2"
                            >
                              <SubIcon className="w-3.5 h-3.5" />
                              {sub.nombre || "Sin nombre"}
                            </div>

                            {/* Secciones */}
                            {Array.isArray(sub.secciones) &&
                              sub.secciones.map((sec) => (
                                <button
                                  key={sec.id_seccion || sec.nombre}
                                  onClick={() => go(sec.url || "#")}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${location.pathname === sec.url
                                      ? "text-white bg-white/10 font-medium"
                                      : "text-zinc-400 hover:text-zinc-300 hover:bg-white/5"
                                    }`}
                                >
                                  {sec.nombre || "Sin nombre"}
                                </button>
                              ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </nav>
    </div>
  );
};
